import type { CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Orbit, Plus, Shuffle, Volume2 } from "lucide-react";
import type { Galaxy, GalaxyWork } from "./galaxy";
import { NebulaArt } from "./NebulaArt";
import { GalaxyBackdrop } from "./GalaxyBackdrop";

const slots=[{x:18,y:18},{x:49,y:16},{x:81,y:19},{x:28,y:49},{x:68,y:51},{x:18,y:80},{x:49,y:83},{x:81,y:80}];
export function GalaxyMap({galaxies,selectedId,playing,activeId,sector,sectors,showInvitation,onSector,onSelect,onCreate,onShuffle,canShuffle}:{galaxies:Galaxy[];selectedId?:string;playing:{galaxy:Galaxy;work:GalaxyWork}|null;activeId:string|null;sector:number;sectors:number;showInvitation:boolean;onSector:(value:number)=>void;onSelect:(id:string)=>void;onCreate:()=>void;onShuffle:()=>void;canShuffle:boolean}) {
  return <section className="galaxy-map" aria-label="可探索的音乐银河">
    <GalaxyBackdrop className="galaxy-space"/>
    <div className="galaxy-map-heading"><div><Orbit size={15}/><span>银河漫游</span><small>点星云 · 听星谱</small></div><button className="galaxy-surprise" disabled={!canShuffle} onClick={onShuffle} aria-label="听见一颗陌生的星"><Shuffle size={13}/><span>随机倾听</span></button></div>
    <div className="galaxy-node-layer">{galaxies.map((galaxy,index)=>{
      const slot=slots[index%slots.length]!;const audible=playing?.galaxy.id===galaxy.id;
      return <button type="button" key={galaxy.id} className={`galaxy-node ${selectedId===galaxy.id?"selected":""} ${audible?"audible":""} ${galaxy.source==="mine"?"own":""}`} style={{left:`${slot.x}%`,top:`${slot.y}%`,"--nebula-color":galaxy.profile.color,"--float-delay":`${index*-.65}s`} as CSSProperties} aria-label={`探索 ${galaxy.profile.name} 的 ${galaxy.profile.title}`} aria-pressed={selectedId===galaxy.id} onClick={()=>onSelect(galaxy.id)}>
        <span className="nebula-visual"><NebulaArt id={`map-${galaxy.id}`} color={galaxy.profile.color} project={audible?playing.work.project:galaxy.works[0]?.project} activeId={audible?activeId:null}/>{audible&&<span className="galaxy-node-sound"><Volume2 size={11}/></span>}</span>
        <strong>{galaxy.profile.title}</strong><span className="galaxy-node-owner">{galaxy.source==="mine"?"我的星云":galaxy.profile.name}<i/>{galaxy.works.length} 段星谱</span>
      </button>;
    })}{showInvitation&&galaxies.length<8&&<button className="galaxy-node galaxy-empty-node" style={{left:`${slots[7]!.x}%`,top:`${slots[7]!.y}%`}} onClick={onCreate} aria-label="点亮我的星云"><span className="galaxy-empty-orbit"><Plus size={19}/></span><strong>你的星云</strong><span className="galaxy-node-owner">在银河里留下声音</span></button>}</div>
    <div className="galaxy-map-footer"><span className="galaxy-map-coordinates">每一团星云，都是一个音乐宇宙</span><div><button aria-label="上一片星域" disabled={sector===0} onClick={()=>onSector(sector-1)}><ChevronLeft size={15}/></button><span>星域 {sector+1} / {sectors}</span><button aria-label="下一片星域" disabled={sector+1>=sectors} onClick={()=>onSector(sector+1)}><ChevronRight size={15}/></button></div></div>
  </section>;
}
