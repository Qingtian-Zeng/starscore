import Fastify from "fastify";
import { validateResponsePayload, validateResponseRequest, type ResponseRequest } from "@starscore/core";
import { generateWithModel, generateWithRules, readModelConfig } from "./providers.js";

export function buildApp(){
  const app=Fastify({logger:false,bodyLimit:64*1024});
  const allowedOrigins=new Set((process.env.STARSCORE_CORS_ORIGINS??"http://localhost:5173,https://localhost").split(",").map(value=>value.trim()).filter(Boolean));
  app.addHook("onRequest",async(request,reply)=>{
    const origin=request.headers.origin;
    if(origin&&allowedOrigins.has(origin))reply.header("access-control-allow-origin",origin).header("vary","Origin").header("access-control-allow-methods","GET,POST,OPTIONS").header("access-control-allow-headers","content-type");
    if(request.method==="OPTIONS")return reply.code(204).send();
  });
  app.get("/api/health",async()=>({ok:true,modelConfigured:Boolean(readModelConfig())}));
  app.get<{Querystring:{name?:string;type?:string;data?:string}}>("/api/download",async(request,reply)=>{const {name,type,data}=request.query;if(!name||!type||!data||data.length>1_500_000)return reply.code(400).send({error:"下载参数无效"});if(!/^[\w\-. ·\u4e00-\u9fff]+$/.test(name)||!["application/json","audio/midi"].includes(type))return reply.code(400).send({error:"下载类型无效"});let bytes:Buffer;try{bytes=Buffer.from(data,"base64")}catch{return reply.code(400).send({error:"下载内容无效"})}return reply.header("content-type",type).header("content-disposition",`attachment; filename*=UTF-8''${encodeURIComponent(name)}`).send(bytes)});
  app.post<{Body:ResponseRequest}>("/api/ai/responses",{config:{rateLimit:false}},async(request,reply)=>{
    const input=request.body; const errors=validateResponseRequest(input); if(errors.length)return reply.code(400).send({error:errors[0]});
    try{
      const config=readModelConfig();
      if(input.mode==="model"&&!config)return reply.code(503).send({error:"真实模型尚未配置，可切换规则演示。",code:"MODEL_NOT_CONFIGURED"});
      const payload=input.mode==="model"&&config?await generateWithModel(input,config):generateWithRules(input);
      const outputErrors=validateResponsePayload(payload,input); if(outputErrors.length)throw new Error(outputErrors[0]);
      return payload;
    }catch(error){return reply.code(502).send({error:error instanceof Error?error.message:"回应生成失败",code:"GENERATION_FAILED"});}
  });
  return app;
}
