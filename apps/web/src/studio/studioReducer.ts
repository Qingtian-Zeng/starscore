import { DEFAULT_DURATION_TICK, MAX_USER_NOTES, applyResponseCandidate, deleteNote, reconnectAfter, recalculateStartTicks, setDrumSlot, setNoteDuration, setNoteVelocity, type DrumInstrument, type NoteEvent, type ResponseCandidate, type ResponseProvider, type StarScoreProject, USER_END_TICK } from "@starscore/core";

export interface StudioState { project: StarScoreProject; selectedId: string | null; message: string; past: StarScoreProject[]; future: StarScoreProject[]; dragOrigin: StarScoreProject | null; reconnectFromId: string | null; }
export type StudioAction =
  | { type: "load"; project: StarScoreProject; message: string } | { type: "select"; id: string }
  | { type: "add"; pitch: number; xNorm: number } | { type: "dragStart" } | { type: "move"; id: string; pitch: number; xNorm: number } | { type: "dragCommit" }
  | { type: "duration"; id: string; durationTick: number } | { type: "velocity"; id: string; velocity: number } | { type: "delete"; id: string }
  | { type: "reconnectStart"; id: string } | { type: "reconnectComplete"; id: string }
  | { type: "drum"; slot: number; instrument: DrumInstrument | null } | { type: "mixer"; track: "lead" | "bass" | "drums"; enabled: boolean }
  | { type: "rename"; title: string }
  | { type: "acceptResponse"; candidate: ResponseCandidate; provider: ResponseProvider; seedRevision: number }
  | { type: "undo" } | { type: "redo" } | { type: "message"; message: string };

export const initialStudioState = (project: StarScoreProject): StudioState => ({ project, selectedId: null, message: "拖高一颗星，听听变化。", past: [], future: [], dragOrigin: null, reconnectFromId: null });

