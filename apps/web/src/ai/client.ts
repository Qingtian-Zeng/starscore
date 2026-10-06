import { validateResponsePayload, type ResponsePayload, type ResponseRequest } from "@starscore/core";
import { apiUrl } from "../config/api";

export async function getAiHealth(signal?:AbortSignal):Promise<{ok:boolean;modelConfigured:boolean}>{const response=await fetch(apiUrl("/api/health"),{signal});if(!response.ok)throw new Error("AI 服务不可用");return response.json();}
export async function requestResponses(request:ResponseRequest,signal:AbortSignal):Promise<ResponsePayload>{const response=await fetch(apiUrl("/api/ai/responses"),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(request),signal});const value=await response.json() as ResponsePayload&{error?:string};if(!response.ok)throw new Error(value.error??`回应服务返回 ${response.status}`);const errors=validateResponsePayload(value,request);if(errors.length)throw new Error(`客户端校验失败：${errors[0]}`);return value;}
