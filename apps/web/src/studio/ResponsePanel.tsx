import { Check, CirclePlay, RefreshCw, Sparkles, WandSparkles, X } from "lucide-react";
import type { ResponseCandidate, ResponseProvider } from "@starscore/core";

interface Props { status:"idle"|"generating"|"ready"|"previewing"|"error"|"stale"; provider:ResponseProvider; modelConfigured:boolean; candidates:ResponseCandidate[]; activeId:string|null; error:string; onProvider:(provider:ResponseProvider)=>void; onGenerate:()=>void; onPreview:(candidate:ResponseCandidate)=>void; onAccept:(candidate:ResponseCandidate)=>void; onCancel:()=>void; }
export function ResponsePanel(props:Props){return <section className="response-panel" aria-label="回应候选"><div className="panel-title"><div><span className="panel-kicker">后两小节</span><h3>星际回应</h3></div><span className={`source-badge ${props.provider}`}>{props.provider==="model"?"AI 回应":"规则演示"}</span></div>
  <div className="provider-switch"><button className={props.provider==="rules"?"active":""} onClick={()=>props.onProvider("rules")}><WandSparkles size={15}/>规则演示</button><button className={props.provider==="model"?"active":""} onClick={()=>props.onProvider("model")} disabled={!props.modelConfigured}><Sparkles size={15}/>真实 AI</button></div>
  {!props.modelConfigured&&<p className="response-help">未检测到服务端模型配置。规则演示可完整体验流程，真实模型调用待配置。</p>}
  <button className="generate-button" onClick={props.onGenerate} disabled={props.status==="generating"}>{props.status==="generating"?<RefreshCw className="spin" size={17}/>:<Sparkles size={17}/>} {props.status==="generating"?"正在生成…":"生成回应"}</button>
  {props.error&&<div className="response-error"><p>{props.error}</p>{props.provider==="model"&&<button onClick={()=>props.onProvider("rules")}>切换规则演示</button>}</div>}
  {props.candidates.length>0&&<div className="candidate-list">{props.candidates.map(candidate=><article key={candidate.id} className={`candidate-card ${props.activeId===candidate.id?"active":""}`}><div><strong>候选 {candidate.label}</strong><span>{candidate.notes.length} 颗紫色回应星</span></div><div className="candidate-actions"><button onClick={()=>props.onPreview(candidate)}><CirclePlay size={16}/>试听</button><button className="accept" onClick={()=>props.onAccept(candidate)}><Check size={16}/>采用</button></div></article>)}</div>}
  {props.candidates.length>0&&<button className="cancel-response" onClick={props.onCancel}><X size={15}/>取消候选（不改作品）</button>}
  {props.status==="stale"&&<p className="response-help stale">原旋律已修改，旧候选已作废，请重新生成。</p>}
  </section>}
