import { createProject, PPQ, USER_END_TICK, type DrumInstrument, type NoteEvent, type StarScoreProject } from "@starscore/core";

export type CollectionKind = "zodiac" | "materials";
type Arrangement = "ambient" | "warm" | "groove" | "steady";
export interface CatalogItem {
  id: string;
  kind: CollectionKind;
  label: string;
  english: string;
  symbol: string;
  title: string;
  category: string;
  mood: string;
  description: string;
  color: string;
  pitches: readonly number[];
  reply: readonly number[];
  beats: readonly number[];
  replyBeats?: readonly number[];
  roots: readonly number[];
  arrangement: Arrangement;
}

const gentle = [1, 1, 1, 1, 2, 2] as const;
const rising = [1, 1, .5, .5, 1, 1, 1, 2] as const;
const dancing = [.5, .5, 1, 1, .5, .5, 2, 2] as const;
const replyRise = [1, .5, .5, 1, 1, 1, 1, 2] as const;
const patient = [2, 1, 1, 1, 1, 2] as const;
const home = [36, 33, 41, 43] as const;
const dream = [33, 41, 36, 43] as const;

// Original, hand-arranged motifs. All presets keep the App's 90 BPM / C pentatonic / four-bar contract.
export const catalogItems: readonly CatalogItem[] = [
  {id:"aries",kind:"zodiac",label:"白羊座",english:"Aries",symbol:"♈",title:"燃星启航",category:"火象",mood:"明亮 · 向前",description:"短促的起音奔向高处，像第一次点亮远方的星。",color:"#f3a784",pitches:[60,64,67,69,67,64,67,72],reply:[72,69,67,64,67,64,62,60],beats:rising,replyBeats:replyRise,roots:home,arrangement:"groove"},
  {id:"taurus",kind:"zodiac",label:"金牛座",english:"Taurus",symbol:"♉",title:"温柔引力",category:"土象",mood:"温暖 · 安定",description:"舒展的旋律落在柔软低音上，给夜晚一个稳稳的拥抱。",color:"#d8c691",pitches:[60,62,64,67,64,60],reply:[64,67,69,67,62,60],beats:gentle,roots:home,arrangement:"warm"},
  {id:"gemini",kind:"zodiac",label:"双子座",english:"Gemini",symbol:"♊",title:"双子回声",category:"风象",mood:"轻巧 · 对话",description:"两条灵巧的旋律互相接话，留下一点俏皮的空隙。",color:"#bda9ec",pitches:[64,67,64,69,62,67,69,72],reply:[72,69,67,64,69,67,62,64],beats:dancing,roots:[36,43,33,43],arrangement:"groove"},
  {id:"cancer",kind:"zodiac",label:"巨蟹座",english:"Cancer",symbol:"♋",title:"月光潮汐",category:"水象",mood:"柔和 · 怀念",description:"月光缓缓抬升，又像潮水一样回到熟悉的岸边。",color:"#91cdd5",pitches:[67,69,72,69,64,62],reply:[64,67,69,67,62,60],beats:gentle,roots:dream,arrangement:"ambient"},
  {id:"leo",kind:"zodiac",label:"狮子座",english:"Leo",symbol:"♌",title:"金色舞台",category:"火象",mood:"开阔 · 闪耀",description:"跳进高音的那一刻，让整片星空成为你的舞台。",color:"#e6bd7b",pitches:[60,67,69,72,74,72,69,67],reply:[72,74,72,69,67,69,64,60],beats:rising,replyBeats:replyRise,roots:home,arrangement:"steady"},
  {id:"virgo",kind:"zodiac",label:"处女座",english:"Virgo",symbol:"♍",title:"晨间轨道",category:"土象",mood:"清新 · 有序",description:"细小的音符沿着整齐轨道，排成一个明亮的清晨。",color:"#b9d1ad",pitches:[64,62,60,62,64,67,64,60],reply:[62,64,67,69,67,64,62,60],beats:dancing,roots:home,arrangement:"warm"},
  {id:"libra",kind:"zodiac",label:"天秤座",english:"Libra",symbol:"♎",title:"对称星河",category:"风象",mood:"优雅 · 平衡",description:"上行与下行轻轻对称，像两端相互照亮的星河。",color:"#d5b0d6",pitches:[64,67,69,72,69,67],reply:[69,67,64,62,64,60],beats:gentle,roots:[41,43,33,36],arrangement:"warm"},
  {id:"scorpio",kind:"zodiac",label:"天蝎座",english:"Scorpio",symbol:"♏",title:"深空心跳",category:"水象",mood:"低回 · 神秘",description:"低音像远处的心跳，旋律在深空里留下一束微光。",color:"#a7a4df",pitches:[60,62,67,64,62,60],reply:[67,69,67,64,62,60],beats:patient,roots:[33,40,41,43],arrangement:"steady"},
  {id:"sagittarius",kind:"zodiac",label:"射手座",english:"Sagittarius",symbol:"♐",title:"流星远行",category:"火象",mood:"自由 · 远行",description:"上扬的句尾越过地平线，把未知唱成一场轻快旅行。",color:"#edb38d",pitches:[60,64,67,72,69,67,69,72],reply:[74,72,69,67,69,64,62,60],beats:rising,replyBeats:replyRise,roots:[36,41,33,43],arrangement:"groove"},
  {id:"capricorn",kind:"zodiac",label:"摩羯座",english:"Capricorn",symbol:"♑",title:"山巅微光",category:"土象",mood:"沉静 · 生长",description:"每个音阶都向前一步，最后停在能看见黎明的地方。",color:"#b9c4b0",pitches:[60,62,64,67,69,72],reply:[69,67,64,62,64,60],beats:gentle,roots:home,arrangement:"steady"},
  {id:"aquarius",kind:"zodiac",label:"水瓶座",english:"Aquarius",symbol:"♒",title:"蓝色信号",category:"风象",mood:"灵动 · 探索",description:"带着小小跳进的信号，在星际之间传递新的想象。",color:"#9cbfea",pitches:[64,69,67,74,72,69,67,62],reply:[72,67,69,64,74,72,67,60],beats:dancing,roots:[33,36,41,43],arrangement:"groove"},
  {id:"pisces",kind:"zodiac",label:"双鱼座",english:"Pisces",symbol:"♓",title:"海雾梦境",category:"水象",mood:"空灵 · 漂浮",description:"清亮的音符在海雾里缓缓升起，最后降落在一颗安静的星上。",color:"#8acdcc",pitches:[67,69,72,74,72,69],reply:[72,69,67,64,62,60],beats:gentle,roots:dream,arrangement:"ambient"},
  {id:"aurora-letter",kind:"materials",label:"极光来信",english:"Aurora Letter",symbol:"✧",title:"极光来信",category:"氛围",mood:"空灵 · 流光",description:"适合描绘缓慢展开的天空，试着改变长音的高度。",color:"#96d6c7",pitches:[64,67,72,69,74,72],reply:[69,72,67,64,62,60],beats:gentle,roots:dream,arrangement:"ambient"},
  {id:"rain-cafe",kind:"materials",label:"雨夜咖啡",english:"Rain Cafe",symbol:"☂",title:"雨夜咖啡",category:"抒情",mood:"温暖 · 松弛",description:"柔和低音与轻轻的鼓点，适合记录雨夜的片刻心情。",color:"#d9bc98",pitches:[64,67,64,62,60,64],reply:[67,69,67,64,62,60],beats:gentle,roots:[33,41,36,43],arrangement:"warm"},
  {id:"galaxy-walk",kind:"materials",label:"银河漫步",english:"Galaxy Walk",symbol:"✺",title:"银河漫步",category:"律动",mood:"轻快 · 摇摆",description:"半拍音符带来细小律动，把几颗星重新连接试试看。",color:"#b7afe3",pitches:[60,64,67,64,69,67,62,64],reply:[67,69,72,69,67,64,62,60],beats:dancing,roots:home,arrangement:"groove"},
  {id:"goodnight-asteroid",kind:"materials",label:"晚安小行星",english:"Goodnight Asteroid",symbol:"☾",title:"晚安小行星",category:"抒情",mood:"柔软 · 晚安",description:"弱一些的力度、少一些的鼓点，让旋律慢慢收拢。",color:"#a8bcdf",pitches:[67,64,62,60,62,64],reply:[67,64,62,64,62,60],beats:patient,roots:[36,33,41,36],arrangement:"ambient"},
  {id:"faint-heart",kind:"materials",label:"微光心事",english:"Faint Light",symbol:"♡",title:"微光心事",category:"氛围",mood:"低回 · 叙事",description:"给一段短短的心事留出长音，再用回应完成下半句。",color:"#d6adca",pitches:[64,62,64,69,67,64],reply:[62,64,67,64,62,60],beats:patient,roots:dream,arrangement:"warm"},
  {id:"dawn-route",kind:"materials",label:"破晓航线",english:"Dawn Route",symbol:"☼",title:"破晓航线",category:"律动",mood:"明亮 · 希望",description:"从低处逐步走向高音，适合用来写一段新的开始。",color:"#e7c48c",pitches:[60,62,64,67,69,72,69,67],reply:[64,67,69,72,69,67,62,60],beats:rising,replyBeats:replyRise,roots:home,arrangement:"steady"},
];

