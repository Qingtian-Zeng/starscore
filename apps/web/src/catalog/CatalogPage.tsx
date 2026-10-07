import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Check, CircleStop, Heart, LoaderCircle, Music2, Play, Search, Shuffle, SkipBack, SkipForward, Sparkles, X } from "lucide-react";
import { pitchNames } from "@starscore/core";
import { audioEngine } from "../audio/AudioEngine";
import { MotionToggle } from "../components/MotionToggle";
import { AppNavigation } from "../components/AppNavigation";
import { saveProject } from "../storage/projectRepository";
import { catalogDurationSeconds, catalogItems, createCatalogProject, createMaterialCopy, selectCatalogItems, type CatalogItem, type CollectionKind } from "./catalog";
import { readFavoriteIds, writeFavoriteIds } from "./favorites";
import { MusicSketch } from "./MusicSketch";
import { readCatalogBrowserState, rememberCatalogBrowserState } from "./browserState";
import { projectRoute } from "../navigation/projectRoutes";
import "./catalog.css";

const formatTime=(seconds:number)=>`0:${Math.floor(seconds).toString().padStart(2,"0")}`;

export function CatalogPage({kind,navigate}:{kind:CollectionKind;navigate:(hash:string)=>void}) {
  const initialView=useMemo(()=>readCatalogBrowserState(kind),[kind]);
  const [query,setQuery]=useState(initialView.query);const [category,setCategory]=useState(initialView.category);const [favoritesOnly,setFavoritesOnly]=useState(initialView.favoritesOnly);
  const browserView=useRef(initialView);browserView.current={query,category,favoritesOnly,scrollTop:browserView.current.scrollTop};
  const [favoriteIds,setFavoriteIds]=useState(readFavoriteIds);const [playingId,setPlayingId]=useState<string|null>(null);const [activeId,setActiveId]=useState<string|null>(null);
  const [progress,setProgress]=useState(0);const [starting,setStarting]=useState(false);const [message,setMessage]=useState("");const [importingId,setImportingId]=useState<string|null>(null);
  const auditionToken=useRef(0);const importing=useRef(false);
  const projects=useMemo(()=>new Map(catalogItems.map(item=>[item.id,createCatalogProject(item,true)])),[]);
  const filtered=useMemo(()=>selectCatalogItems(kind,query,category,favoritesOnly?favoriteIds:null),[kind,query,category,favoritesOnly,favoriteIds]);
  const total=catalogItems.filter(item=>item.kind===kind).length;
  const featured=catalogItems.find(item=>item.id===(kind==="zodiac"?"pisces":"aurora-letter"))!;
  const playingItem=catalogItems.find(item=>item.id===playingId);
  const categories=kind==="zodiac"?["全部","火象","土象","风象","水象"]:["全部","氛围","抒情","律动"];
  const favoriteCount=favoriteIds.filter(id=>catalogItems.some(item=>item.id===id&&item.kind===kind)).length;

  const stop=()=>{auditionToken.current++;audioEngine.stop();setPlayingId(null);setActiveId(null);setProgress(0);setStarting(false)};
  useLayoutEffect(()=>{
    const trackScroll=()=>{browserView.current.scrollTop=window.scrollY};
    window.addEventListener("scroll",trackScroll,{passive:true});
    window.scrollTo(0,initialView.scrollTop);
    trackScroll();
    return()=>{window.removeEventListener("scroll",trackScroll);rememberCatalogBrowserState(kind,browserView.current)};
  },[kind,initialView]);
  useEffect(()=>{
    const onHidden=()=>{if(document.hidden)stop()};
    const onPageHide=()=>stop();
    document.addEventListener("visibilitychange",onHidden);window.addEventListener("pagehide",onPageHide);
    return()=>{auditionToken.current++;document.removeEventListener("visibilitychange",onHidden);window.removeEventListener("pagehide",onPageHide);audioEngine.dispose()};
  },[]);
  useEffect(()=>{
    if(window.__STARSCORE_HTML_PREVIEW__)window.parent.postMessage({type:"starscore:catalog",kind,total,title:playingItem?.title??null,playing:Boolean(playingId),starting},"*");
  },[kind,total,playingId,playingItem?.title,starting]);

  const audition=async(item:CatalogItem,restart=false)=>{
    if(playingId===item.id&&!restart){stop();return}
    const token=++auditionToken.current;
    setPlayingId(item.id);setProgress(0);setActiveId(null);setStarting(true);setMessage("");
    try {
      await audioEngine.play(projects.get(item.id)!,{
        onNote:id=>{if(token===auditionToken.current)setActiveId(id)},
        onProgress:value=>{if(token===auditionToken.current)setProgress(value)},
        onEnded:()=>{if(token===auditionToken.current){setPlayingId(null);setActiveId(null);setProgress(0);setStarting(false)}},
      });
      if(token===auditionToken.current)setStarting(false);
    }catch{if(token===auditionToken.current){stop();setMessage("声音尚未启动。请确认浏览器允许播放声音，再点击试听。")}}
  };
  const useMaterial=async(item:CatalogItem)=>{
    if(importing.current)return;
    importing.current=true;setImportingId(item.id);setMessage("");stop();
    try {const copy=createMaterialCopy(item);await saveProject(copy);navigate(projectRoute("studio",copy.id,kind))}
    catch{setMessage("素材副本保存失败，请检查本地存储后重试。已有作品保留。")}
    finally{importing.current=false;setImportingId(null)}
  };
  const toggleFavorite=(item:CatalogItem)=>{
    const next=favoriteIds.includes(item.id)?favoriteIds.filter(id=>id!==item.id):[...favoriteIds,item.id];
    setFavoriteIds(next);
    if(!writeFavoriteIds(next))setMessage("当前浏览器未能保存收藏，本次会话仍可使用。")
  };
  const chooseNext=(direction:number)=>{
    const list=filtered.length?filtered:catalogItems.filter(item=>item.kind===kind);
    const index=list.findIndex(item=>item.id===playingId);
    const next=index<0?0:(index+direction+list.length)%list.length;
    const item=list[next];if(item)void audition(item,true);
  };
  const shuffle=()=>{const choices=filtered.filter(item=>item.id!==playingId);const list=choices.length?choices:filtered;if(list.length)void audition(list[Math.floor(Math.random()*list.length)]!,true)};
  const leave=(hash:string)=>{stop();navigate(hash)};

  return <div className="app collection-page" data-collection={kind}>
    <header className="topbar"><div className="brand"><div className="brand-mark"><Sparkles size={21}/></div><div><h1>星谱</h1><small>DISCOVER</small></div></div><nav className="top-actions"><MotionToggle/><button className="new-button" onClick={()=>leave("#/library")}><Heart size={16}/>我的星系</button></nav></header>
    <AppNavigation active={kind==="zodiac"?"zodiac":"materials"} navigate={leave}/>
    <main className="collection-workspace">
      <section className="collection-hero" style={{"--collection-accent":featured.color} as CSSProperties}>
        <div className="collection-intro"><p className="eyebrow">{kind==="zodiac"?"ZODIAC SESSIONS":"STELLAR INSPIRATION"}</p><h2>{kind==="zodiac"?"十二星座主题曲":"星谱灵感素材"}</h2><p>{kind==="zodiac"?"把星座的意象，听成自己的旋律。":"从一段动人的旋律开始，写下你的星空。"}</p><div className="collection-count"><span>{total} 段原创器乐</span><i/>四小节 · 90 BPM · 约 11 秒</div>
        <div className="hero-actions"><button className="collection-primary" onClick={()=>void audition(featured)} aria-label={`试听推荐 ${featured.title}`}>{playingId===featured.id?<CircleStop size={17}/>:<Play size={17}/>} {playingId===featured.id?"停止试听":"试听推荐"}</button><button className="collection-secondary" onClick={()=>void useMaterial(featured)} disabled={Boolean(importingId)}>用这段创作<ArrowRight size={16}/></button></div></div>
        <button type="button" className="hero-featured" aria-label={`打开 ${featured.title} 进入创作`} aria-busy={importingId===featured.id} disabled={Boolean(importingId)} onClick={()=>void useMaterial(featured)}><MusicSketch hero item={featured} project={projects.get(featured.id)!} activeId={playingId===featured.id?activeId:null}/><span className="hero-featured-info"><span>本期推荐{kind==="zodiac"?` · ${featured.label}`:""}</span><strong>{featured.title}</strong><small>{featured.mood}</small><span className="hero-create-hint">{importingId===featured.id?"打开中…":"点击创作"}<ArrowRight size={12}/></span></span></button>
      </section>
      <section className="collection-browser" aria-label={kind==="zodiac"?"十二星座曲库":"星谱素材库"}>
        <div className="collection-tools"><label className="collection-search"><Search size={17}/><input aria-label="搜索星谱" placeholder={kind==="zodiac"?"搜索星座、曲名或氛围":"搜索素材、曲名或氛围"} value={query} onChange={event=>setQuery(event.target.value)}/>{query&&<button aria-label="清除搜索" onClick={()=>setQuery("")}><X size={15}/></button>}</label><button className={`collection-favorite-filter ${favoritesOnly?"active":""}`} aria-pressed={favoritesOnly} onClick={()=>setFavoritesOnly(value=>!value)}><Heart size={15} fill={favoritesOnly?"currentColor":"none"}/>收藏 <span>{favoriteCount}</span></button><button className="collection-shuffle" onClick={shuffle} disabled={!filtered.length}><Shuffle size={16}/>随听一首</button></div>
        <div className="collection-filters" aria-label="星谱分类">{categories.map(value=><button key={value} className={category===value?"active":""} aria-pressed={category===value} onClick={()=>setCategory(value)}>{value}</button>)}<span>{filtered.length} 段星谱</span></div>
        {message&&<p className="collection-message" role="status">{message}</p>}
        {filtered.length?<div className="collection-grid">{filtered.map(item=>{
          const selected=playingId===item.id,liked=favoriteIds.includes(item.id);
          return <article className={`collection-card ${selected?"playing":""}`} key={item.id} style={{"--collection-accent":item.color} as CSSProperties}>
            <div className="collection-card-top"><span>{item.kind==="zodiac"?item.label:item.category}</span><button className={liked?"liked":""} aria-label={`${liked?"取消收藏":"收藏"} ${item.label}`} aria-pressed={liked} onClick={()=>toggleFavorite(item)}><Heart size={16} fill={liked?"currentColor":"none"}/></button></div>
            <button type="button" className="collection-artwork" aria-label={`打开 ${item.title} 进入创作`} aria-busy={importingId===item.id} disabled={Boolean(importingId)} onClick={()=>void useMaterial(item)}><MusicSketch item={item} project={projects.get(item.id)!} activeId={selected?activeId:null}/><span className="collection-artwork-hint">{importingId===item.id?<LoaderCircle size={11} className="spin"/>:<ArrowRight size={11}/>}<span>{importingId===item.id?"打开中…":"点击创作"}</span></span></button>
            <div className="collection-card-body"><span className="collection-card-category">{item.category} · {item.mood}</span><h3>{item.title}</h3><p>{item.description}</p><div className="collection-card-meta"><span>4 小节 · 器乐</span><span>{selected?(starting?"启动中…":"正在试听"):"约 11 秒"}</span></div><div className="collection-card-actions"><button className="collection-card-play" aria-label={`${selected?"停止":"试听"} ${item.label}`} onClick={()=>void audition(item)}>{selected?(starting?<LoaderCircle size={15} className="spin"/>:<CircleStop size={15}/>):<Play size={15}/>}<span>{selected?"停止":"试听"}</span></button><button aria-label={`用 ${item.label} 创作`} disabled={Boolean(importingId)} onClick={()=>void useMaterial(item)}>{importingId===item.id?<LoaderCircle className="spin" size={15}/>:<ArrowRight size={15}/>}<span>创作</span></button></div></div>
            <div className="collection-card-progress" aria-hidden="true"><i style={{width:selected?`${progress*100}%`:"0%"}}/></div>
          </article>;
        })}</div>:<div className="collection-empty"><Music2 size={29}/><h3>{favoritesOnly?"这个分类还没有收藏":"没有找到这段星谱"}</h3><p>{favoritesOnly?"点亮卡片上的爱心，把喜欢的旋律留在这里。":"试试星座名称、曲名，或温暖、空灵这样的关键词。"}</p><button className="collection-secondary" onClick={()=>{setQuery("");setCategory("全部");setFavoritesOnly(false)}}>查看全部星谱</button></div>}
        <p className="collection-footnote"><Check size={14}/>原创预设 · 收藏保存在本机 · 点击星图或创作会建立独立副本</p>
      </section>
    </main>
    {playingItem&&<section className="collection-mini-player" aria-label="星谱试听播放器" style={{"--collection-accent":playingItem.color} as CSSProperties}><div className="mini-player-symbol">{playingItem.symbol}</div><div className="mini-player-info"><strong>{playingItem.title}</strong><span>{starting?"正在启动声音…":`${playingItem.kind==="zodiac"?playingItem.label:playingItem.category} · ${activeId?pitchNames[projects.get(playingItem.id)!.tracks.lead.events.find(note=>note.id===activeId)?.pitch??60]:"器乐试听"}`}</span><div className="mini-player-progress"><i style={{width:`${progress*100}%`}}/></div></div><span className="mini-player-time">{formatTime(progress*catalogDurationSeconds)} / {formatTime(catalogDurationSeconds)}</span><div className="mini-player-buttons"><button aria-label="上一段星谱" onClick={()=>chooseNext(-1)}><SkipBack size={17}/></button><button className="mini-player-stop" aria-label="停止星谱试听" onClick={stop}><CircleStop size={22}/></button><button aria-label="下一段星谱" onClick={()=>chooseNext(1)}><SkipForward size={17}/></button></div></section>}
  </div>;
}
