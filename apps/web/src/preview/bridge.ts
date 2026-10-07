import type { StarScoreProject } from "@starscore/core";
import { saveProject } from "../storage/projectRepository";
import { audioEngine } from "../audio/AudioEngine";
import { projectRoute, readProjectRoute } from "../navigation/projectRoutes";

declare global { interface Window { __STARSCORE_HTML_PREVIEW__?: boolean; } }
let currentProject: StarScoreProject | null = null;
export function publishPreviewProject(project: StarScoreProject, playing = false) {
  if (!window.__STARSCORE_HTML_PREVIEW__) return;
  currentProject = project;
  window.parent.postMessage({type:"starscore:project",project,playing},"*");
}
export function installPreviewBridge() {
  if (!window.__STARSCORE_HTML_PREVIEW__) return;
  const route=()=>window.parent.postMessage({type:"starscore:route",hash:location.hash||"#/community"},"*");
  window.addEventListener("hashchange",route);
  window.addEventListener("message",async event=>{
    if(event.source!==window.parent||!event.data||typeof event.data.type!=="string")return;
    const {type,value}=event.data;
    if(type==="starscore:appearance"){
      const s=value as Record<string,unknown>; const root=document.documentElement;
      for(const [name,key] of [["--cyan","accent"],["--response","response"],["--preview-height","canvasHeight"],["--preview-radius","radius"],["--preview-star-size","starSize"],["--preview-link-opacity","linkOpacity"]]){
        const raw=s[key!];if(typeof raw!=="string"&&typeof raw!=="number")continue;
        root.style.setProperty(name!,`${raw}${key==="canvasHeight"||key==="radius"?"px":""}`);
      }
      if(typeof s.accent==="string"&&/^#[0-9a-f]{6}$/i.test(s.accent)){
        const n=parseInt(s.accent.slice(1),16);root.style.setProperty("--cyan-soft",`rgba(${n>>16},${n>>8&255},${n&255},.18)`);
      }
      root.dataset.previewTheme=String(s.theme||"navy");
      for(const key of ["showPitch","showBackground","showNoteList","showInspector","showTracks","showResponses","showHints"]){root.dataset[key]=String(s[key]!==false);}
      root.dataset.simple=String(s.showInspector===false&&s.showTracks===false&&s.showResponses===false);
      if(typeof s.reducedMotion==="boolean")root.dataset.motion=s.reducedMotion?"reduced":"full";
    }
    if(type==="starscore:navigate"){
      try{
        audioEngine.stop();
        if(currentProject)await saveProject(currentProject);
        const target=String(value);
        const currentRoute=readProjectRoute(location.hash,location.hash.startsWith("#/play/")?"play":"studio");
        const origin=currentRoute.projectId===currentProject?.id?currentRoute.origin:undefined;
        location.hash=target==="zodiac"?"#/discover/zodiac":target==="materials"?"#/discover/materials":target==="community"?"#/community":target==="play"&&currentProject?projectRoute("play",currentProject.id,origin,currentRoute.galaxyId):target==="library"?"#/library":currentProject?projectRoute("studio",currentProject.id,origin,currentRoute.galaxyId):"#/studio";
      }catch(error){window.parent.postMessage({type:"starscore:error",message:error instanceof Error?error.message:"保存失败，当前作品保留在内存中。"},"*");}
    }
    if(type==="starscore:stop")audioEngine.stop();
  });
  window.addEventListener("pagehide",()=>audioEngine.stop());
  window.parent.postMessage({type:"starscore:ready"},"*");route();
}
