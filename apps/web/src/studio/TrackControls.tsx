import { Drum, Music2, Waves } from "lucide-react";
import type { DrumInstrument, StarScoreProject } from "@starscore/core";

interface Props { project: StarScoreProject; onToggle:(track:"lead"|"bass"|"drums",enabled:boolean)=>void; onDrum:(slot:number,instrument:DrumInstrument|null)=>void; }
const instruments: Array<DrumInstrument|null> = [null,"kick","tap","hat"];
export function TrackControls({project,onToggle,onDrum}:Props) {
  const slotInstrument = (slot:number) => project.tracks.drums.events.find(event=>event.startTick<1920 && event.startTick===slot*240)?.instrument ?? null;
  return <section className="tracks-panel" aria-label="规则伴奏">
    <div className="panel-title"><div><span className="panel-kicker">RULE ACCOMPANIMENT</span><h3>规则伴奏</h3></div><span>同一音乐时钟</span></div>
    <div className="track-switches">
      <Track icon={<Music2 size={18}/>} label="旋律" enabled={project.mixer.lead.enabled} onChange={v=>onToggle("lead",v)}/>
      <Track icon={<Waves size={18}/>} label="低音" enabled={project.mixer.bass.enabled} onChange={v=>onToggle("bass",v)}/>
      <Track icon={<Drum size={18}/>} label="节奏" enabled={project.mixer.drums.enabled} onChange={v=>onToggle("drums",v)}/>
    </div>
    <div className="drum-label"><span>八格鼓环</span><small>单击轮换：空 / kick / tap / hat</small></div>
    <div className="drum-ring">{Array.from({length:8},(_,slot)=>{const value=slotInstrument(slot); return <button key={slot} aria-label={`鼓环第 ${slot+1} 格，${value ?? "空"}`} className={value??"empty"} onClick={()=>onDrum(slot,instruments[(instruments.indexOf(value)+1)%instruments.length] ?? null)}><span>{slot+1}</span><b>{value?.slice(0,1).toUpperCase() ?? "–"}</b></button>})}</div>
  </section>;
}
function Track({icon,label,enabled,onChange}:{icon:React.ReactNode;label:string;enabled:boolean;onChange:(v:boolean)=>void}) { return <label className="track-toggle">{icon}<span>{label}</span><input type="checkbox" checked={enabled} onChange={e=>onChange(e.target.checked)}/><i aria-hidden="true"/></label>; }