const arrangements = {
  ambient: {bassGain:.22,drumGain:.12,drumsEnabled:false,velocity:.52,pattern:["kick",null,null,"hat",null,null,"tap",null]},
  warm: {bassGain:.3,drumGain:.18,drumsEnabled:true,velocity:.59,pattern:["kick",null,"hat",null,"tap",null,"hat",null]},
  groove: {bassGain:.36,drumGain:.3,drumsEnabled:true,velocity:.66,pattern:["kick","hat","tap","hat","kick","hat","tap","hat"]},
  steady: {bassGain:.34,drumGain:.24,drumsEnabled:true,velocity:.63,pattern:["kick",null,"hat","tap","kick",null,"tap","hat"]},
} satisfies Record<Arrangement,{bassGain:number;drumGain:number;drumsEnabled:boolean;velocity:number;pattern:(DrumInstrument|null)[]}>;

export function createCatalogProject(item: CatalogItem, preview = false): StarScoreProject {
  const style = arrangements[item.arrangement];
  const makePhrase = (pitches:readonly number[],beats:readonly number[],start:number,origin:"user"|"rules",name:string):NoteEvent[] => {
    if(pitches.length!==beats.length || beats.reduce((sum,value)=>sum+value,0)!==8)throw new Error(`素材 ${item.id} 的乐句长度无效`);
    let cursor=start;
    return pitches.map((pitch,index)=>{
      const durationTick=beats[index]!*PPQ;
      const note:NoteEvent={id:`${item.id}-${name}-${index}`,pitch,startTick:cursor,durationTick,velocity:Math.min(.82,style.velocity+((index===0||index===3)?.06:index===pitches.length-1?-.08:-.02)),origin,editedByUser:false};
      cursor+=durationTick;return note;
    });
  };
  const seeds=makePhrase(item.pitches,item.beats,0,"user","seed");
  const reply=makePhrase(item.reply,item.replyBeats??item.beats,USER_END_TICK,"rules","reply");
  const title=item.kind==="zodiac"?`${item.label} · ${item.title}`:item.title;
  const project=createProject(title,[...seeds,...reply]);
  if(preview)project.id=`catalog-preview-${item.id}`;
  const bass:NoteEvent[]=item.roots.flatMap((root,bar)=>{
    const offsets=item.arrangement==="groove"?[[0,root,480],[720,root+12,240],[960,root+7,480],[1440,root,480]]:item.arrangement==="warm"?[[0,root,960],[960,root+7,480],[1440,root+12,480]]:[[0,root,960],[960,root+7,960]];
    return offsets.map(([offset,pitch,durationTick],index)=>({id:`${item.id}-bass-${bar}-${index}`,pitch:pitch!,startTick:bar*1920+offset!,durationTick:durationTick!,velocity:item.arrangement==="ambient"?.36:.43,origin:"rules" as const,editedByUser:false}));
  });
  project.tracks.bass.events=bass;
  project.tracks.drums.events=Array.from({length:4},(_,bar)=>style.pattern.flatMap((instrument,slot)=>instrument?[{id:`${item.id}-drum-${bar}-${slot}`,instrument,startTick:bar*1920+slot*240,velocity:instrument==="hat"?.16:instrument==="tap"?.28:.4,origin:"rules" as const,editedByUser:false}]:[])).flat();
  project.layout.notes=Object.fromEntries([...seeds.map((note,index)=>[note.id,{xNorm:.08+.36*index/Math.max(1,seeds.length-1)}]),...reply.map((note,index)=>[note.id,{xNorm:.55+.37*index/Math.max(1,reply.length-1)}])]);
  project.mixer={lead:{enabled:true,gain:.82},bass:{enabled:true,gain:style.bassGain},drums:{enabled:style.drumsEnabled,gain:style.drumGain}};
  project.responseMeta={provider:"rules",seedRevision:0,candidateId:`catalog-${item.id}`,acceptedAt:project.createdAt};
  return project;
}

export function createMaterialCopy(item:CatalogItem):StarScoreProject {
  const copy=createCatalogProject(item);
  copy.title=`${copy.title} · 我的版本`;
  return copy;
}

export function selectCatalogItems(kind:CollectionKind,query="",category="全部",favoriteIds:readonly string[]|null=null):CatalogItem[] {
  const needle=query.trim().toLocaleLowerCase();
  return catalogItems.filter(item=>item.kind===kind&&(category==="全部"||item.category===category)&&(!favoriteIds||favoriteIds.includes(item.id))&&(!needle||[item.label,item.english,item.title,item.category,item.mood,item.description].join(" ").toLocaleLowerCase().includes(needle)));
}

export const catalogDurationSeconds=16*60/90;
