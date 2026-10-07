import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=process.argv[2]||resolve(root,'../StarScore_Interactive_Preview.html');
const bundleDir=resolve(root,'.standalone-build');
await mkdir(bundleDir,{recursive:true});
await build({
  absWorkingDir:root,entryPoints:['apps/web/src/main.tsx'],bundle:true,format:'iife',platform:'browser',target:'es2022',
  outfile:resolve(bundleDir,'app.js'),minify:true,legalComments:'inline',jsx:'automatic',
  define:{'process.env.NODE_ENV':'"production"','import.meta.env.VITE_API_BASE_URL':'undefined'},
});
const [js,css,shell,notices]=await Promise.all([
  readFile(resolve(bundleDir,'app.js'),'utf8'),readFile(resolve(bundleDir,'app.css'),'utf8'),
  readFile(resolve(root,'scripts/standalone-shell.html'),'utf8'),
  readFile(resolve(root,'THIRD_PARTY_NOTICES.md'),'utf8').catch(()=> 'Uses the existing StarScore React, Tone.js, lucide-react, Capacitor and @tonejs/midi dependencies. Their license notices are retained in the bundled code.'),
]);
const overrides=`
:root{--response:#bfa2f6;--preview-height:560px;--preview-radius:28px;--preview-star-size:1;--preview-link-opacity:.42}
.canvas,.player-canvas .canvas{height:var(--preview-height)!important;min-height:0!important}
.canvas-shell,.player-canvas{border-radius:var(--preview-radius)}
.inspector,.tracks-panel,.response-panel,.project-card{border-radius:calc(var(--preview-radius)*.78)}
.title-input{font-family:inherit;font-size:clamp(28px,4vw,42px);font-weight:540;line-height:1.2}
.preview-star-core{r:calc(var(--star-core-base,7px)*var(--preview-star-size))}
.preview-star-halo{r:calc(var(--star-halo-base,32px)*var(--preview-star-size))}
.preview-user-link{stroke-opacity:var(--preview-link-opacity)}
.source-badge.rules,.legend-response{color:var(--response)}
.legend-response,.candidate-actions .accept,.note-origin.rules,.note-origin.model{background:var(--response)}
.candidate-card strong{color:var(--response)}
.project-thumb line.response{stroke:var(--response)}.project-thumb circle.response{fill:var(--response)}
html[data-show-pitch="true"] .preview-pitch-label{display:block}
html[data-show-background="false"] .preview-background-star{display:none}
html[data-show-hints="false"] .hint{display:none}
html[data-show-note-list="false"] .note-list{display:none}
html[data-show-inspector="false"] .inspector{display:none}
html[data-show-tracks="false"] .tracks-panel{display:none}
html[data-show-responses="false"] .response-panel{display:none}
html[data-simple="true"] .studio-grid{grid-template-columns:1fr}
html[data-simple="true"] .side-panel{display:none}
html[data-preview-theme="ink"] .app{background:radial-gradient(circle at 52% -10%,#18303a 0,#08131d 42%,#050b12 100%)}
html[data-preview-theme="aurora"] .app{background:radial-gradient(circle at 10% 0%,#17413b 0,#0a202b 42%,#07131f 100%)}
html[data-preview-theme="aurora"] .canvas-shell,html[data-preview-theme="aurora"] .player-canvas{background:radial-gradient(ellipse at 20% 10%,#163a39,#071923 75%)}
@media(max-width:680px){
  .canvas,.player-canvas .canvas{height:clamp(320px,min(var(--preview-height),58dvh),480px)!important}
}
`;
const appDocument=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>星谱 StarScore</title><style>${css}\n${overrides}</style></head><body><div id="root"></div><script>window.__STARSCORE_HTML_PREVIEW__=true;</script><script>${js.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
const initial={theme:'navy',accent:'#65e6e2',response:'#bfa2f6',canvasHeight:560,starSize:1,radius:28,linkOpacity:.42,showPitch:false,showBackground:true,showHints:true,showNoteList:true,showInspector:true,showTracks:true,showResponses:true,viewport:'phone'};
// A replacement callback keeps JavaScript's literal $&/$`/$' sequences intact.
const html=shell.replace('__PREVIEW_SETTINGS__',()=>JSON.stringify(initial)).replace('__APP_DOCUMENT__',()=>JSON.stringify(appDocument).replace(/</g,'\\u003c')).replace('__THIRD_PARTY_NOTICES__',()=>notices.replace(/<\/script/gi,'<\\/script'));
await writeFile(output,html,'utf8');
console.log(JSON.stringify({output,bytes:Buffer.byteLength(html),baseTag:'v0.2.1-confirmed-ui'}));
