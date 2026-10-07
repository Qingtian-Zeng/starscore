import type { StarScoreProject } from "@starscore/core";
import { useId } from "react";

function ribbon(phase:number,seed:number) {
  return Array.from({length:44},(_,index)=>{
    const angle=.35+index*.13+phase,radius=6+index*1.26;
    const x=72+Math.cos(angle)*radius,y=72+Math.sin(angle)*radius*.61+Math.sin(index*.7+seed)*1.2;
    return `${index===0?"M":"L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}

export function NebulaArt({id,color,project,activeId=null}:{id:string;color:string;project?:StarScoreProject;activeId?:string|null}) {
  const unique=useId();
  const safeId=`nebula-${id.replace(/[^a-zA-Z0-9_-]/g,"-")}-${unique.replace(/[^a-zA-Z0-9_-]/g,"")}`;
  const seed=Array.from(id).reduce((sum,char)=>sum+char.charCodeAt(0),0);
  const notes=project?.tracks.lead.events??[];
  const range=notes.reduce(({min,max},note)=>({min:Math.min(min,note.pitch),max:Math.max(max,note.pitch)}),{min:127,max:0});
  const pitchCenter=notes.length?(range.min+range.max)/2:72;
  const pitchScale=Math.min(1.8,34/Math.max(1,range.max-range.min));
  const offsetX=(seed%7-3)*.75,offsetY=(Math.floor(seed/7)%7-3)*.8;
  const scoreTilt=(seed%11-5)*1.7,phase=seed%13*.35;
  // A compact melody follows the cloud's axis, with a small personal drift.
  // Normalizing pitch keeps high/low imported scores inside their own nebula.
  const points=notes.map(note=>{
    const time=Math.max(0,Math.min(1,project?.layout.notes[note.id]?.xNorm??.5));
    return {id:note.id,x:30+time*84+offsetX,y:72-(note.pitch-pitchCenter)*pitchScale+Math.sin(time*Math.PI*1.4+phase)*4+offsetY};
  });
  return <svg className="nebula-art" viewBox="0 0 144 144" aria-hidden="true">
    <defs>
      <radialGradient id={`${safeId}-cloud`}><stop stopColor={color} stopOpacity=".82"/><stop offset=".38" stopColor={color} stopOpacity=".46"/><stop offset="1" stopColor={color} stopOpacity="0"/></radialGradient>
      <radialGradient id={`${safeId}-light`}><stop stopColor="#fff9e7"/><stop offset=".15" stopColor="#ffead8" stopOpacity=".92"/><stop offset=".36" stopColor={color} stopOpacity=".67"/><stop offset="1" stopColor={color} stopOpacity="0"/></radialGradient>
      <linearGradient id={`${safeId}-rim`}><stop stopColor={color} stopOpacity=".12"/><stop offset=".5" stopColor={color}/><stop offset=".74" stopColor="#d3edff" stopOpacity=".8"/><stop offset="1" stopColor={color} stopOpacity=".05"/></linearGradient>
      <filter id={`${safeId}-blur`} x="-40%" y="-70%" width="180%" height="240%"><feGaussianBlur stdDeviation="4"/></filter>
      <filter id={`${safeId}-gas`} x="-40%" y="-70%" width="180%" height="240%" colorInterpolationFilters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".065" numOctaves="2" seed={seed%29} result="gas"/><feDisplacementMap in="SourceGraphic" in2="gas" scale="11" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="1.1"/></filter>
    </defs>
    <g className="nebula-system" transform={`rotate(${seed%160-80} 72 72)`}>
    <g className="nebula-cloud">
      <ellipse cx="72" cy="72" rx="69" ry="48" fill={`url(#${safeId}-cloud)`} opacity=".75"/>
      <g filter={`url(#${safeId}-gas)`}>{Array.from({length:8},(_,i)=><ellipse key={i} cx={29+(seed+i*29)%87} cy={43+(seed+i*19)%59} rx={21+i%3*9} ry={13+i%2*10} fill={`url(#${safeId}-cloud)`} opacity=".65"/>)}</g>
      <g fill="none" strokeLinecap="round">{[0,Math.PI].map((phase,index)=><g key={phase}>
        <path d={ribbon(phase,seed)} stroke={color} strokeWidth="17" opacity=".58" filter={`url(#${safeId}-blur)`}/>
        <path d={ribbon(phase,seed)} stroke={`url(#${safeId}-rim)`} strokeWidth={index===0?8:5} opacity=".9" filter={`url(#${safeId}-gas)`}/>
        <path d={ribbon(phase+.08,seed)} stroke="#eef7ff" strokeWidth=".65" opacity=".36"/>
      </g>)}</g>
      <path d="M20 86C39 62 59 76 73 68S106 58 130 65" stroke="#080e29" strokeWidth="5" fill="none" opacity=".58" filter={`url(#${safeId}-gas)`}/>
      <ellipse cx="73" cy="71" rx="25" ry="18" fill={`url(#${safeId}-light)`}/>
      <circle cx="73" cy="71" r="1.7" fill="#fff3dc"/>
    </g>
    <g className="nebula-score" transform={`rotate(${scoreTilt} 72 72)`}>
      {points.slice(0,-1).map((point,i)=><line key={`link-${point.id}`} x1={point.x} y1={point.y} x2={points[i+1]!.x} y2={points[i+1]!.y} stroke="#d9e7ff" strokeWidth=".65" opacity=".66"/>)}
      {points.map(point=><g key={point.id}><circle cx={point.x} cy={point.y} r={point.id===activeId?9:4} fill={color} opacity={point.id===activeId?.55:.13}/><circle cx={point.x} cy={point.y} r={point.id===activeId?2.6:1.4} fill={point.id===activeId?"#fff4d9":"#edf7ff"}/></g>)}
    </g>
    </g>
    {Array.from({length:36},(_,i)=><circle key={`dust-${i}`} cx={18+(seed+i*43)%108} cy={23+(seed+i*31)%101} r={i%7===0?1.2:.45} fill={i%4===0?color:"#edf4ff"} opacity={.35+i%3*.19}/>)}
  </svg>;
}
