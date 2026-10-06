import { ALLOWED_DURATIONS, ALLOWED_PITCHES, BPM, DEFAULT_DURATION_TICK, LOOP_END_TICK, MAX_USER_NOTES, PPQ, USER_END_TICK } from "./constants.js";
import type { DrumEvent, DrumInstrument, NoteEvent, StarScoreProject } from "./types.js";

const nightSailNotes: NoteEvent[] = [
  [60, 0, 480], [64, 480, 480], [67, 960, 480], [69, 1440, 480],
  [67, 1920, 960], [64, 2880, 960]
].map(([pitch, startTick, durationTick], index) => ({
  id: `night-${index + 1}`, pitch: pitch!, startTick: startTick!, durationTick: durationTick!,
  velocity: 0.65, origin: "user", editedByUser: false
}));

export function createProject(title = "未命名星图", notes: NoteEvent[] = []): StarScoreProject {
  const now = new Date().toISOString();
  const id = `project-${Math.random().toString(36).slice(2, 10)}`;
  return {
    schemaVersion: 1, id, title, createdAt: now, updatedAt: now, revision: 0, seedRevision: 0,
    music: { ppq: PPQ, bpm: BPM, meter: [4, 4], loopBars: 4, key: "C", scale: "major-pentatonic" },
    tracks: {
      lead: { id: "lead", events: notes.map(note => ({ ...note })) },
      bass: { id: "bass", events: createRuleBass() },
      drums: { id: "drums", events: createDefaultDrums() }
    },
    layout: { notes: Object.fromEntries(notes.map((note, index) => [note.id, { xNorm: (index + 1) / (notes.length + 1) }])) },
    mixer: { lead: { enabled: true, gain: .82 }, bass: { enabled: true, gain: .52 }, drums: { enabled: true, gain: .42 } }
  };
}

export function createRuleBass(): NoteEvent[] {
  return [36, 43, 36, 43].map((pitch, bar) => ({ id: `bass-${bar}`, pitch, startTick: bar * 1920, durationTick: 960, velocity: .48, origin: "rules", editedByUser: false }));
}

export function createDefaultDrums(): DrumEvent[] {
  const pattern: Array<DrumInstrument | null> = ["kick", null, "tap", null, "kick", null, "tap", "hat"];
  return pattern.flatMap((instrument, slot) => instrument ? [0,1,2,3].map(bar => ({ id: `drum-${bar}-${slot}`, instrument, startTick: bar * 1920 + slot * 240, velocity: instrument === "hat" ? .34 : .55, origin: "rules" as const, editedByUser: false })) : []).sort((a,b) => a.startTick-b.startTick);
}

export type ProjectCommandResult = { ok: true; project: StarScoreProject } | { ok: false; message: string };

function withLead(project: StarScoreProject, events: NoteEvent[], layout = project.layout.notes): StarScoreProject {
  return { ...project, revision: project.revision + 1, seedRevision: project.seedRevision + 1, updatedAt: new Date().toISOString(), tracks: { ...project.tracks, lead: { id: "lead", events } }, layout: { notes: layout } };
}

export function setNoteDuration(project: StarScoreProject, id: string, durationTick: number): ProjectCommandResult {
  if (!ALLOWED_DURATIONS.includes(durationTick as typeof ALLOWED_DURATIONS[number])) return { ok: false, message: "音长只能是 0.5、1 或 2 拍。" };
  const response = project.tracks.lead.events.filter(note=>note.startTick>=USER_END_TICK);
  const events = project.tracks.lead.events.filter(note=>note.startTick<USER_END_TICK).map(note => note.id === id ? { ...note, durationTick, editedByUser: true } : note);
  const timed = recalculateStartTicks(events);
  if (timed.at(-1) && timed.at(-1)!.startTick + timed.at(-1)!.durationTick > USER_END_TICK) return { ok: false, message: "音长超过前两小节的 8 拍预算，项目保持原样。" };
  return { ok: true, project: withLead(project, [...timed,...response]) };
}

export function setNoteVelocity(project: StarScoreProject, id: string, velocity: number): ProjectCommandResult {
  if (!Number.isFinite(velocity) || velocity < .1 || velocity > 1) return { ok: false, message: "力度必须在 10% 到 100% 之间。" };
  return { ok: true, project: withLead(project, project.tracks.lead.events.map(note => note.id === id ? { ...note, velocity, editedByUser: true } : note)) };
}

export function deleteNote(project: StarScoreProject, id: string): ProjectCommandResult {
  if (!project.tracks.lead.events.some(note => note.id === id)) return { ok: false, message: "没有找到要删除的星点。" };
  const layout = { ...project.layout.notes }; delete layout[id];
  const user=project.tracks.lead.events.filter(note=>note.startTick<USER_END_TICK&&note.id!==id); const response=project.tracks.lead.events.filter(note=>note.startTick>=USER_END_TICK);
  return { ok: true, project: withLead(project, [...recalculateStartTicks(user),...response], layout) };
}

export function reconnectAfter(project: StarScoreProject, fromId: string, movingId: string): ProjectCommandResult {
  if (fromId === movingId) return { ok: false, message: "不能把星点连接到自己。" };
  const events = project.tracks.lead.events.filter(note=>note.startTick<USER_END_TICK);
  const response = project.tracks.lead.events.filter(note=>note.startTick>=USER_END_TICK);
  const fromIndex = events.findIndex(note => note.id === fromId); const movingIndex = events.findIndex(note => note.id === movingId);
  if (fromIndex < 0 || movingIndex < 0) return { ok: false, message: "重连星点不存在，路径未改变。" };
  const moving = events[movingIndex]!; const rest = events.filter(note => note.id !== movingId); const anchor = rest.findIndex(note => note.id === fromId);
  rest.splice(anchor + 1, 0, moving);
  if (rest.every((note, i) => note.id === events[i]?.id)) return { ok: false, message: "星点已经位于该连接位置。" };
  return { ok: true, project: withLead(project, [...recalculateStartTicks(rest),...response]) };
}

