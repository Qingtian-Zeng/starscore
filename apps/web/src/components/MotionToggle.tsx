import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

export function MotionToggle(){const[reduced,setReduced]=useState(()=>localStorage.getItem("starscore-reduced-motion")==="true"||matchMedia("(prefers-reduced-motion: reduce)").matches);useEffect(()=>{document.documentElement.dataset.motion=reduced?"reduced":"full";localStorage.setItem("starscore-reduced-motion",String(reduced))},[reduced]);return <label className="motion-toggle"><Activity size={16}/><span>减少动态</span><input type="checkbox" checked={reduced} onChange={event=>setReduced(event.target.checked)}/></label>}
