import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Check, LoaderCircle, Plus, Sparkles, X } from "lucide-react";
import { type StarScoreProject } from "@starscore/core";
import { listProjects, saveProject } from "../storage/projectRepository";
import { catalogItems, createMaterialCopy } from "../catalog/catalog";
import { createGalaxyBundle, GALAXY_WORK_LIMIT, nebulaColors, type GalaxyBundle, type GalaxyMood, type GalaxyProfile } from "./galaxy";
import { NebulaArt } from "./NebulaArt";
import { useDialogFocus } from "./useDialogFocus";

export function GalaxyComposer({own,onClose,onPublish,onWithdraw}:{own:GalaxyBundle|null;onClose:()=>void;onPublish:(bundle:GalaxyBundle)=>boolean;onWithdraw:()=>void}) {
  const [profile,setProfile]=useState<GalaxyProfile>(()=>own?.profile??{id:`galaxy-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,name:"星际旅人",title:"我的小宇宙",bio:"在这片银河，留下我的声音。",color:nebulaColors[0],mood:"空灵"});
  const [projects,setProjects]=useState<StarScoreProject[]>([]);
  const [selected,setSelected]=useState<string[]>(()=>own?.works.map(work=>work.project.id)??[]);
  const [loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  const dialog=useRef<HTMLElement>(null),alive=useRef(true),pending=useRef(false);
  useDialogFocus(dialog,true,onClose);
  useEffect(()=>{let active=true;alive.current=true;listProjects().then(local=>{
    if(!active)return;
    const merged=[...local,...(own?.works.map(work=>work.project).filter(project=>!local.some(item=>item.id===project.id))??[])].filter(project=>project.tracks.lead.events.length>0);
    setProjects(merged);setSelected(current=>current.length?current:merged[0]?[merged[0].id]:[]);setLoading(false);
  }).catch(()=>{if(active){setLoading(false);setMessage("本地作品暂时无法读取，请关闭后重试。")}});return()=>{active=false;alive.current=false}},[]);
  const toggle=(id:string)=>setSelected(current=>current.includes(id)?current.filter(item=>item!==id):current.length<GALAXY_WORK_LIMIT?[...current,id]:current);
  const sample=async()=>{
    if(pending.current)return;pending.current=true;setBusy(true);setMessage("");
    try{const project=createMaterialCopy(catalogItems.find(item=>item.id==="aurora-letter")!);await saveProject(project);if(alive.current){setProjects(current=>[project,...current]);setSelected([project.id])}}
    catch{if(alive.current)setMessage("示例星谱保存失败，请稍后重试。")}
    finally{pending.current=false;if(alive.current)setBusy(false)}
  };
  const publish=()=>{
    try{const chosen=projects.filter(project=>selected.includes(project.id));const bundle=createGalaxyBundle(profile,chosen);if(onPublish(bundle))onClose();else setMessage("星云暂时无法保存，请稍后重试。")}
    catch(error){setMessage(error instanceof Error?error.message:"星云尚未点亮，请检查选择的星谱。")}
  };
  return <div className="galaxy-dialog-backdrop"><section className="galaxy-composer" ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="galaxy-composer-title" aria-describedby="galaxy-composer-description" style={{"--nebula-color":profile.color} as CSSProperties}>
    <div className="galaxy-dialog-heading"><div><p>YOUR LITTLE UNIVERSE</p><h2 id="galaxy-composer-title">分享我的星系</h2></div><button className="galaxy-icon" aria-label="关闭星系分享" onClick={onClose}><X size={19}/></button></div>
    <p className="galaxy-dialog-description" id="galaxy-composer-description">选几段星谱，让你的星云被听见。本机点亮后，可导出星系文件分享给好友。</p>
    <form onSubmit={event=>{event.preventDefault();publish()}}>
      <div className="galaxy-composer-profile"><NebulaArt id="composer" color={profile.color} project={projects.find(project=>selected.includes(project.id))}/><div><label>你的昵称<input data-autofocus required maxLength={20} value={profile.name} onChange={event=>setProfile(current=>({...current,name:event.target.value}))}/></label><label>星云名称<input required maxLength={24} value={profile.title} onChange={event=>setProfile(current=>({...current,title:event.target.value}))}/></label></div></div>
      <label className="galaxy-bio-field">写给路过的人<textarea maxLength={160} rows={2} value={profile.bio} onChange={event=>setProfile(current=>({...current,bio:event.target.value}))}/></label>
      <div className="galaxy-composer-options"><fieldset><legend>星云色彩</legend><div className="nebula-colors">{nebulaColors.map(color=><button type="button" key={color} style={{background:color}} aria-label={`星云颜色 ${color}`} aria-pressed={profile.color===color} onClick={()=>setProfile(current=>({...current,color}))}>{profile.color===color&&<Check size={13}/>}</button>)}</div></fieldset><fieldset><legend>音乐气质</legend><div className="galaxy-mood-buttons">{(["空灵","温暖","律动"] as GalaxyMood[]).map(mood=><button type="button" key={mood} className={profile.mood===mood?"selected":""} aria-pressed={profile.mood===mood} onClick={()=>setProfile(current=>({...current,mood}))}>{mood}</button>)}</div></fieldset></div>
      <div className="galaxy-pick-heading"><strong>选择分享的星谱</strong><span>{selected.length} / {GALAXY_WORK_LIMIT}</span></div>
      {loading?<p className="galaxy-composer-empty">正在读取本地星谱…</p>:projects.length?<div className="galaxy-project-picker">{projects.map(project=><label key={project.id} className={selected.includes(project.id)?"selected":""}><input type="checkbox" checked={selected.includes(project.id)} disabled={!selected.includes(project.id)&&selected.length>=GALAXY_WORK_LIMIT} onChange={()=>toggle(project.id)}/><span><strong>{project.title}</strong><small>4 小节 · {project.tracks.lead.events.filter(note=>note.origin==="user").length} 颗原旋律星点</small></span><Sparkles size={15}/></label>)}</div>:<div className="galaxy-composer-empty"><Sparkles size={24}/><p>先在画室保存一段星谱，或用一段原创示例体验分享。</p><button type="button" className="galaxy-secondary" disabled={busy} onClick={()=>void sample()}>{busy?<LoaderCircle size={15} className="spin"/>:<Plus size={15}/>}用示例试试</button></div>}
      {message&&<p className="galaxy-inline-message" role="alert">{message}</p>}
      <p className="galaxy-share-note">只分享勾选的星谱副本。创作后的修改，可再次打开这里更新。</p>
      <div className="galaxy-composer-footer">{own?<button type="button" className="galaxy-quiet" onClick={onWithdraw}>移出本机银河</button>:<span>每个人，都值得一团星云。</span>}<button type="submit" className="galaxy-primary" disabled={loading||busy||!selected.length}><Sparkles size={16}/>{own?"更新我的星云":"点亮我的星云"}</button></div>
    </form>
  </section></div>;
}
