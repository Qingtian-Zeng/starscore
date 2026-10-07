import { generateRuleCandidates, validateResponsePayload, type ResponsePayload, type ResponseRequest } from "@starscore/core";
import { apiUrl } from "../config/api";

export async function getAiHealth(signal?:AbortSignal):Promise<{ok:boolean;modelConfigured:boolean}>{if(window.__STARSCORE_HTML_PREVIEW__)return{ok:true,modelConfigured:false};const response=await fetch(apiUrl("/api/health"),{signal});if(!response.ok)throw new Error("AI 服务不可用");return response.json();}
export async function requestResponses(request:ResponseRequest,signal:AbortSignal):Promise<ResponsePayload>{
  if(request.mode==="rules"){
    await new Promise<void>((resolve,reject)=>{if(signal.aborted){reject(new DOMException("请求已取消","AbortError"));return;}const onAbort=()=>{clearTimeout(timer);reject(new DOMException("请求已取消","AbortError"));};const timer=setTimeout(()=>{signal.removeEventListener("abort",onAbort);resolve();},240);signal.addEventListener("abort",onAbort,{once:true});});
    const value=generateRuleCandidates(request);const errors=validateResponsePayload(value,request);if(errors.length)throw new Error(errors[0]);return value;
  }
  if(window.__STARSCORE_HTML_PREVIEW__)throw new Error("真实 AI 需要连接已配置模型的后端。此 HTML 使用同一套本地规则回应。");
  const response=await fetch(apiUrl("/api/ai/responses"),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(request),signal});const value=await response.json() as ResponsePayload&{error?:string};if(!response.ok)throw new Error(value.error??`回应服务返回 ${response.status}`);const errors=validateResponsePayload(value,request);if(errors.length)throw new Error(`客户端校验失败：${errors[0]}`);return value;
}
