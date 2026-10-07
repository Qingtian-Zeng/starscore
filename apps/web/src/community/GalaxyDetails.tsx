import { useRef, type CSSProperties } from "react";
import { ArrowUpRight, Check, CircleStop, Download, Heart, LoaderCircle, Play, Sparkles, UserPlus, X } from "lucide-react";
import type { Galaxy, GalaxyWork } from "./galaxy";
import { workKey } from "./galaxy";
import { NebulaArt } from "./NebulaArt";
import { useDialogFocus } from "./useDialogFocus";

export function GalaxyDetails({galaxy,playing,activeId,starting,followed,likes,compact,composerOpen,copyingId,onClose,onListen,onFollow,onLike,onInspire,onExport,onManage,onRemove}:{galaxy:Galaxy;playing:{galaxy:Galaxy;work:GalaxyWork}|null;activeId:string|null;starting:boolean;followed:boolean;likes:string[];compact:boolean;composerOpen:boolean;copyingId:string|null;onClose:()=>void;onListen:(galaxy:Galaxy,work:GalaxyWork)=>void;onFollow:()=>void;onLike:(work:GalaxyWork)=>void;onInspire:(work:GalaxyWork)=>void;onExport:()=>void;onManage:()=>void;onRemove:()=>void}) {
  const panel=useRef<HTMLElement>(null);
  useDialogFocus(panel,compact&&!composerOpen,onClose);
  const isMine=galaxy.source==="mine",audible=playing?.galaxy.id===galaxy.id;
  return <><button className="galaxy-detail-scrim" aria-label="关闭星云详情背景" onClick={onClose} tabIndex={-1}/><aside className="galaxy-details" ref={panel} tabIndex={-1} role={compact?"dialog":undefined} aria-modal={compact&&!composerOpen?true:undefined} aria-hidden={composerOpen?true:undefined} inert={composerOpen} aria-labelledby="galaxy-detail-title" style={{"--nebula-color":galaxy.profile.color} as CSSProperties}>
    <div className="galaxy-detail-top"><span>{isMine?"我的星云":galaxy.source==="example"?"示例星系":"好友分享的星系"}</span><button className="galaxy-icon" aria-label="关闭星云详情" onClick={onClose}><X size={18}/></button></div>
    <div className={`galaxy-detail-art ${audible?"audible":""}`}><NebulaArt id={`detail-${galaxy.id}`} color={galaxy.profile.color} project={audible?playing.work.project:galaxy.works[0]?.project} activeId={audible?activeId:null}/><span>{galaxy.profile.mood}星域</span></div>
    <div className="galaxy-detail-identity"><span className="galaxy-avatar">{galaxy.profile.name.slice(0,1)}</span><div><h2 id="galaxy-detail-title">{galaxy.profile.title}</h2><p>{galaxy.profile.name} · {galaxy.works.length} 段星谱</p></div>{!isMine&&<button className={`galaxy-follow ${followed?"followed":""}`} aria-pressed={followed} onClick={onFollow}>{followed?<Check size={14}/>:<UserPlus size={14}/>}<span>{followed?"已关注":"关注"}</span></button>}</div>
    <p className="galaxy-detail-bio">{galaxy.profile.bio||"这团星云，等待你来倾听。"}</p>
    <div className="galaxy-detail-track-heading"><strong>星云里的声音</strong><span>四小节的相遇</span></div>
    <div className="galaxy-track-list">{galaxy.works.map((work,index)=>{
      const selected=audible&&playing.work.id===work.id,liked=likes.includes(workKey(galaxy.id,work.id));
      return <article className={`galaxy-track ${selected?"playing":""}`} key={work.id}><button className="galaxy-track-play" aria-label={`${selected?"停止":"试听"} ${work.project.title}`} onClick={()=>onListen(galaxy,work)}>{selected?(starting?<LoaderCircle size={17} className="spin"/>:<CircleStop size={19}/>):<Play size={16}/>}</button><div><span>{String(index+1).padStart(2,"0")} · {selected?(starting?"声音启动中":"正在倾听"):"90 BPM · 约 11 秒"}</span><h3>{work.project.title}</h3><button className="galaxy-inspire" disabled={Boolean(copyingId)} onClick={()=>onInspire(work)}>{copyingId===work.id?"正在打开…":"以此为灵感"}<ArrowUpRight size={11}/></button></div><button className={`galaxy-track-like ${liked?"liked":""}`} aria-label={`${liked?"取消喜欢":"喜欢"} ${work.project.title}`} aria-pressed={liked} onClick={()=>onLike(work)}><Heart size={15} fill={liked?"currentColor":"none"}/></button></article>;
    })}</div>
    <div className="galaxy-detail-actions">{isMine?<><button className="galaxy-secondary" onClick={onManage}><Sparkles size={14}/>管理星云</button><button className="galaxy-primary" onClick={onExport}><Download size={14}/>导出星系</button></>:<button className="galaxy-secondary galaxy-export-other" onClick={onExport}><Download size={14}/>保存星系文件</button>}</div>
    {galaxy.source==="friend"&&<button className="galaxy-remove-friend" onClick={onRemove}>移出本机银河</button>}
    <p className="galaxy-detail-note">{galaxy.source==="example"?"示例居民使用原创预设星谱，可直接试听。":isMine?"星云已在本机点亮，导出后可分享给好友。":"来自导入的星系文件，关注与喜欢保存在本机。"}</p>
  </aside></>;
}