export function studioReducer(state: StudioState, action: StudioAction): StudioState {
  if (action.type === "load") return { ...initialStudioState(action.project), message: action.message };
  if (action.type === "select") return { ...state, selectedId: action.id, message: state.reconnectFromId ? "请选择要接在当前星点之后的另一颗星。" : "已选中星点，可编辑音长、力度或顺序。" };
  if (action.type === "message") return { ...state, message: action.message };
  if (action.type === "rename") { const title=action.title.slice(0,120); return { ...state, project:{...state.project,title,revision:state.project.revision+1,updatedAt:new Date().toISOString()},past:pushHistory(state.past,state.project),future:[],message:"作品名称已更新。" }; }
  if (action.type === "acceptResponse") { try { return commit(state,applyResponseCandidate(state.project,action.candidate,action.provider,action.seedRevision),null,`已采用候选 ${action.candidate.label}，可撤销。`,state.project,null); } catch(error) { return {...state,message:error instanceof Error?error.message:"候选无法采用。"}; } }
  if (action.type === "dragStart") return state.dragOrigin ? state : { ...state, dragOrigin: cloneProject(state.project) };
  if (action.type === "dragCommit") return !state.dragOrigin || equalProject(state.dragOrigin, state.project) ? { ...state, dragOrigin: null } : { ...state, past: pushHistory(state.past, state.dragOrigin), future: [], dragOrigin: null };
  if (action.type === "undo") { const previous = state.past.at(-1); if (!previous) return { ...state, message: "没有可撤销的操作。" }; return { ...state, project: previous, past: state.past.slice(0,-1), future: [cloneProject(state.project), ...state.future].slice(0,50), selectedId: previous.tracks.lead.events.some(n=>n.id===state.selectedId) ? state.selectedId : null, message: "已撤销上一步。", reconnectFromId: null }; }
  if (action.type === "redo") { const next = state.future[0]; if (!next) return { ...state, message: "没有可重做的操作。" }; return { ...state, project: next, past: pushHistory(state.past, state.project), future: state.future.slice(1), selectedId: next.tracks.lead.events.some(n=>n.id===state.selectedId) ? state.selectedId : null, message: "已重做上一步。", reconnectFromId: null }; }
  const notes = state.project.tracks.lead.events.filter(note=>note.startTick<USER_END_TICK);
  if (action.type === "add") {
    if (notes.length >= MAX_USER_NOTES) return { ...state, message: "这片星图最多容纳 8 颗旋律星。" };
    const usedTicks = notes.reduce((sum, note) => sum + note.durationTick, 0); if (usedTicks + DEFAULT_DURATION_TICK > USER_END_TICK) return { ...state, message: "前两小节已没有剩余拍数。" };
    const id = `star-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; const note: NoteEvent = { id, pitch: action.pitch, startTick: usedTicks, durationTick: DEFAULT_DURATION_TICK, velocity: .65, origin: "user", editedByUser: true };
    return commit(state, mutateLead(state.project, [...notes, note], { ...state.project.layout.notes, [id]: { xNorm: action.xNorm } }, true), id, "已加入一颗星。", state.project);
  }
  if (action.type === "move") { const previous = notes.find(note => note.id === action.id); const pitchChanged = previous?.pitch !== action.pitch; const changed = notes.map(note => note.id === action.id ? { ...note, pitch: action.pitch, editedByUser: pitchChanged || note.editedByUser } : note); return { ...state, project: mutateLead(state.project, recalculateStartTicks(changed), { ...state.project.layout.notes, [action.id]: { xNorm: action.xNorm } }, pitchChanged), selectedId: action.id, message: "星点已移动；垂直位置决定音高，水平位置只改变构图。" }; }
  if (action.type === "reconnectStart") return { ...state, reconnectFromId: action.id, selectedId: action.id, message: "连接起点已选定。再点另一颗星，把它接到后面。" };
  if (action.type === "reconnectComplete") { if (!state.reconnectFromId) return state; const result = reconnectAfter(state.project, state.reconnectFromId, action.id); if (!result.ok) return { ...state, reconnectFromId: null, message: result.message }; return commit(state, result.project, action.id, "单链顺序已更新，所有开始时间已重算。", state.project, null); }
  if (action.type === "mixer") { const project = { ...state.project, revision: state.project.revision + 1, updatedAt: new Date().toISOString(), mixer: { ...state.project.mixer, [action.track]: { ...state.project.mixer[action.track], enabled: action.enabled } } }; return commit(state, project, state.selectedId, `${action.track === "lead" ? "旋律" : action.track === "bass" ? "低音" : "节奏"}声部已${action.enabled ? "开启" : "关闭"}。`, state.project); }
  const result = action.type === "duration" ? setNoteDuration(state.project, action.id, action.durationTick) : action.type === "velocity" ? setNoteVelocity(state.project, action.id, action.velocity) : action.type === "delete" ? deleteNote(state.project, action.id) : action.type === "drum" ? setDrumSlot(state.project, action.slot, action.instrument) : null;
  if (!result) return state; if (!result.ok) return { ...state, message: result.message };
  return commit(state, result.project, action.type === "delete" ? null : state.selectedId, action.type === "duration" ? "音长已更新，后续音符时间已重算。" : action.type === "velocity" ? "力度与星点光晕已更新。" : action.type === "delete" ? "星点已删除，路径与时间已自动重建。" : "鼓环已同步到四个小节。", state.project);
}

function commit(state: StudioState, project: StarScoreProject, selectedId: string | null, message: string, previous: StarScoreProject, reconnectFromId = state.reconnectFromId): StudioState { return { ...state, project, selectedId, message, past: pushHistory(state.past, previous), future: [], dragOrigin: null, reconnectFromId }; }
function pushHistory(history: StarScoreProject[], project: StarScoreProject) { return [...history, cloneProject(project)].slice(-50); }
function cloneProject(project: StarScoreProject): StarScoreProject { return structuredClone(project); }
function equalProject(a: StarScoreProject, b: StarScoreProject) { return JSON.stringify(a) === JSON.stringify(b); }
function mutateLead(project: StarScoreProject, events: NoteEvent[], layout: StarScoreProject["layout"]["notes"], seedChanged: boolean): StarScoreProject { return { ...project, updatedAt: new Date().toISOString(), revision: project.revision + 1, seedRevision: project.seedRevision + (seedChanged ? 1 : 0), tracks: { ...project.tracks, lead: { id: "lead", events } }, layout: { notes: layout } }; }
