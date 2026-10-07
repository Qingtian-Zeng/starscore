import { useId } from "react";

// Seeded artwork stays still when a profile or a playing note changes.
function randomSeries(seed:number) {
  return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
}
const random=randomSeries(731);
const fieldStars=Array.from({length:240},(_,index)=>({
  x:random()*1000,y:random()*800,r:index%23===0?1.8:.35+random()*.85,
  opacity:.3+random()*.65,color:index%8===0?"#b9dfff":index%11===0?"#ffd4aa":"#f0ebff",
}));
const beltStars=Array.from({length:370},(_,index)=>{
  const x=-70+random()*1140;
  const spread=(random()+random()+random()-1.5)*85;
  return {x,y:410+Math.sin(x*.011)*24+spread,r:index%19===0?1.5:.25+random()*.75,opacity:.28+random()*.65};
});
const cloudPatches=Array.from({length:15},(_,index)=>({
  x:-70+index*83,y:410+Math.sin(index*1.35)*39,
  rx:90+random()*70,ry:44+random()*40,opacity:.32+random()*.28,
}));

export function GalaxyBackdrop({className="",variant="field"}:{className?:string;variant?:"field"|"ambient"|"portal"}) {
  const id=`galaxy-${useId().replace(/[^a-zA-Z0-9_-]/g,"")}`;
  const compact=variant==="portal"||variant==="ambient";
  return <svg className={`galaxy-backdrop ${className}`} viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id={`${id}-violet`}><stop stopColor="#ab77ed" stopOpacity=".76"/><stop offset=".48" stopColor="#6661cf" stopOpacity=".42"/><stop offset="1" stopColor="#343474" stopOpacity="0"/></radialGradient>
      <radialGradient id={`${id}-blue`}><stop stopColor="#8bdbef" stopOpacity=".66"/><stop offset=".43" stopColor="#346eb3" stopOpacity=".42"/><stop offset="1" stopColor="#20436b" stopOpacity="0"/></radialGradient>
      <radialGradient id={`${id}-core`}><stop stopColor="#fff4d8" stopOpacity=".91"/><stop offset=".14" stopColor="#f9cbb9" stopOpacity=".75"/><stop offset=".44" stopColor="#c6a0d4" stopOpacity=".4"/><stop offset="1" stopColor="#a584cf" stopOpacity="0"/></radialGradient>
      <radialGradient id={`${id}-spark`}><stop stopColor="#fffdf3"/><stop offset=".13" stopColor="#ffedca" stopOpacity=".85"/><stop offset="1" stopColor="#e9cdff" stopOpacity="0"/></radialGradient>
      <linearGradient id={`${id}-river`} x1="0" x2="1"><stop stopColor="#82cef6" stopOpacity=".1"/><stop offset=".2" stopColor="#ada0f7"/><stop offset=".49" stopColor="#f7d9c9"/><stop offset=".74" stopColor="#b7b3f3"/><stop offset="1" stopColor="#79cfee" stopOpacity=".1"/></linearGradient>
      <filter id={`${id}-gas`} x="-30%" y="-80%" width="160%" height="260%" colorInterpolationFilters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".012 .03" numOctaves="3" seed="8" result="dust"/><feDisplacementMap in="SourceGraphic" in2="dust" scale="53" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="8"/></filter>
      <filter id={`${id}-soft`} x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="13"/></filter>
    </defs>
    <rect width="1000" height="800" fill="#070b1f"/>
    <ellipse cx="140" cy="140" rx="550" ry="440" fill={`url(#${id}-violet)`} opacity=".38"/>
    <ellipse cx="870" cy="630" rx="580" ry="460" fill={`url(#${id}-blue)`} opacity=".34"/>
    <g className="galaxy-distant-stars">{fieldStars.filter((_,index)=>!compact||index%3===0).map((star,index)=><circle key={index} className={index%39===0?"galaxy-twinkle":""} cx={star.x} cy={star.y} r={star.r} fill={star.color} opacity={star.opacity} style={{animationDelay:`${index%9*-.7}s`}}/>)}</g>
    <g className="galaxy-river" transform="rotate(-38 500 400)">
      <g filter={`url(#${id}-gas)`}>{cloudPatches.map((patch,index)=><ellipse key={index} cx={patch.x} cy={patch.y} rx={patch.rx} ry={patch.ry} fill={`url(#${id}-${index%3===0?"blue":"violet"})`} opacity={patch.opacity}/>)}</g>
      <g filter={`url(#${id}-soft)`} fill="none" stroke={`url(#${id}-river)`}>
        <path d="M-160 430C45 338 190 475 380 405S670 331 1160 434" strokeWidth="58" opacity=".37"/>
        <path d="M-140 430C85 370 216 455 416 407S775 340 1150 438" strokeWidth="13" opacity=".56"/>
      </g>
      <ellipse cx="482" cy="407" rx="246" ry="105" fill={`url(#${id}-core)`}/>
      <ellipse cx="555" cy="398" rx="340" ry="63" fill={`url(#${id}-core)`} opacity=".55"/>
      <g fill="none" stroke="#070d29" filter={`url(#${id}-gas)`}>
        <path d="M-100 435C88 349 240 456 379 423S571 354 718 381S982 470 1110 423" strokeWidth="24" opacity=".75"/>
        <path d="M148 455C292 493 417 427 458 424S656 435 820 453" strokeWidth="16" opacity=".49"/>
      </g>
      <g className="galaxy-stardust">{beltStars.filter((_,index)=>!compact||index%3===0).map((star,index)=><circle key={index} cx={star.x} cy={star.y} r={star.r} fill={index%4===0?"#fff2d4":"#e5dbff"} opacity={star.opacity}/>)}</g>
    </g>
    {[{x:328,y:254,r:17},{x:768,y:480,r:15},{x:550,y:585,r:12},{x:120,y:590,r:13},{x:802,y:156,r:11}].map((star,index)=><g key={index} className="galaxy-beacon"><circle cx={star.x} cy={star.y} r={star.r} fill={`url(#${id}-spark)`}/><path d={`M${star.x-5} ${star.y}h10M${star.x} ${star.y-5}v10`} stroke="#eff5ff" strokeWidth=".65" opacity=".8"/><circle cx={star.x} cy={star.y} r="1.25" fill="#fffbed"/></g>)}
  </svg>;
}
