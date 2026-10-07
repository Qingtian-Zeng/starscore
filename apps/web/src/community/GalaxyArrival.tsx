import { useEffect, useId, useRef, type CSSProperties } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { GalaxyBackdrop } from "./GalaxyBackdrop";
import { useDialogFocus } from "./useDialogFocus";

export function reduceGalaxyMotion() {
  return document.documentElement.dataset.motion==="reduced"||localStorage.getItem("starscore-reduced-motion")==="true"||matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function GalaxyArrival({onComplete}:{onComplete:()=>void}) {
  const panel=useRef<HTMLDivElement>(null),complete=useRef(onComplete);complete.current=onComplete;
  const titleId=useId();
  useDialogFocus(panel,true,()=>complete.current());
  useEffect(()=>{
    if(reduceGalaxyMotion()){complete.current();return}
    const finish=()=>complete.current();
    const timer=window.setTimeout(finish,1500);
    const media=matchMedia("(prefers-reduced-motion: reduce)");
    const motionChanged=()=>{if(reduceGalaxyMotion())finish()};
    const observer=new MutationObserver(motionChanged);
    observer.observe(document.documentElement,{attributes:true,attributeFilter:["data-motion"]});
    media.addEventListener?.("change",motionChanged);
    return()=>{window.clearTimeout(timer);observer.disconnect();media.removeEventListener?.("change",motionChanged)};
  },[]);
  return <div ref={panel} className="galaxy-arrival" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
    <GalaxyBackdrop className="galaxy-arrival-sky"/>
    <div className="galaxy-warp" aria-hidden="true">{Array.from({length:32},(_,index)=><i key={index} style={{"--ray-angle":`${index*11.25}deg`,"--ray-delay":`${index%5*-.12}s` } as CSSProperties}/>)}</div>
    <div className="galaxy-arrival-copy"><span><Sparkles size={20}/></span><p>STARSCORE · THE MUSIC GALAXY</p><h2 id={titleId}>正在进入银河</h2><small>循着旋律，抵达彼此的星云。</small><i aria-hidden="true"><b/></i></div>
    <button className="galaxy-arrival-skip" onClick={onComplete}>跳过动画<ArrowRight size={14}/></button>
  </div>;
}
