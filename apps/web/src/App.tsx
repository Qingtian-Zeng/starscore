import { useEffect, useLayoutEffect, useState } from "react";
import { LibraryPage } from "./library/LibraryPage";
import { StudioPage } from "./studio/StudioPage";
import { PlayerPage } from "./player/PlayerPage";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { audioEngine } from "./audio/AudioEngine";
import { CatalogPage } from "./catalog/CatalogPage";
import { readProjectRoute } from "./navigation/projectRoutes";
import { CommunityPage } from "./community/CommunityPage";

export function App() {
  const [hash, setHash] = useState(location.hash || "#/community");
  useEffect(() => {
    const change = () => setHash(location.hash || "#/community");
    window.addEventListener("hashchange", change);
    const removers: Array<() => Promise<void>> = [];
    if (Capacitor.isNativePlatform()) void CapacitorApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) audioEngine.stop();
    }).then(handle => { removers.push(() => handle.remove()); });
    if (Capacitor.isNativePlatform()) void CapacitorApp.addListener("backButton", () => {
      const event=new CustomEvent("starscore:native-back",{cancelable:true});
      if(!window.dispatchEvent(event))return;
      const current=location.hash||"#/community";
      if(/^#\/community\/.+/.test(current))location.hash="#/community";
      else if(current==="#/discover/zodiac"||current==="#/discover/materials"||current.startsWith("#/library"))location.hash="#/community";
      else if(current!=="#/community")history.back();
    }).then(handle => { removers.push(() => handle.remove()); });
    return () => { window.removeEventListener("hashchange", change); removers.forEach(remove=>void remove()); };
  }, []);
  useLayoutEffect(() => {
    if (hash !== "#/discover/zodiac" && hash !== "#/discover/materials" && !hash.startsWith("#/community")) window.scrollTo(0, 0);
  }, [hash]);
  const navigate = (next: string) => { location.hash = next; };
  if (hash === "#/discover/zodiac") return <CatalogPage key="zodiac" kind="zodiac" navigate={navigate}/>;
  if (hash === "#/discover/materials") return <CatalogPage key="materials" kind="materials" navigate={navigate}/>;
  if (hash.startsWith("#/library")) return <LibraryPage navigate={navigate}/>;
  if (hash === "#/community" || hash.startsWith("#/community/")) {
    let galaxyId: string | undefined;
    try { galaxyId = hash.match(/^#\/community\/([^/?]+)$/)?.[1]; if(galaxyId)galaxyId=decodeURIComponent(galaxyId); } catch { galaxyId=undefined; }
    return <CommunityPage galaxyId={galaxyId} navigate={navigate}/>;
  }
  const player = readProjectRoute(hash, "play");
  if (player.projectId) return <PlayerPage key={player.projectId} projectId={player.projectId} origin={player.origin} originGalaxyId={player.galaxyId} navigate={navigate}/>;
  const studio = readProjectRoute(hash, "studio");
  return <StudioPage key={studio.projectId ?? "default"} projectId={studio.projectId !== "new" ? studio.projectId : undefined} blank={studio.projectId === "new"} origin={studio.origin} originGalaxyId={studio.galaxyId} navigate={navigate}/>;
}
