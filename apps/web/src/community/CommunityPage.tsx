import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, CircleStop, Compass, Heart, LoaderCircle, Orbit, Search, Sparkles, Upload, X } from "lucide-react";
import { audioEngine } from "../audio/AudioEngine";
import { AppNavigation } from "../components/AppNavigation";
import { MotionToggle } from "../components/MotionToggle";
import { duplicateProject, saveProject } from "../storage/projectRepository";
import { downloadBytes, safeFilename } from "../files/download";
import { projectRoute } from "../navigation/projectRoutes";
import { addFriendGalaxy, GALAXY_FILE_LIMIT, galaxyResidents, parseGalaxyFile, readGalaxyState, selectGalaxies, serializeGalaxy, workKey, writeGalaxyState, type Galaxy, type GalaxyBundle, type GalaxyState, type GalaxyWork } from "./galaxy";
import { GalaxyMap } from "./GalaxyMap";
import { GalaxyDetails } from "./GalaxyDetails";
import { GalaxyComposer } from "./GalaxyComposer";
import { GalaxyBackdrop } from "./GalaxyBackdrop";
import { GalaxyArrival, reduceGalaxyMotion } from "./GalaxyArrival";
import { isNativeApp, shareProjectFile } from "../platform/files";
import "./community.css";

let rememberedView={query:"",mood:"全部",scope:"all",sector:0,scrollTop:0,filtersOpen:false};
export const communityHash=(id?:string)=>id?`#/community/${encodeURIComponent(id)}`:"#/community";

