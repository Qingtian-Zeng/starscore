import { ALLOWED_PITCHES, LOOP_END_TICK, USER_END_TICK } from "./constants.js";
import { validateResponseNotes } from "./project.js";
import type { NoteEvent, ResponseCandidate, ResponseMeta, ResponseProvider, StarScoreProject } from "./types.js";

export interface ResponseRequest {
  requestId: string;
  projectId: string;
  seedRevision: number;
  music: StarScoreProject["music"];
  notes: NoteEvent[];
  candidateCount: 2;
  mode?: ResponseProvider;
}

export interface ResponsePayload {
  requestId: string;
  projectId: string;
  seedRevision: number;
  provider: ResponseProvider;
  candidates: ResponseCandidate[];
  model?: string;
}

export function createResponseRequest(project: StarScoreProject, requestId: string, mode: ResponseProvider): ResponseRequest {
  return { requestId, projectId: project.id, seedRevision: project.seedRevision, music: project.music, notes: userNotes(project).map(note => ({ ...note })), candidateCount: 2, mode };
}

export function validateResponseRequest(value: ResponseRequest): string[] {
  const errors: string[] = [];
  if (!value || typeof value !== "object") return ["请求结构无效"];
  if (!value.requestId || !value.projectId || !Number.isInteger(value.seedRevision)) errors.push("请求标识或版本无效");
  if (value.candidateCount !== 2) errors.push("候选数量必须为 2");
  if (!value.music || value.music.ppq !== 480 || value.music.bpm !== 90 || value.music.meter?.[0] !== 4 || value.music.meter?.[1] !== 4) errors.push("音乐配置无效");
  const notes = Array.isArray(value.notes) ? value.notes : [];
  if (notes.length < 4 || notes.length > 8) errors.push("原旋律必须包含 4—8 个音符");
  let cursor = 0;
  for (const note of notes) {
    if (!ALLOWED_PITCHES.includes(note.pitch as never) || ![240,480,960].includes(note.durationTick) || note.startTick !== cursor || note.origin !== "user") errors.push("原旋律不符合音阶、节奏或连续边界");
    cursor = note.startTick + note.durationTick;
  }
  if (cursor > USER_END_TICK) errors.push("原旋律越过前两小节");
  return [...new Set(errors)];
}

export function validateResponsePayload(payload: ResponsePayload, request: ResponseRequest): string[] {
  const errors: string[] = [];
  if (!payload || typeof payload !== "object" || payload.requestId !== request.requestId || payload.projectId !== request.projectId || payload.seedRevision !== request.seedRevision) errors.push("回应与当前请求不匹配");
  if (payload.provider !== "rules" && payload.provider !== "model") errors.push("回应来源无效");
  if (!Array.isArray(payload.candidates) || payload.candidates.length !== 2) return [...errors, "必须返回两个候选"];
  const seedIds = new Set(request.notes.map(note => note.id));
  const allIds = new Set(seedIds);
  payload.candidates.forEach((candidate, index) => {
    if (!candidate || candidate.label !== (index === 0 ? "A" : "B") || !candidate.id) errors.push(`候选 ${index + 1} 标识无效`);
    const notes = Array.isArray(candidate?.notes) ? candidate.notes : [];
    errors.push(...validateResponseNotes(notes));
    notes.forEach(note => { if (allIds.has(note.id)) errors.push("候选音符 ID 与项目或另一候选重复"); allIds.add(note.id); });
  });
  return [...new Set(errors)];
}

export function applyResponseCandidate(project: StarScoreProject, candidate: ResponseCandidate, provider: ResponseProvider, seedRevision: number, acceptedAt = new Date().toISOString()): StarScoreProject {
  if (seedRevision !== project.seedRevision) throw new Error("候选已过期，请重新生成。");
  const errors = validateResponseNotes(candidate.notes);
  if (errors.length) throw new Error(errors[0]);
  const originals = userNotes(project).map(note => ({ ...note }));
  const originalSnapshot = JSON.stringify(originals.map(({id,pitch,startTick,durationTick,velocity}) => ({id,pitch,startTick,durationTick,velocity})));
  const response = candidate.notes.map(note => ({ ...note, origin: provider, editedByUser: false }));
  const layout = { ...project.layout.notes };
  project.tracks.lead.events.filter(note => note.startTick >= USER_END_TICK).forEach(note => delete layout[note.id]);
  response.forEach((note, index) => { layout[note.id] = { xNorm: .58 + ((index + 1) / (response.length + 1)) * .38 }; });
  const responseMeta: ResponseMeta = { provider, seedRevision, candidateId: candidate.id, acceptedAt };
  const next: StarScoreProject = { ...project, revision: project.revision + 1, updatedAt: acceptedAt, responseMeta, tracks: { ...project.tracks, lead: { id: "lead", events: [...originals, ...response] } }, layout: { notes: layout } };
  const afterSnapshot = JSON.stringify(userNotes(next).map(({id,pitch,startTick,durationTick,velocity}) => ({id,pitch,startTick,durationTick,velocity})));
  if (afterSnapshot !== originalSnapshot || next.tracks.lead.events.at(-1)!.startTick + next.tracks.lead.events.at(-1)!.durationTick > LOOP_END_TICK) throw new Error("采用回应会改变原旋律或越界，已拒绝。");
  return next;
}

export function generateRuleCandidates(request: ResponseRequest): ResponsePayload {
  const seed = request.notes;
  const shapes = [[0,1,2,1,0,2], [2,1,0,1,3,2]];
  const durations = [[480,480,960,480,480,960], [960,480,480,480,480,960]];
  const candidates = shapes.map((shape, candidateIndex) => {
    let cursor = USER_END_TICK;
    const notes = shape.map((offset, index) => {
      const seedPitch = seed[index % seed.length]?.pitch ?? 64;
      const base = Math.max(0, ALLOWED_PITCHES.indexOf(seedPitch as never));
      const pitch = ALLOWED_PITCHES[Math.min(ALLOWED_PITCHES.length - 1, Math.max(0, base + (candidateIndex ? -offset + 1 : offset - 1)))]!;
      const durationTick = durations[candidateIndex]![index]!;
      const note: NoteEvent = { id: `${request.requestId}-${candidateIndex}-${index}`, pitch, startTick: cursor, durationTick, velocity: Math.min(.82, .58 + index * .035), origin: "rules", editedByUser: false };
      cursor += durationTick;
      return note;
    });
    return { id: `${request.requestId}-${candidateIndex}`, label: (candidateIndex === 0 ? "A" : "B") as "A"|"B", notes };
  });
  return { requestId: request.requestId, projectId: request.projectId, seedRevision: request.seedRevision, provider: "rules", candidates };
}

export const userNotes = (project: StarScoreProject) => project.tracks.lead.events.filter(note => note.startTick < USER_END_TICK);
export const acceptedResponseNotes = (project: StarScoreProject) => project.tracks.lead.events.filter(note => note.startTick >= USER_END_TICK);
