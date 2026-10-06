import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { CircleStop, Download, FileMusic, FolderOpen, Play, Plus, Redo2, Save, Sparkles, Undo2, Upload, Presentation } from "lucide-react";
import { acceptedResponseNotes, applyResponseCandidate, createBlankProject, createNightSailProject, createResponseRequest, exportProjectJson, importProjectJson, pitchNames, userNotes, type ResponseCandidate, type ResponsePayload, type ResponseProvider } from "@starscore/core";
import { audioEngine } from "../audio/AudioEngine";
import { StarCanvas } from "./StarCanvas";
import { initialStudioState, studioReducer } from "./studioReducer";
import { NoteInspector } from "./NoteInspector";
import { TrackControls } from "./TrackControls";
import { getProject, saveProject } from "../storage/projectRepository";
import { downloadHref, safeFilename } from "../files/download";
import { exportProjectMidi } from "../files/midi";
import { getAiHealth, requestResponses } from "../ai/client";
import { ResponsePanel } from "./ResponsePanel";
import { MotionToggle } from "../components/MotionToggle";
import { AccessibleNoteList } from "../components/AccessibleNoteList";
import { isNativeApp, shareProjectFile } from "../platform/files";

export function StudioPage({projectId,blank,navigate}:{projectId?:string;blank?:boolean;navigate:(hash:string)=>void}) {
  const [state, dispatch] = useReducer(studioReducer, blank?createBlankProject():createNightSailProject(), initialStudioState);
  const [playing, setPlaying] = useState(false); const [activeId, setActiveId] = useState<string | null>(null); const [progress, setProgress] = useState(0); const [audioError, setAudioError] = useState(false);
  const [loadStatus,setLoadStatus]=useState<"ready"|"loading"|"missing"|"error">(projectId?"loading":"ready");
  const [responseStatus,setResponseStatus]=useState<"idle"|"generating"|"ready"|"previewing"|"error"|"stale">("idle"); const [provider,setProvider]=useState<ResponseProvider>("rules"); const [modelConfigured,setModelConfigured]=useState(false); const [responsePayload,setResponsePayload]=useState<ResponsePayload|null>(null); const [activeCandidateId,setActiveCandidateId]=useState<string|null>(null); const [responseError,setResponseError]=useState("");
  const lastAuditionAt = useRef(0);
  const requestController=useRef<AbortController|null>(null); const projectRef=useRef(state.project); projectRef.current=state.project;
  const importInput = useRef<HTMLInputElement>(null);
  const notes = userNotes(state.project);
  const selected = useMemo(() => notes.find(note => note.id === state.selectedId), [notes, state.selectedId]);
  const stop = () => { audioEngine.stop(); setPlaying(false); setActiveId(null); setProgress(0); };
  const play = async () => {
    if (!notes.length) { dispatch({ type: "message", message: "先在画布上点一颗星，再开始播放。" }); return; }
    try { setAudioError(false); setPlaying(true); setProgress(0); await audioEngine.play(state.project, { onNote: setActiveId, onProgress: setProgress, onEnded: () => setPlaying(false) }); }
    catch (error) { console.error("StarScore audio start failed", error); setPlaying(false); setAudioError(true); dispatch({ type: "message", message: "音频启动失败。请检查浏览器声音权限，然后重试。" }); }
  };
  const audition = async (id: string) => { const now = performance.now(); if (now - lastAuditionAt.current < 90) return; lastAuditionAt.current = now; const note = notes.find(item => item.id === id); if (!note) return; try { await audioEngine.audition(note); } catch { setAudioError(true); } };
  useEffect(() => {
    const onVisibility = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", onVisibility); window.addEventListener("pagehide", stop);
    return () => { document.removeEventListener("visibilitychange", onVisibility); window.removeEventListener("pagehide", stop); audioEngine.dispose(); };
  }, []);
  useEffect(()=>{const controller=new AbortController();getAiHealth(controller.signal).then(value=>setModelConfigured(value.modelConfigured)).catch(()=>setModelConfigured(false));return()=>controller.abort()},[]);
  useEffect(()=>{if(responsePayload&&responsePayload.seedRevision!==state.project.seedRevision){setResponseStatus("stale");setActiveCandidateId(null)}},[state.project.seedRevision,responsePayload]);
  useEffect(()=>()=>requestController.current?.abort(),[projectId,blank]);
  useEffect(()=>{let active=true;if(blank){setLoadStatus("ready");dispatch({type:"load",project:createBlankProject(),message:"空白星图已准备好，可以点亮第一颗星。"});return;}if(projectId){setLoadStatus("loading");getProject(projectId).then(project=>{if(!active)return;if(project){setLoadStatus("ready");dispatch({type:"load",project,message:"已从本机作品库打开。"})}else{setLoadStatus("missing");dispatch({type:"message",message:"没有找到这个本地作品。当前示例仍保留，可前往我的星系或导入 JSON。"})}}).catch(()=>{setLoadStatus("error");dispatch({type:"message",message:"读取本地作品失败，当前内存稿仍保留；请前往我的星系重试。"})});}return()=>{active=false}},[projectId,blank]);
  const edit = (action: Parameters<typeof dispatch>[0]) => { stop(); dispatch(action); };
  const remainingTicks = 3840 - notes.reduce((sum,note)=>sum+note.durationTick,0);
  const selectStar = (id:string) => { if (state.reconnectFromId) edit({type:"reconnectComplete",id}); else { dispatch({type:"select",id}); void audition(id); } };
  const save=async()=>{try{await saveProject(state.project);dispatch({type:"message",message:"已保存到这台设备。"});if(projectId!==state.project.id)navigate(`#/studio/${state.project.id}`);}catch{dispatch({type:"message",message:"保存失败，内存稿仍保留；你仍可导出 JSON。"})}};
  const jsonDownload=useMemo(()=>{const name=`${safeFilename(state.project.title)}.starscore.json`;return{href:downloadHref(exportProjectJson(state.project),"application/json",name),name}},[state.project]);
  const midiDownload=useMemo(()=>{const name=`${safeFilename(state.project.title)}.mid`;return{href:downloadHref(exportProjectMidi(state.project),"audio/midi",name),name}},[state.project]);
  const native=isNativeApp();
  const shareJson=async()=>{try{await shareProjectFile(exportProjectJson(state.project),jsonDownload.name,"分享星谱项目");dispatch({type:"message",message:"已打开系统分享面板。"})}catch{dispatch({type:"message",message:"分享 JSON 失败，内存稿仍保留。"})}};
  const shareMidi=async()=>{try{await shareProjectFile(exportProjectMidi(state.project),midiDownload.name,"分享星谱 MIDI");dispatch({type:"message",message:"已打开系统分享面板。"})}catch{dispatch({type:"message",message:"分享 MIDI 失败，作品未改变。"})}};
  const importFile=async(file?:File)=>{if(!file)return;if(file.size>1024*1024){dispatch({type:"message",message:"项目文件超过 1 MB，当前作品未改变。"});return;}const result=importProjectJson(await file.text());if(!result.ok){dispatch({type:"message",message:result.message});return;}try{await saveProject(result.project);stop();dispatch({type:"load",project:result.project,message:"已导入为新的本地作品。"});navigate(`#/studio/${result.project.id}`);}catch{dispatch({type:"message",message:"文件有效但保存失败，当前作品未改变。"})}};
  const generateResponses=async()=>{if(notes.length<4||notes.length>8){setResponseError("原旋律需要 4—8 颗星才能生成回应。");setResponseStatus("error");return;}const requestId=`request-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;const request=createResponseRequest(state.project,requestId,provider);const controller=new AbortController();requestController.current=controller;setResponseStatus("generating");setResponseError("");setResponsePayload(null);setActiveCandidateId(null);try{const payload=await requestResponses(request,controller.signal);const current=projectRef.current;if(payload.projectId!==current.id||payload.seedRevision!==current.seedRevision){setResponseStatus("stale");setResponseError("原旋律或项目已变化，旧请求结果已作废。");return;}setResponsePayload(payload);setActiveCandidateId(payload.candidates[0]?.id??null);setResponseStatus("ready");}catch(error){if(controller.signal.aborted)return;setResponseStatus("error");setResponseError(error instanceof Error?error.message:"回应生成失败，当前作品未改变。");}};
  const previewCandidate=async(candidate:ResponseCandidate)=>{try{stop();const preview=applyResponseCandidate(state.project,candidate,responsePayload!.provider,responsePayload!.seedRevision);setActiveCandidateId(candidate.id);setResponseStatus("previewing");setPlaying(true);await audioEngine.play(preview,{onNote:setActiveId,onProgress:setProgress,onEnded:()=>{setPlaying(false);setResponseStatus("ready")}});}catch(error){setResponseError(error instanceof Error?error.message:"候选试听失败");setResponseStatus("error")}};
  const acceptCandidate=(candidate:ResponseCandidate)=>{if(!responsePayload)return;stop();dispatch({type:"acceptResponse",candidate,provider:responsePayload.provider,seedRevision:responsePayload.seedRevision});setResponsePayload(null);setActiveCandidateId(null);setResponseStatus("idle")};
  const cancelCandidates=()=>{stop();setResponsePayload(null);setActiveCandidateId(null);setResponseError("");setResponseStatus("idle")};
  const visibleResponse=responsePayload?.candidates.find(candidate=>candidate.id===activeCandidateId)?.notes??acceptedResponseNotes(state.project);
  return <div className="app">
    <header className="topbar"><div className="brand"><div className="brand-mark"><Sparkles size={21}/></div><div><h1>星谱</h1><small>STARSCORE</small></div></div>
      <nav className="top-actions"><MotionToggle/><button className="new-button" onClick={()=>navigate("#/library")}><FolderOpen size={17}/>我的星系</button><button className="new-button" onClick={() => navigate("#/studio/new")}><Plus size={17}/>新建星图</button></nav>
    </header>
    <main className="workspace wide">
      <div className="title-row"><div><p className="eyebrow">星图画室 · 用户旋律</p><input className="title-input" aria-label="作品名称" value={state.project.title} onChange={e=>dispatch({type:"rename",title:e.target.value})}/></div><div className="meta"><span>90 BPM</span><span>C 五声音阶</span><span>4 / 4</span></div></div>
      <section className="file-toolbar" aria-label="作品与文件"><button onClick={()=>void save()}><Save size={17}/>保存</button><button onClick={()=>navigate(`#/play/${state.project.id}`)} disabled={loadStatus!=="ready"}><Presentation size={17}/>演奏页</button>{native?<button aria-label="分享 JSON" onClick={()=>void shareJson()}><Download size={17}/>JSON</button>:<a aria-label="JSON" href={jsonDownload.href} download={jsonDownload.name}><Download size={17}/>JSON</a>}<button onClick={()=>importInput.current?.click()}><Upload size={17}/>导入</button>{native?<button aria-label="分享 MIDI" onClick={()=>void shareMidi()}><FileMusic size={17}/>MIDI</button>:<a aria-label="MIDI" href={midiDownload.href} download={midiDownload.name}><FileMusic size={17}/>MIDI</a>}<input ref={importInput} hidden type="file" accept=".json,.starscore.json,application/json" onChange={e=>{void importFile(e.target.files?.[0]);e.currentTarget.value=""}}/></section>
      <div className="studio-grid"><div className="canvas-column"><section className="canvas-shell"><div className="hint">{state.reconnectFromId?"选择另一颗星，接到它后面":"拖高改音高 · 横移改构图"}</div><div className="counter">{notes.length} / 8 颗</div>
        <StarCanvas notes={notes} candidateNotes={visibleResponse} layout={state.project.layout.notes} selectedId={state.selectedId} activeId={activeId} progress={progress} reconnectFromId={state.reconnectFromId}
          onDragStart={()=>{stop();dispatch({type:"dragStart"})}} onDragCommit={()=>dispatch({type:"dragCommit"})} onSelect={selectStar}
          onCreate={(pitch,xNorm) => { stop(); dispatch({type:"add",pitch,xNorm}); }}
          onMove={(id,pitch,xNorm) => { dispatch({type:"move",id,pitch,xNorm}); void audition(id); }} />
      </section><p className={`status ${audioError||loadStatus==="error"||loadStatus==="missing" ? "error" : ""}`} aria-live="polite">{loadStatus==="loading"?"正在读取本地作品…":state.message}</p>{(loadStatus==="missing"||loadStatus==="error")&&<div className="recovery-inline"><button onClick={()=>navigate("#/library")}>前往我的星系</button><button onClick={()=>importInput.current?.click()}>导入 JSON</button></div>}<AccessibleNoteList notes={state.project.tracks.lead.events} selectedId={state.selectedId} onSelect={selectStar}/></div>
      <aside className="side-panel"><NoteInspector note={selected} remainingTicks={remainingTicks} reconnecting={Boolean(state.reconnectFromId)}
        onDuration={durationTick=>edit({type:"duration",id:selected!.id,durationTick})} onVelocity={velocity=>edit({type:"velocity",id:selected!.id,velocity})}
        onDelete={()=>edit({type:"delete",id:selected!.id})} onReconnect={()=>dispatch({type:"reconnectStart",id:selected!.id})}/>
        <TrackControls project={state.project} onToggle={(track,enabled)=>edit({type:"mixer",track,enabled})} onDrum={(slot,instrument)=>edit({type:"drum",slot,instrument})}/>
        <ResponsePanel status={responseStatus} provider={provider} modelConfigured={modelConfigured} candidates={responsePayload?.candidates??[]} activeId={activeCandidateId} error={responseError} onProvider={next=>{setProvider(next);setResponseError("")}} onGenerate={()=>void generateResponses()} onPreview={candidate=>void previewCandidate(candidate)} onAccept={acceptCandidate} onCancel={cancelCandidates}/>
      </aside></div>
      <section className="controls" aria-label="播放控制">
        <div className="history-controls"><button className="small-icon" aria-label="撤销" disabled={!state.past.length} onClick={()=>edit({type:"undo"})}><Undo2 size={19}/></button><button className="small-icon" aria-label="重做" disabled={!state.future.length} onClick={()=>edit({type:"redo"})}><Redo2 size={19}/></button><div className="selection"><strong>{selected ? pitchNames[selected.pitch] : "尚未选中"}</strong>{selected ? `第 ${notes.indexOf(selected)+1} 颗 · ${selected.durationTick/480} 拍` : "点击星点查看音高"}</div></div>
        <div className="transport">{playing ? <button className="icon-button primary" onClick={stop} aria-label="停止"><CircleStop size={25}/></button> : <button className="icon-button primary" onClick={play} disabled={!notes.length} aria-label="从头播放"><Play size={25} fill="currentColor"/></button>}</div>
        <div className="legend"><span className="legend-dot"/>青色 · 原旋律 <span className="legend-response"/>紫色 · 回应</div>
      </section>
    </main>
  </div>;
}
