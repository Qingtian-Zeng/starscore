import { useEffect, useState } from "react";
import { LibraryPage } from "./library/LibraryPage";
import { StudioPage } from "./studio/StudioPage";
import { PlayerPage } from "./player/PlayerPage";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { audioEngine } from "./audio/AudioEngine";
export function App(){const[hash,setHash]=useState(location.hash||"#/studio");useEffect(()=>{const change=()=>setHash(location.hash||"#/studio");window.addEventListener("hashchange",change);let remove:(()=>Promise<void>)|undefined;if(Capacitor.isNativePlatform())void CapacitorApp.addListener("appStateChange",({isActive})=>{if(!isActive)audioEngine.stop()}).then(handle=>{remove=()=>handle.remove()});return()=>{window.removeEventListener("hashchange",change);void remove?.()}},[]);const navigate=(next:string)=>{location.hash=next};if(hash.startsWith("#/library"))return <LibraryPage navigate={navigate}/>;const playId=hash.match(/^#\/play\/([^/]+)/)?.[1];if(playId)return <PlayerPage projectId={decodeURIComponent(playId)} navigate={navigate}/>;const projectId=hash.match(/^#\/studio\/([^/]+)/)?.[1];return <StudioPage projectId={projectId&&projectId!=="new"?decodeURIComponent(projectId):undefined} blank={projectId==="new"} navigate={navigate}/>;}
