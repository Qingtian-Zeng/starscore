import { validateImportedProject, type NoteEvent, type StarScoreProject } from "@starscore/core";
import { catalogItems, createCatalogProject } from "../catalog/catalog";

export const GALAXY_FILE_LIMIT = 1024 * 1024;
export const GALAXY_WORK_LIMIT = 8;
export const GALAXY_IMPORT_LIMIT = 12;
export const nebulaColors = ["#95d8d4", "#baa4f0", "#efb594", "#96c5ee", "#d3a0cd", "#a6d0af"] as const;
export type GalaxyMood = "空灵" | "温暖" | "律动";
export interface GalaxyProfile { id: string; name: string; title: string; bio: string; color: string; mood: GalaxyMood; }
export interface GalaxyWork { id: string; project: StarScoreProject; }
export interface GalaxyBundle { format: "StarScoreGalaxy"; version: 1; profile: GalaxyProfile; works: GalaxyWork[]; }
export interface Galaxy extends GalaxyBundle { id: string; source: "example" | "mine" | "friend"; }
export interface GalaxyState { own: GalaxyBundle | null; friends: GalaxyBundle[]; follows: string[]; likes: string[]; }
const storageKey = "starscore-galaxy-community-v1";
export const emptyGalaxyState = (): GalaxyState => ({ own: null, friends: [], follows: [], likes: [] });
const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown, limit: number): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= limit;
export const workKey = (galaxyId: string, workId: string) => JSON.stringify([galaxyId, workId]);

