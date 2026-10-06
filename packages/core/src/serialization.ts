import { ALLOWED_PITCHES, BPM, LOOP_END_TICK, MAX_USER_NOTES, PPQ, USER_END_TICK } from "./constants.js";
import { validateProject } from "./project.js";
import type { DrumEvent, NoteEvent, StarScoreProject } from "./types.js";

export const MAX_PROJECT_FILE_BYTES = 1024 * 1024;
export const MAX_PERSISTED_EVENTS = 128;

export type ImportResult = { ok: true; project: StarScoreProject } | { ok: false; message: string };

export function exportProjectJson(project: StarScoreProject): string { return JSON.stringify(project, null, 2); }

export function importProjectJson(text: string, now = new Date()): ImportResult {
  if (new TextEncoder().encode(text).byteLength > MAX_PROJECT_FILE_BYTES) return { ok: false, message: "项目文件超过 1 MB，未导入。" };
  let value: unknown; try { value = JSON.parse(text); } catch { return { ok: false, message: "JSON 格式无效，未修改当前作品。" }; }
  const checked = validateImportedProject(value); if (!checked.ok) return checked;
  const timestamp = now.toISOString();
  return { ok: true, project: { ...checked.project, id: `project-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2,8)}`, title: `${checked.project.title} · 导入`, createdAt: timestamp, updatedAt: timestamp, revision: 0 } };
}

export function validateImportedProject(value: unknown): ImportResult {
  if (!isRecord(value)) return { ok: false, message: "项目根结构无效。" };
  if (value.schemaVersion !== 1) return { ok: false, message: typeof value.schemaVersion === "number" && value.schemaVersion > 1 ? "项目版本高于当前应用，无法安全导入。" : "项目版本无效。" };
  const project = value as unknown as StarScoreProject;
  if (!validText(project.id) || !validText(project.title, 120) || !validText(project.createdAt) || !validText(project.updatedAt)) return fail("项目标识、名称或时间无效。");
  if (!finiteInt(project.revision,0) || !finiteInt(project.seedRevision,0)) return fail("项目版本号无效。");
  if (!isRecord(project.music) || project.music.ppq !== PPQ || project.music.bpm !== BPM || project.music.loopBars !== 4 || project.music.key !== "C" || project.music.scale !== "major-pentatonic" || !Array.isArray(project.music.meter) || project.music.meter[0] !== 4 || project.music.meter[1] !== 4) return fail("音乐配置不符合当前版本。");
  if (!isRecord(project.tracks) || !isRecord(project.tracks.lead) || !isRecord(project.tracks.bass) || !isRecord(project.tracks.drums) || !Array.isArray(project.tracks.lead.events) || !Array.isArray(project.tracks.bass.events) || !Array.isArray(project.tracks.drums.events)) return fail("三声部轨道结构无效。");
  if (project.tracks.lead.id !== "lead" || project.tracks.bass.id !== "bass" || project.tracks.drums.id !== "drums") return fail("轨道 ID 无效。");
  const total = project.tracks.lead.events.length + project.tracks.bass.events.length + project.tracks.drums.events.length;
  if (total > MAX_PERSISTED_EVENTS || project.tracks.lead.events.length > MAX_USER_NOTES * 2) return fail("项目事件数量超过安全上限。");
  const userLead = project.tracks.lead.events.filter(note=>note.startTick<USER_END_TICK);
  const responseLead = project.tracks.lead.events.filter(note=>note.startTick>=USER_END_TICK);
  if (!userLead.every(note => validNote(note,"user",USER_END_TICK)) || !responseLead.every(note => validResponseNote(note)) || !project.tracks.bass.events.every(note => validNote(note,"rules",LOOP_END_TICK))) return fail("旋律、回应或低音事件字段无效。");
  if (!project.tracks.drums.events.every(validDrum)) return fail("鼓事件字段无效。");
  const ids = [...project.tracks.lead.events,...project.tracks.bass.events,...project.tracks.drums.events].map(event=>event.id);
  if (new Set(ids).size !== ids.length) return fail("项目包含重复事件 ID。");
  if (!isRecord(project.layout) || !isRecord(project.layout.notes)) return fail("星图布局无效。");
  const leadIds = new Set(project.tracks.lead.events.map(note=>note.id));
  if (Object.entries(project.layout.notes).some(([id,pos])=>!leadIds.has(id)||!isRecord(pos)||!finiteRange(pos.xNorm,0,1)) || [...leadIds].some(id=>!project.layout.notes[id])) return fail("星图布局与旋律事件不匹配。");
  if (!isRecord(project.mixer) || !(["lead","bass","drums"] as const).every(track=>isRecord(project.mixer[track])&&typeof project.mixer[track].enabled==="boolean"&&finiteRange(project.mixer[track].gain,0,1))) return fail("混音设置无效。");
  if (project.responseMeta !== undefined && (!isRecord(project.responseMeta) || !["rules","model"].includes(project.responseMeta.provider as string) || !finiteInt(project.responseMeta.seedRevision,0) || !validText(project.responseMeta.candidateId) || !validText(project.responseMeta.acceptedAt))) return fail("已采用回应的来源信息无效。");
  if (responseLead.length > 0 && project.responseMeta === undefined) return fail("回应缺少来源信息。");
  const errors = validateProject(project); if (errors.length) return fail(`项目音乐边界无效：${errors[0]}`);
  return { ok: true, project: structuredClone(project) };
}

function validNote(value: unknown, origin: "user"|"rules", endTick: number): value is NoteEvent { if(!isRecord(value)) return false; return validText(value.id)&&finiteInt(value.pitch,0,127)&&(origin!=="user"||ALLOWED_PITCHES.includes(value.pitch as typeof ALLOWED_PITCHES[number]))&&finiteInt(value.startTick,0,endTick-1)&&[240,480,960].includes(value.durationTick as number)&&value.startTick+Number(value.durationTick)<=endTick&&finiteRange(value.velocity,.1,1)&&value.origin===origin&&typeof value.editedByUser==="boolean"; }
function validResponseNote(value: unknown): value is NoteEvent { if(!isRecord(value)) return false; return validText(value.id)&&ALLOWED_PITCHES.includes(value.pitch as typeof ALLOWED_PITCHES[number])&&finiteInt(value.startTick,USER_END_TICK,LOOP_END_TICK-1)&&Number(value.startTick)%240===0&&[240,480,960].includes(value.durationTick as number)&&value.startTick+Number(value.durationTick)<=LOOP_END_TICK&&finiteRange(value.velocity,.1,1)&&(value.origin==="rules"||value.origin==="model")&&typeof value.editedByUser==="boolean"; }
function validDrum(value: unknown): value is DrumEvent { return isRecord(value)&&validText(value.id)&&["kick","tap","hat"].includes(value.instrument as string)&&finiteInt(value.startTick,0,LOOP_END_TICK-1)&&Number(value.startTick)%240===0&&finiteRange(value.velocity,.1,1)&&value.origin==="rules"&&typeof value.editedByUser==="boolean"; }
function isRecord(value: unknown): value is Record<string,unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function validText(value: unknown,max=200): value is string { return typeof value === "string"&&value.length>0&&value.length<=max; }
function finiteInt(value: unknown,min:number,max=Number.MAX_SAFE_INTEGER): value is number { return typeof value === "number"&&Number.isFinite(value)&&Number.isInteger(value)&&value>=min&&value<=max; }
function finiteRange(value: unknown,min:number,max:number): value is number { return typeof value === "number"&&Number.isFinite(value)&&value>=min&&value<=max; }
function fail(message:string):ImportResult{return{ok:false,message};}