export function CommunityPage({galaxyId,navigate}:{galaxyId?:string;navigate:(hash:string)=>void}) {
  const [state,setState]=useState(readGalaxyState);const stateRef=useRef(state);stateRef.current=state;
  const [query,setQuery]=useState(rememberedView.query),[mood,setMood]=useState(rememberedView.mood),[scope,setScope]=useState(rememberedView.scope),[sector,setSector]=useState(rememberedView.sector);
  const [filtersOpen,setFiltersOpen]=useState(rememberedView.filtersOpen),[arriving,setArriving]=useState(()=>!galaxyId&&!reduceGalaxyMotion());
  const wasArriving=useRef(arriving);
  const [composerOpen,setComposerOpen]=useState(false),[message,setMessage]=useState("");
  const [playing,setPlaying]=useState<{galaxy:Galaxy;work:GalaxyWork}|null>(null),[starting,setStarting]=useState(false),[progress,setProgress]=useState(0),[activeId,setActiveId]=useState<string|null>(null);
  const [copyingId,setCopyingId]=useState<string|null>(null),[compact,setCompact]=useState(()=>matchMedia("(max-width: 860px)").matches);
  const fileInput=useRef<HTMLInputElement>(null),token=useRef(0),copying=useRef(false),alive=useRef(true),importing=useRef(false);
  const browserView=useRef(rememberedView);browserView.current={query,mood,scope,sector,filtersOpen,scrollTop:browserView.current.scrollTop};
  const residents=useMemo(()=>galaxyResidents(state),[state]);
  const filtered=useMemo(()=>selectGalaxies(residents,query,mood,scope,state.follows),[residents,query,mood,scope,state.follows]);
  const sectors=Math.max(1,Math.ceil(filtered.length/8)),visibleSector=Math.min(sector,sectors-1),visible=filtered.slice(visibleSector*8,(visibleSector+1)*8);
  const selected=residents.find(galaxy=>galaxy.id===galaxyId);
  const stop=()=>{token.current++;audioEngine.stop();setPlaying(null);setActiveId(null);setStarting(false);setProgress(0)};
  useLayoutEffect(()=>{const scroll=()=>{browserView.current.scrollTop=window.scrollY};window.addEventListener("scroll",scroll,{passive:true});window.scrollTo(0,galaxyId?rememberedView.scrollTop:0);return()=>{window.removeEventListener("scroll",scroll);rememberedView={...browserView.current}}},[]);
  useEffect(()=>{if(wasArriving.current&&!arriving)document.querySelector<HTMLElement>(".community-entry")?.focus();wasArriving.current=arriving},[arriving]);
  useEffect(()=>{
    alive.current=true;const hidden=()=>{if(document.hidden)stop()};const pagehide=()=>stop();
    document.addEventListener("visibilitychange",hidden);window.addEventListener("pagehide",pagehide);
    const media=matchMedia("(max-width: 860px)");const change=()=>setCompact(media.matches);media.addEventListener?.("change",change);
    return()=>{alive.current=false;token.current++;document.removeEventListener("visibilitychange",hidden);window.removeEventListener("pagehide",pagehide);media.removeEventListener?.("change",change);audioEngine.dispose()};
  },[]);
  useEffect(()=>{if(window.__STARSCORE_HTML_PREVIEW__)window.parent.postMessage({type:"starscore:community",galaxies:residents.length,works:residents.reduce((sum,galaxy)=>sum+galaxy.works.length,0),title:playing?.work.project.title??selected?.profile.title??null,playing:Boolean(playing),starting},"*")},[residents,playing,starting,selected?.profile.title]);
  const commit=(next:GalaxyState,notice?:string)=>{if(!writeGalaxyState(next)){setMessage("本机存储暂时无法保存，请检查浏览器存储设置后重试。");return false}stateRef.current=next;setState(next);if(notice)setMessage(notice);return true};
  const openComposer=()=>{stop();setComposerOpen(true)};
  const audition=async(galaxy:Galaxy,work:GalaxyWork,restart=false)=>{
    if(!restart&&playing?.galaxy.id===galaxy.id&&playing.work.id===work.id){stop();return}
    const run=++token.current;setPlaying({galaxy,work});setStarting(true);setProgress(0);setActiveId(null);setMessage("");
    try{await audioEngine.play(work.project,{onNote:id=>{if(run===token.current)setActiveId(id)},onProgress:value=>{if(run===token.current)setProgress(value)},onEnded:()=>{if(run===token.current){setPlaying(null);setStarting(false);setActiveId(null);setProgress(0)}}});if(run===token.current)setStarting(false)}
    catch{if(run===token.current){stop();setMessage("声音还没有启动，请确认浏览器允许播放声音，再点一次试听。")}}
  };
  const shuffle=()=>{const all=filtered.flatMap(galaxy=>galaxy.works.map(work=>({galaxy,work})));const choices=all.filter(item=>workKey(item.galaxy.id,item.work.id)!==workKey(playing?.galaxy.id??"",playing?.work.id??""));const list=choices.length?choices:all;const choice=list[Math.floor(Math.random()*list.length)];if(choice){navigate(communityHash(choice.galaxy.id));void audition(choice.galaxy,choice.work,true)}};
  const selectProfile=(id:string)=>{setMessage("");navigate(communityHash(id))};
  const goOwn=()=>{if(!state.own){openComposer();return}setQuery("");setMood("全部");setScope("all");setSector(Math.floor(residents.findIndex(galaxy=>galaxy.id==="mine")/8));selectProfile("mine")};
  const publish=(bundle:GalaxyBundle)=>{
    if(!commit({...state,own:bundle},"你的星云已在本机银河点亮。导出星系文件，分享给好友即可倾听。"))return false;
    setQuery("");setMood("全部");setScope("all");const nextResidents=galaxyResidents({...state,own:bundle});setSector(Math.floor(nextResidents.findIndex(galaxy=>galaxy.id==="mine")/8));navigate(communityHash("mine"));return true;
  };
  const withdraw=()=>{if(commit({...state,own:null},"星云已移出本机银河，画室里的作品仍然保留。")){stop();setComposerOpen(false);navigate(communityHash())}};
  const exportGalaxy=async(galaxy:Galaxy)=>{const bundle:GalaxyBundle={format:galaxy.format,version:galaxy.version,profile:galaxy.profile,works:galaxy.works};const data=serializeGalaxy(bundle),filename=`${safeFilename(galaxy.profile.title)}.starscore-galaxy.json`;try{if(isNativeApp())await shareProjectFile(data,filename,"分享星谱星系");else downloadBytes(data,"application/json",filename);setMessage(isNativeApp()?"已打开系统分享面板。":"星系文件已准备好。好友在银河社区导入后，就能倾听你的星谱。")}catch{setMessage("星系文件分享失败，本机星云和作品没有改变。")}};
  const importGalaxy=async(file?:File)=>{
    if(!file||importing.current)return;importing.current=true;
    try{if(file.size>GALAXY_FILE_LIMIT)throw new Error("星系文件超过 1 MB，请减少分享的星谱。");const parsed=parseGalaxyFile(await file.text());if(!parsed.ok)throw new Error(parsed.message);if(!alive.current)return;const next=addFriendGalaxy(stateRef.current,parsed.bundle);if(commit(next,`已接收「${parsed.bundle.profile.title}」，点开星谱即可倾听。`)){setQuery("");setMood("全部");setScope("all");const id=`friend-${parsed.bundle.profile.id}`;setSector(Math.floor(galaxyResidents(next).findIndex(galaxy=>galaxy.id===id)/8));navigate(communityHash(id))}}
    catch(error){if(alive.current)setMessage(error instanceof Error?error.message:"星系导入失败，已有星谱保持不变。")}
    finally{importing.current=false}
  };
  const inspire=async(galaxy:Galaxy,work:GalaxyWork)=>{
    if(copying.current)return;copying.current=true;setCopyingId(work.id);stop();
    try{const copy=duplicateProject(work.project);copy.title=`${work.project.title.slice(0,100)} · 星云回应`;await saveProject(copy);if(alive.current)navigate(projectRoute("studio",copy.id,"community",galaxy.id))}
    catch{if(alive.current)setMessage("灵感副本保存失败，请检查本机存储后再试。")}
    finally{copying.current=false;if(alive.current)setCopyingId(null)}
  };
  const toggleFollow=(galaxy:Galaxy)=>commit({...state,follows:state.follows.includes(galaxy.id)?state.follows.filter(id=>id!==galaxy.id):[...state.follows,galaxy.id]});
  const toggleLike=(galaxy:Galaxy,work:GalaxyWork)=>{const id=workKey(galaxy.id,work.id);commit({...state,likes:state.likes.includes(id)?state.likes.filter(item=>item!==id):[...state.likes,id]})};
  const removeFriend=(galaxy:Galaxy)=>{if(commit({...state,friends:state.friends.filter(bundle=>bundle.profile.id!==galaxy.profile.id),follows:state.follows.filter(id=>id!==galaxy.id)},"好友星系已移出本机银河。")){if(playing?.galaxy.id===galaxy.id)stop();navigate(communityHash())}};
  const leave=(hash:string)=>{stop();navigate(hash)};
  useEffect(()=>{const back=(event:Event)=>{if(composerOpen){event.preventDefault();setComposerOpen(false);return}if(galaxyId){event.preventDefault();stop();navigate(communityHash())}};window.addEventListener("starscore:native-back",back);return()=>window.removeEventListener("starscore:native-back",back)},[composerOpen,galaxyId]);
  return <div className="app community-page">
    <GalaxyBackdrop variant="ambient" className="galaxy-page-background"/>
    <div className="community-content" inert={arriving} aria-hidden={arriving||undefined}>
    <header className="topbar"><div className="brand"><div className="brand-mark"><Sparkles size={21}/></div><div><h1>星谱</h1><small>GALAXY COMMUNITY</small></div></div><nav className="top-actions"><MotionToggle/><button className="new-button" onClick={()=>leave("#/library")}><ArrowLeft size={16}/>我的星系</button></nav></header>
    <AppNavigation active="community" navigate={leave}/>
    <main className="community-workspace">
      <section className="community-heading"><div><h1>听见彼此的<span>小宇宙。</span></h1><p className="community-subtitle">同一片银河，每个人都有自己的旋律。</p></div><span className="galaxy-preview-badge"><i/>本机银河 · 社区预览</span></section>
      <section className="community-toolbar" aria-label="银河发现工具"><div className="community-scopes">{[{id:"all",label:"发现星云"},{id:"following",label:"我关注的"},{id:"mine",label:"我的星云"}].map(item=><button key={item.id} className={scope===item.id?"selected":""} aria-pressed={scope===item.id} onClick={()=>{setScope(item.id);setSector(0);if(item.id==="mine"){setQuery("");setMood("全部");if(state.own)selectProfile("mine");else openComposer()}}}>{item.id==="all"?<Compass size={14}/>:item.id==="following"?<Heart size={14}/>:<Orbit size={14}/>}<span>{item.label}</span></button>)}</div><button className={`community-discover-toggle ${filtersOpen?"selected":""}`} aria-label="寻找星云" aria-expanded={filtersOpen} aria-controls="galaxy-discovery-tools" onClick={()=>setFiltersOpen(!filtersOpen)}><Search size={15}/><span>寻找星云</span><ChevronDown size={13}/>{(query||mood!=="全部")&&<i aria-label="已设置搜索或筛选"/>}</button></section>
      <section className="community-discovery-panel" id="galaxy-discovery-tools" aria-label="星云搜索与气质筛选" hidden={!filtersOpen}><label className="community-search"><Search size={15}/><input aria-label="搜索银河中的星云" placeholder="寻找昵称、星云或星谱" value={query} onChange={event=>{setQuery(event.target.value);setSector(0)}}/>{query&&<button aria-label="清除银河搜索" onClick={()=>{setQuery("");setSector(0)}}><X size={14}/></button>}</label><div className="community-filter-row"><div>{["全部","空灵","温暖","律动"].map(value=><button key={value} className={mood===value?"selected":""} aria-pressed={mood===value} onClick={()=>{setMood(value);setSector(0)}}>{value==="全部"?"全部星域":value}</button>)}</div></div></section>
      {message&&<div className="galaxy-notice" role="status"><span>{message}</span><button aria-label="关闭银河提示" onClick={()=>setMessage("")}><X size={14}/></button></div>}
      <div className={`community-universe ${selected?"has-detail":""}`}>
        <div className="community-map-column"><GalaxyMap galaxies={visible} selectedId={galaxyId} playing={playing} activeId={activeId} sector={visibleSector} sectors={sectors} showInvitation={!state.own} onSector={setSector} onSelect={selectProfile} onCreate={openComposer} onShuffle={shuffle} canShuffle={Boolean(filtered.length)}/>{!filtered.length&&<div className="galaxy-filter-empty"><Orbit size={24}/><h2>{scope==="following"?"还没有关注的星云":"这片星域暂时安静"}</h2><p>{scope==="following"?"点开一团星云，关注喜欢的创作者。":"试试另一种气质，或点亮自己的星云。"}</p><button className="galaxy-secondary" onClick={()=>{setQuery("");setMood("全部");setScope("all");setSector(0)}}>返回全部星域</button></div>}</div>
        {selected?<GalaxyDetails galaxy={selected} playing={playing} activeId={activeId} starting={starting} followed={state.follows.includes(selected.id)} likes={state.likes} compact={compact} composerOpen={composerOpen} copyingId={copyingId} onClose={()=>navigate(communityHash())} onListen={(galaxy,work)=>void audition(galaxy,work)} onFollow={()=>toggleFollow(selected)} onLike={work=>toggleLike(selected,work)} onInspire={work=>void inspire(selected,work)} onExport={()=>void exportGalaxy(selected)} onManage={openComposer} onRemove={()=>removeFriend(selected)}/>:<aside className="galaxy-welcome"><Orbit size={26}/><p className="community-eyebrow">LET THE STARS FIND YOU</p><h2>有人会听见<br/>你的小宇宙。</h2><p>点一团星云，走进创作者的音乐星系。喜欢的声音，可以关注，也可以留下一颗心。</p><div className="galaxy-welcome-stats"><span><strong>{residents.length}</strong>团星云</span><span><strong>{residents.reduce((sum,galaxy)=>sum+galaxy.works.length,0)}</strong>段可听星谱</span></div><button className="galaxy-secondary" onClick={goOwn}><Sparkles size={14}/>{state.own?"找到我的星云":"让我的星云发光"}</button><small>示例居民 + 本机星云 + 导入的好友星系</small></aside>}
      </div>
      <section className="community-heading-actions" aria-label="星系分享"><p>让你的星云，在这片银河里发光。</p><div><button className="galaxy-secondary" onClick={()=>fileInput.current?.click()}><Upload size={15}/>导入好友星系</button><button className="galaxy-primary" onClick={openComposer}><Sparkles size={15}/>{state.own?"分享我的星系":"点亮我的星云"}</button></div></section>
      <div className="community-bottom-note"><span><Orbit size={13}/>这里的每一点光，都有自己的旋律。</span><span>文件分享可互相试听 · 在线自动发现待接入</span></div>
      {galaxyId&&!selected&&<p className="galaxy-inline-message" role="status">这团星云尚未在本机银河中。请导入对应的好友星系文件。</p>}
    </main>
    <input hidden ref={fileInput} type="file" accept=".json,.starscore-galaxy.json,application/json" aria-label="导入好友星系文件" onChange={event=>{void importGalaxy(event.currentTarget.files?.[0]);event.currentTarget.value=""}}/>
    {playing&&<section className="galaxy-now-playing" aria-label="银河试听播放器"><span className="galaxy-now-orb" style={{color:playing.galaxy.profile.color}}><Orbit size={25}/></span><div><strong>{playing.work.project.title}</strong><span>{starting?"正在接收星际声音…":`${playing.galaxy.profile.name} · ${playing.galaxy.profile.title}`}</span><i><b style={{width:`${progress*100}%`,background:playing.galaxy.profile.color}}/></i></div><button className="galaxy-now-visit" onClick={()=>selectProfile(playing.galaxy.id)}>进入星系</button><button className="galaxy-now-stop" aria-label="停止银河试听" onClick={stop}>{starting?<LoaderCircle size={21} className="spin"/>:<CircleStop size={25}/>}</button></section>}
    {composerOpen&&<GalaxyComposer own={state.own} onClose={()=>setComposerOpen(false)} onPublish={publish} onWithdraw={withdraw}/>}
    </div>
    {arriving&&<GalaxyArrival onComplete={()=>setArriving(false)}/>}
  </div>;
}