// A share contains only the music schema and the profile explicitly selected by its author.
function musicSnapshot(project: StarScoreProject): StarScoreProject {
  const {schemaVersion,id,title,createdAt,updatedAt,revision,seedRevision}=project;
  const note=({id,pitch,startTick,durationTick,velocity,origin,editedByUser}:NoteEvent)=>({id,pitch,startTick,durationTick,velocity,origin,editedByUser});
  const {ppq,bpm,meter,loopBars,key,scale}=project.music;
  const tracks={lead:{id:"lead" as const,events:project.tracks.lead.events.map(note)},bass:{id:"bass" as const,events:project.tracks.bass.events.map(note)},drums:{id:"drums" as const,events:project.tracks.drums.events.map(({id,instrument,startTick,velocity,origin,editedByUser})=>({id,instrument,startTick,velocity,origin,editedByUser}))}};
  const layout={notes:Object.fromEntries(project.tracks.lead.events.map(event=>[event.id,{xNorm:project.layout.notes[event.id]!.xNorm}]))};
  const channel=({enabled,gain}:{enabled:boolean;gain:number})=>({enabled,gain});
  const mixer={lead:channel(project.mixer.lead),bass:channel(project.mixer.bass),drums:channel(project.mixer.drums)};
  const meta=project.responseMeta;
  const responseMeta=meta?{provider:meta.provider,seedRevision:meta.seedRevision,candidateId:meta.candidateId,acceptedAt:meta.acceptedAt}:undefined;
  return structuredClone({schemaVersion,id,title,createdAt,updatedAt,revision,seedRevision,music:{ppq,bpm,meter,loopBars,key,scale},tracks,layout,mixer,...(responseMeta?{responseMeta}:{})});
}
export function validateGalaxyBundle(value: unknown): { ok: true; bundle: GalaxyBundle } | { ok: false; message: string } {
  const fail = (message: string) => ({ ok: false as const, message });
  if (!record(value) || value.format !== "StarScoreGalaxy" || value.version !== 1) return fail("请导入星谱星系文件。普通星谱 JSON 可在「我的星系」中导入。");
  const profile = value.profile;
  if (!record(profile) || !text(profile.id,64) || !/^[a-zA-Z0-9_-]+$/.test(profile.id) || !text(profile.name,20) || !text(profile.title,24) || typeof profile.bio !== "string" || profile.bio.length > 160 || typeof profile.color !== "string" || !/^#[0-9a-f]{6}$/i.test(profile.color) || !["空灵","温暖","律动"].includes(String(profile.mood))) return fail("星云的昵称、名称或颜色不完整，请检查文件。");
  if (!Array.isArray(value.works) || !value.works.length || value.works.length > GALAXY_WORK_LIMIT) return fail(`一个星系需要 1—${GALAXY_WORK_LIMIT} 段星谱。`);
  const works: GalaxyWork[] = [];
  const ids = new Set<string>();
  for (const work of value.works) {
    if (!record(work) || !text(work.id,200) || ids.has(work.id)) return fail("星系包含无效或重复的星谱。");
    let checked:ReturnType<typeof validateImportedProject>;
    try { checked=validateImportedProject(work.project); } catch { return fail("星谱事件结构无效，请重新导出星系文件。"); }
    if (!checked.ok) return fail(`星谱无法读取：${checked.message}`);
    if (!checked.project.tracks.lead.events.length) return fail("请加入至少包含一个音符的星谱。");
    works.push({ id: work.id, project: musicSnapshot(checked.project) }); ids.add(work.id);
  }
  return { ok: true, bundle: { format: "StarScoreGalaxy", version: 1, profile: { id: profile.id, name: profile.name.trim(), title: profile.title.trim(), bio: profile.bio.trim(), color: profile.color, mood: profile.mood as GalaxyMood }, works } };
}
export function parseGalaxyFile(contents: string) {
  if (new TextEncoder().encode(contents).byteLength > GALAXY_FILE_LIMIT) return { ok: false as const, message: "星系文件超过 1 MB，请减少分享的星谱。" };
  try { return validateGalaxyBundle(JSON.parse(contents)); } catch { return { ok: false as const, message: "这个星系文件无法读取，请检查 JSON 格式。" }; }
}
export function createGalaxyBundle(profile: GalaxyProfile, projects: readonly StarScoreProject[]) {
  const checked=validateGalaxyBundle({format:"StarScoreGalaxy",version:1,profile,works:projects.map(project=>({id:project.id,project}))});
  if(!checked.ok)throw new Error(checked.message);
  return checked.bundle;
}
export const serializeGalaxy = (bundle: GalaxyBundle) => JSON.stringify(bundle, null, 2);
export function readGalaxyState(): GalaxyState {
  try {
    const raw:unknown=JSON.parse(localStorage.getItem(storageKey)??"null");
    if(!record(raw))return emptyGalaxyState();
    const own=validateGalaxyBundle(raw.own);
    const friends:GalaxyBundle[]=[];const seen=new Set<string>();
    for(const value of Array.isArray(raw.friends)?raw.friends.slice(0,GALAXY_IMPORT_LIMIT):[]){const checked=validateGalaxyBundle(value);if(checked.ok&&!seen.has(checked.bundle.profile.id)){friends.push(checked.bundle);seen.add(checked.bundle.profile.id)}}
    const ids=(value:unknown)=>Array.isArray(value)?[...new Set(value.filter((id):id is string=>typeof id==="string"&&id.length<=500))].slice(0,300):[];
    return {own:own.ok?own.bundle:null,friends,follows:ids(raw.follows),likes:ids(raw.likes)};
  } catch { return emptyGalaxyState(); }
}
export function writeGalaxyState(state: GalaxyState): boolean {
  try { localStorage.setItem(storageKey,JSON.stringify(state));return true; } catch { return false; }
}
export function addFriendGalaxy(state: GalaxyState, bundle: GalaxyBundle): GalaxyState {
  if(bundle.profile.id===state.own?.profile.id)throw new Error("这是你自己的星系。请在「分享我的星系」中更新。");
  const previous=state.friends.find(item=>item.profile.id===bundle.profile.id);
  if(!previous&&state.friends.length>=GALAXY_IMPORT_LIMIT)throw new Error("本机银河最多接纳 12 个好友星系，请先移除一个再导入。");
  return {...state,friends:previous?state.friends.map(item=>item.profile.id===bundle.profile.id?structuredClone(bundle):item):[...state.friends,structuredClone(bundle)]};
}

const residents = [
  { id:"aster",name:"阿拾",title:"拾光星云",bio:"收集清晨的光，把日常写成一段小小的旋律。",color:"#efb594",mood:"温暖",items:["taurus","virgo"] },
  { id:"luna",name:"月野",title:"月眠星系",bio:"在安静的星际里，留一盏声音做的灯。",color:"#baa4f0",mood:"空灵",items:["pisces","goodnight-asteroid"] },
  { id:"sora",name:"空山",title:"青空回廊",bio:"让呼吸慢下来，听一听空旷的回声。",color:"#95d8d4",mood:"空灵",items:["aurora-letter","cancer"] },
  { id:"nova",name:"诺瓦",title:"燃星俱乐部",bio:"每一颗心跳，都可以成为新的节拍。",color:"#d3a0cd",mood:"律动",items:["aries","galaxy-walk"] },
  { id:"mio",name:"米可",title:"森林微光",bio:"雨停之后，温柔还有另一种声音。",color:"#a6d0af",mood:"温暖",items:["rain-cafe","libra"] },
  { id:"orion",name:"北辰",title:"远航电台",bio:"写给还没有抵达的地方，和正在出发的人。",color:"#96c5ee",mood:"律动",items:["aquarius","dawn-route"] },
  { id:"echo",name:"回音",title:"深空来信",bio:"如果旋律可以传信，你会想念哪颗星？",color:"#aaa9d6",mood:"空灵",items:["scorpio","faint-heart"] },
] as const;
export const exampleGalaxies: readonly Galaxy[] = residents.map(resident=>({
  id:`example-${resident.id}`,source:"example",format:"StarScoreGalaxy",version:1,
  profile:{id:`example-${resident.id}`,name:resident.name,title:resident.title,bio:resident.bio,color:resident.color,mood:resident.mood},
  works:resident.items.map(id=>{const project=createCatalogProject(catalogItems.find(item=>item.id===id)!,true);project.id=`example-${resident.id}-${id}`;return{id,project}}),
}));
export function galaxyResidents(state: GalaxyState): Galaxy[] {
  return [...exampleGalaxies,...state.friends.map(bundle=>({...bundle,id:`friend-${bundle.profile.id}`,source:"friend" as const})),...(state.own?[{...state.own,id:"mine",source:"mine" as const}]:[])];
}
export function selectGalaxies(galaxies: readonly Galaxy[], query: string, mood: string, scope: string, follows: readonly string[]) {
  const term=query.trim().toLocaleLowerCase();
  return galaxies.filter(galaxy=>(scope!=="following"||follows.includes(galaxy.id))&&(scope!=="mine"||galaxy.source==="mine")&&(mood==="全部"||galaxy.profile.mood===mood)&&(!term||[galaxy.profile.name,galaxy.profile.title,galaxy.profile.bio,...galaxy.works.map(work=>work.project.title)].some(value=>value.toLocaleLowerCase().includes(term))));
}
