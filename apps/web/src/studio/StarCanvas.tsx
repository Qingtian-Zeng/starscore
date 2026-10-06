import { useRef } from "react";
import type { NoteEvent } from "@starscore/core";
import { CANVAS_HEIGHT, CANVAS_WIDTH, pitchToY, xNormToX, xToNorm, yToPitch } from "./geometry";

interface Props {
  notes: NoteEvent[]; layout: Record<string, { xNorm: number }>; selectedId: string | null; activeId: string | null; progress: number;
  candidateNotes?: NoteEvent[];
  readOnly?: boolean;
  reconnectFromId: string | null; onSelect: (id: string) => void; onCreate: (pitch: number, xNorm: number) => void; onMove: (id: string, pitch: number, xNorm: number) => void; onDragStart: () => void; onDragCommit: () => void;
}

export function StarCanvas(props: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<{ id: string; moved: boolean } | null>(null);
  const point = (event: React.PointerEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / rect.width * CANVAS_WIDTH, y: (event.clientY - rect.top) / rect.height * CANVAS_HEIGHT };
  };
  const ordered = props.notes;
  const points = ordered.map(note => ({ id: note.id, x: xNormToX(props.layout[note.id]?.xNorm ?? .5), y: pitchToY(note.pitch) }));
  const head = props.progress <= 0 || !points.length ? null : interpolate(points, props.progress);
  return <svg ref={svgRef} className="canvas" viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} role="application" aria-label={props.readOnly?"星图演奏画布":"星图作曲画布。点击空白创建星点，拖动星点改变音高和构图。"}
    onPointerDown={event => { if(props.readOnly)return;const p = point(event); props.onCreate(yToPitch(p.y), xToNorm(p.x)); }}>
    <defs><radialGradient id="starGlow"><stop offset="0" stopColor="#fff"/><stop offset=".3" stopColor="#9ff7f3"/><stop offset="1" stopColor="#65e6e2" stopOpacity="0"/></radialGradient><radialGradient id="responseGlow"><stop offset="0" stopColor="#fff"/><stop offset=".3" stopColor="#dacbff"/><stop offset="1" stopColor="#bfa2f6" stopOpacity="0"/></radialGradient></defs>
    <rect width="750" height="560" fill="transparent" />
    {[...Array(46)].map((_, i) => <circle key={i} cx={(i * 113) % 750} cy={(i * 67) % 560} r={i % 7 === 0 ? 1.5 : .8} fill="#b8d8e8" opacity={.12 + (i % 4) * .06} />)}
    {[60,62,64,67,69,72,74,76].map(pitch => <line key={pitch} x1="42" x2="708" y1={pitchToY(pitch)} y2={pitchToY(pitch)} stroke="#9bcfe9" strokeOpacity=".055" />)}
    <line x1="375" x2="375" y1="36" y2="524" stroke="#bfa2f6" strokeOpacity=".16" strokeDasharray="5 8"/><text x="395" y="55" fill="#bfa2f6" opacity=".7" fontSize="12">回应 · 后两小节</text>
    {points.slice(0,-1).map((p, i) => <line key={p.id} x1={p.x} y1={p.y} x2={points[i+1]!.x} y2={points[i+1]!.y} stroke="#65e6e2" strokeOpacity=".42" strokeWidth="2" />)}
    {points.map((p, index) => {
      const note = ordered[index]!; const selected = note.id === props.selectedId; const active = note.id === props.activeId;
      const tailLength = 13 + note.durationTick / 20; const halo = 14 + note.velocity * 28;
      return <g key={note.id} transform={`translate(${p.x} ${p.y})`} style={{ cursor: props.readOnly?"default":"grab" }} role={props.readOnly?undefined:"button"} tabIndex={props.readOnly?undefined:0} aria-label={`第 ${index + 1} 颗星，音高 ${note.pitch}，${note.durationTick/480} 拍，力度 ${Math.round(note.velocity*100)}%`}
        onPointerDown={event => { if(props.readOnly)return;event.stopPropagation(); props.onDragStart(); dragging.current = { id: note.id, moved: false }; event.currentTarget.setPointerCapture(event.pointerId); props.onSelect(note.id); }}
        onPointerMove={event => { if (dragging.current?.id !== note.id) return; dragging.current.moved = true; const q = point(event); props.onMove(note.id, yToPitch(q.y), xToNorm(q.x)); }}
        onPointerUp={event => { event.currentTarget.releasePointerCapture(event.pointerId); if (dragging.current?.moved) props.onDragCommit(); dragging.current = null; }}>
        <line x1="9" y1="4" x2={tailLength} y2="13" stroke="#65e6e2" strokeOpacity={.22 + note.velocity*.28} strokeWidth={2 + note.durationTick/420} strokeLinecap="round" />
        <circle r={halo} fill="url(#starGlow)" opacity={active ? .62 : selected ? .34 : .08 + note.velocity*.08} />
        <circle r={active ? 9 : 7} fill={active ? "#ffc66d" : "#a4fffa"} stroke="#eaffff" strokeWidth={selected ? 2.5 : 1} />
        <circle r="18" fill="transparent" stroke={props.reconnectFromId === note.id ? "#ffc66d" : selected ? "#65e6e2" : "transparent"} strokeWidth="1.5" strokeDasharray="3 5" />
        {index === 0 && <text x="-2" y="-25" textAnchor="middle" fill="#91a8bc" fontSize="12">起点</text>}
      </g>;
    })}
    {(props.candidateNotes??[]).map((note,index,all)=>{const step=Math.min(46,240/Math.max(1,all.length-1));const x=props.layout[note.id]?xNormToX(props.layout[note.id]!.xNorm):430+index*step;const y=pitchToY(note.pitch);const prior=all[index-1];const previous=prior?{x:props.layout[prior.id]?xNormToX(props.layout[prior.id]!.xNorm):430+(index-1)*step,y:pitchToY(prior.pitch)}:null;const active=note.id===props.activeId;return <g key={note.id}>{previous&&<line x1={previous.x} y1={previous.y} x2={x} y2={y} stroke="#bfa2f6" strokeWidth="2" strokeDasharray="5 6" opacity=".58"/>}<circle cx={x} cy={y} r={15+note.velocity*18} fill="url(#responseGlow)" opacity={active ? .55 : .2}/><circle cx={x} cy={y} r={active?10:8} fill={active?"#ffc66d":"#d7c5ff"} stroke="#f3edff" strokeWidth="1.5"/><circle cx={x} cy={y} r="18" fill="none" stroke="#bfa2f6" strokeDasharray="3 5" opacity=".8"/></g>})}
    {head && <circle cx={head.x} cy={head.y} r="5" fill="#ffc66d" stroke="#fff2d8" strokeWidth="2" />}
  </svg>;
}

function interpolate(points: {x:number;y:number}[], progress: number) {
  if (points.length === 1) return points[0]!;
  const scaled = progress * (points.length - 1); const i = Math.min(points.length - 2, Math.floor(scaled)); const t = scaled - i;
  return { x: points[i]!.x + (points[i+1]!.x - points[i]!.x) * t, y: points[i]!.y + (points[i+1]!.y - points[i]!.y) * t };
}
