import { Compass, FolderOpen, Music2, Pencil, ArrowUpRight } from "lucide-react";
import { GalaxyBackdrop } from "../community/GalaxyBackdrop";
import "../catalog/catalog.css";
import "../community/entry.css";

export type AppSection="studio"|"zodiac"|"materials"|"library"|"community";
const destinations=[
  {id:"studio",label:"星图画室",hash:"#/studio",icon:Pencil},
  {id:"zodiac",label:"十二星座",hash:"#/discover/zodiac",icon:Compass},
  {id:"materials",label:"星谱素材",hash:"#/discover/materials",icon:Music2},
  {id:"library",label:"我的星系",hash:"#/library",icon:FolderOpen},
] as const;
export function AppNavigation({active,navigate,nested=false}:{active?:AppSection;navigate:(hash:string)=>void;nested?:boolean}) {
  return <nav className="app-navigation" aria-label="星谱功能导航">
    <span className="community-entry-row"><button className={`community-entry ${active==="community"?"active":""}`} aria-label="银河社区" aria-current={active==="community"?(nested?"location":"page"):undefined} onClick={()=>{if(active!=="community"||nested)navigate("#/community")}}>
      <GalaxyBackdrop variant="portal" className="community-entry-art"/>
      <span className="community-entry-copy"><small>THE MUSIC GALAXY</small><strong>银河社区</strong><span>每个人的星云，都值得被听见。</span></span>
      <span className="community-entry-invitation"><span>{active==="community"&&!nested?"正在银河":"进入银河"}</span><i><ArrowUpRight size={19}/></i></span>
    </button></span>
    <div>{destinations.map(({id,label,hash,icon:Icon})=><button key={id} className={active===id?"active":""} aria-current={active===id?(nested?"location":"page"):undefined} onClick={()=>{if(id!==active||nested)navigate(hash)}}><Icon size={16}/><span>{label}</span></button>)}</div>
  </nav>;
}
