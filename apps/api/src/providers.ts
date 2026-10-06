import { generateRuleCandidates, validateResponsePayload, type NoteEvent, type ResponsePayload, type ResponseRequest } from "@starscore/core";

export interface ModelConfig { baseUrl: string; model: string; apiKey: string; timeoutMs: number; }
export const readModelConfig = (): ModelConfig | null => {
  const baseUrl=process.env.STARSCORE_MODEL_BASE_URL?.trim(); const model=process.env.STARSCORE_MODEL_NAME?.trim(); const apiKey=process.env.STARSCORE_MODEL_API_KEY?.trim();
  return baseUrl&&model&&apiKey ? {baseUrl:baseUrl.replace(/\/$/,""),model,apiKey,timeoutMs:Number(process.env.STARSCORE_MODEL_TIMEOUT_MS)||30000} : null;
};

export async function generateWithModel(request: ResponseRequest, config: ModelConfig): Promise<ResponsePayload> {
  const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),config.timeoutMs);
  try {
    const response=await fetch(`${config.baseUrl}/chat/completions`,{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${config.apiKey}`},signal:controller.signal,body:JSON.stringify({model:config.model,temperature:.7,response_format:{type:"json_object"},messages:[{role:"system",content:"You generate two monophonic musical response candidates as strict JSON. Return {candidates:[{label:'A',notes:[{pitch,startTick,durationTick,velocity}]},{label:'B',notes:[...]}]}. Each has 4-8 notes, pitches only 60,62,64,67,69,72,74,76; starts/durations align 240 ticks; duration 240/480/960; absolute ticks 3840-7680; no overlap."},{role:"user",content:JSON.stringify({music:request.music,notes:request.notes})}]})});
    if(!response.ok) throw new Error(`模型服务返回 HTTP ${response.status}`);
    const envelope=await response.json() as {choices?:Array<{message?:{content?:string}}>}; const content=envelope.choices?.[0]?.message?.content; if(!content) throw new Error("模型没有返回结构化内容");
    const raw=JSON.parse(content) as {candidates?:Array<{label?:string;notes?:Array<Partial<NoteEvent>>}>};
    const candidates=(raw.candidates??[]).slice(0,2).map((candidate,ci)=>({id:`${request.requestId}-model-${ci}`,label:(ci===0?"A":"B") as "A"|"B",notes:(candidate.notes??[]).map((note,ni)=>({id:`${request.requestId}-model-${ci}-${ni}`,pitch:Number(note.pitch),startTick:Number(note.startTick),durationTick:Number(note.durationTick),velocity:Number(note.velocity),origin:"model" as const,editedByUser:false}))}));
    const payload:ResponsePayload={requestId:request.requestId,projectId:request.projectId,seedRevision:request.seedRevision,provider:"model",model:config.model,candidates};
    const errors=validateResponsePayload(payload,request); if(errors.length) throw new Error(`模型回应不合格：${errors[0]}`); return payload;
  } finally { clearTimeout(timer); }
}

export const generateWithRules = (request:ResponseRequest) => generateRuleCandidates(request);