export function setDrumSlot(project: StarScoreProject, slot: number, instrument: DrumInstrument | null): ProjectCommandResult {
  if (!Number.isInteger(slot) || slot < 0 || slot > 7) return { ok: false, message: "鼓环位置必须是 0 到 7。" };
  const without = project.tracks.drums.events.filter(event => event.startTick % 1920 !== slot * 240);
  const added = instrument ? [0,1,2,3].map(bar => ({ id: `drum-${bar}-${slot}`, instrument, startTick: bar * 1920 + slot * 240, velocity: instrument === "hat" ? .34 : .55, origin: "rules" as const, editedByUser: true })) : [];
  const drums = [...without, ...added].sort((a,b) => a.startTick-b.startTick);
  return { ok: true, project: { ...project, revision: project.revision + 1, updatedAt: new Date().toISOString(), tracks: { ...project.tracks, drums: { id: "drums", events: drums } } } };
}

export function validateProject(project: StarScoreProject): string[] {
  const user = project.tracks.lead.events.filter(note => note.startTick < USER_END_TICK);
  const response = project.tracks.lead.events.filter(note => note.startTick >= USER_END_TICK);
  const errors = validateUserNotes(user);
  if (response.length) errors.push(...validateResponseNotes(response));
  if (project.tracks.bass.events.some(note => note.startTick < 0 || note.startTick + note.durationTick > LOOP_END_TICK)) errors.push("低音事件越界");
  const slots = new Set<string>();
  project.tracks.drums.events.forEach(event => { const key = `${Math.floor(event.startTick/1920)}-${event.startTick%1920}`; if (slots.has(key)) errors.push("鼓事件重复"); slots.add(key); if (event.startTick < 0 || event.startTick >= LOOP_END_TICK || event.startTick % 240) errors.push("鼓事件越界或未量化"); });
  return errors;
}

export function validateResponseNotes(notes: NoteEvent[]): string[] {
  const errors: string[] = [];
  if (notes.length < 4 || notes.length > 8) errors.push("回应必须包含 4—8 个音符");
  let previousEnd: number = USER_END_TICK;
  notes.forEach((note, index) => {
    if (!ALLOWED_PITCHES.includes(note.pitch as typeof ALLOWED_PITCHES[number])) errors.push(`回应第 ${index + 1} 颗星音高无效`);
    if (!ALLOWED_DURATIONS.includes(note.durationTick as typeof ALLOWED_DURATIONS[number])) errors.push(`回应第 ${index + 1} 颗星时值无效`);
    if (!Number.isFinite(note.velocity) || note.velocity < .1 || note.velocity > 1) errors.push(`回应第 ${index + 1} 颗星力度无效`);
    if (!Number.isInteger(note.startTick) || note.startTick < USER_END_TICK || note.startTick % 240 !== 0) errors.push(`回应第 ${index + 1} 颗星开始时间无效`);
    if (note.startTick < previousEnd) errors.push(`回应第 ${index + 1} 颗星与前一个音符重叠`);
    if (note.startTick + note.durationTick > LOOP_END_TICK) errors.push(`回应第 ${index + 1} 颗星越过四小节边界`);
    if (note.origin !== "rules" && note.origin !== "model") errors.push(`回应第 ${index + 1} 颗星来源无效`);
    previousEnd = Math.max(previousEnd, note.startTick + note.durationTick);
  });
  if (new Set(notes.map(note => note.id)).size !== notes.length) errors.push("回应包含重复音符 ID");
  return errors;
}

export const createNightSailProject = () => createProject("夜航", nightSailNotes);
export const createBlankProject = () => createProject("新建星图");

export function recalculateStartTicks(notes: NoteEvent[]): NoteEvent[] {
  let cursor = 0;
  return notes.map(note => {
    const next = { ...note, startTick: cursor };
    cursor += note.durationTick;
    return next;
  });
}

export function validateUserNotes(notes: NoteEvent[]): string[] {
  const errors: string[] = [];
  if (notes.length > MAX_USER_NOTES) errors.push("用户星点不能超过 8 颗");
  let end = 0;
  notes.forEach((note, index) => {
    if (!ALLOWED_PITCHES.includes(note.pitch as typeof ALLOWED_PITCHES[number])) errors.push(`第 ${index + 1} 颗星音高无效`);
    if (!ALLOWED_DURATIONS.includes(note.durationTick as typeof ALLOWED_DURATIONS[number])) errors.push(`第 ${index + 1} 颗星时值无效`);
    if (!Number.isFinite(note.velocity) || note.velocity < 0.1 || note.velocity > 1) errors.push(`第 ${index + 1} 颗星力度无效`);
    if (note.startTick !== end) errors.push(`第 ${index + 1} 颗星开始时间不连续`);
    end = note.startTick + note.durationTick;
  });
  if (end > USER_END_TICK) errors.push("用户旋律超过前两小节");
  return errors;
}

export function isSerializable(project: StarScoreProject): boolean {
  try { JSON.parse(JSON.stringify(project)); return true; } catch { return false; }
}

export { ALLOWED_PITCHES, BPM, DEFAULT_DURATION_TICK, MAX_USER_NOTES, PPQ, USER_END_TICK };
