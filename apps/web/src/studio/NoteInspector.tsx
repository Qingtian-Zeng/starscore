import { Link2, Trash2 } from "lucide-react";
import { pitchNames, type NoteEvent } from "@starscore/core";

interface Props { note: NoteEvent | undefined; remainingTicks: number; reconnecting: boolean; onDuration: (ticks:number)=>void; onVelocity:(value:number)=>void; onDelete:()=>void; onReconnect:()=>void; }
export function NoteInspector({note,remainingTicks,reconnecting,onDuration,onVelocity,onDelete,onReconnect}:Props) {
  if (!note) return <section className="inspector empty"><p>选择一颗星</p><span>调整音长、力度与播放顺序</span></section>;
  return <section className="inspector" aria-label="音符编辑">
    <div className="inspector-head"><div><span className="panel-kicker">选中音符</span><strong>{pitchNames[note.pitch]}</strong></div><span className="budget">剩余 {remainingTicks/480} 拍</span></div>
    <label>音长 <span>{note.durationTick/480} 拍</span></label>
    <div className="segmented">{[[240,"0.5"],[480,"1"],[960,"2"]].map(([ticks,label])=><button key={ticks} className={note.durationTick===ticks?"active":""} onClick={()=>onDuration(Number(ticks))}>{label} 拍</button>)}</div>
    <label htmlFor="velocity">力度 <span>{Math.round(note.velocity*100)}%</span></label>
    <input id="velocity" aria-label="力度" type="range" min="10" max="100" step="5" value={Math.round(note.velocity*100)} onChange={e=>onVelocity(Number(e.target.value)/100)} />
    <div className="inspector-actions"><button className={reconnecting?"active":""} onClick={onReconnect}><Link2 size={17}/>{reconnecting?"选择目标":"重连顺序"}</button><button className="danger" onClick={onDelete}><Trash2 size={17}/>删除</button></div>
  </section>;
}
