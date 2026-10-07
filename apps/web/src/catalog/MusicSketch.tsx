import type { StarScoreProject } from "@starscore/core";
import type { CatalogItem } from "./catalog";

export function MusicSketch({item,project,activeId=null,hero=false}:{item:CatalogItem;project:StarScoreProject;activeId?:string|null;hero?:boolean}) {
  const points=project.tracks.lead.events.map(note=>({id:note.id,x:12+(project.layout.notes[note.id]?.xNorm??.5)*146,y:94-(note.pitch-60)*4.1,origin:note.origin}));
  return <svg className="music-sketch" viewBox="0 0 170 128" aria-hidden="true">
    {Array.from({length:21},(_,index)=><circle key={`bg-${index}`} cx={(index*43+item.id.length*7)%170} cy={(index*29+13)%128} r={index%6===0?1:.5} fill="#c9dce9" opacity={.14+(index%3)*.08}/>)}
    <circle cx="86" cy="64" r="54" fill="none" stroke={item.color} strokeWidth=".6" opacity=".12"/>
    <text x="84" y="44" fill={item.color} textAnchor="middle" fontSize={hero?34:29} opacity=".66">{item.symbol}</text>
    {points.slice(0,-1).map((point,index)=><line key={`line-${point.id}`} x1={point.x} y1={point.y} x2={points[index+1]!.x} y2={points[index+1]!.y} stroke={item.color} strokeWidth="1" strokeDasharray={point.origin==="rules"?"3 3":undefined} opacity={point.origin==="user"?.42:.27}/>)}
    {points.map(point=><g key={point.id}><circle cx={point.x} cy={point.y} r={point.id===activeId?9:5.2} fill={item.color} opacity={point.id===activeId?.3:.09}/><circle cx={point.x} cy={point.y} r={point.id===activeId?3:1.9} fill={point.id===activeId?"#fff0ca":item.color}/></g>)}
  </svg>;
}
