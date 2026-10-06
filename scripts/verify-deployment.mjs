const base=(process.argv[2]??"http://127.0.0.1:8080").replace(/\/$/,"");
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let health;
for(let attempt=1;attempt<=30;attempt++){
  try{const response=await fetch(`${base}/api/health`);if(response.ok){health=await response.json();break}}catch{}
  await wait(1000);
}
if(!health?.ok)throw new Error("health check did not become ready");
const page=await fetch(`${base}/`);
if(!page.ok||!(await page.text()).includes('id="root"'))throw new Error("Web entry did not load");
const request={requestId:"compose-smoke",projectId:"compose-project",seedRevision:0,music:{ppq:480,bpm:90,meter:[4,4],loopBars:4,key:"C",scale:"major-pentatonic"},candidateCount:2,mode:"rules",notes:[60,64,67,69,67,64].map((pitch,index)=>({id:`seed-${index}`,pitch,startTick:[0,480,960,1440,1920,2880][index],durationTick:[480,480,480,480,960,960][index],velocity:.65,origin:"user",editedByUser:false}))};
const response=await fetch(`${base}/api/ai/responses`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(request)});
const payload=await response.json();
if(!response.ok||payload.provider!=="rules"||payload.candidates?.length!==2||payload.candidates.some(candidate=>candidate.notes.length<4||candidate.notes.length>8))throw new Error(`rule response smoke failed: ${JSON.stringify(payload)}`);
console.log(JSON.stringify({web:page.status,health,ruleProvider:payload.provider,candidates:payload.candidates.map(candidate=>({label:candidate.label,notes:candidate.notes.length}))},null,2));
