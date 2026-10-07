import { generateRuleCandidates, validateResponsePayload, type ResponsePayload, type ResponseRequest } from "@starscore/core";
import { apiUrl } from "../config/api";

export async function getAiHealth(signal?:AbortSignal):Promise<{ok:boolean;modelConfigured:boolean}>{const response=await fetch(apiUrl("/api/health"),{signal});if(!response.ok)throw new Error("AI ?????");return response.json();}
export async function requestResponses(request:ResponseRequest,signal:AbortSignal):Promise<ResponsePayload>{
  try{
    const response=await fetch(apiUrl("/api/ai/responses"),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(request),signal});
    const value=await response.json() as ResponsePayload&{error?:string};
    if(!response.ok)throw new Error(value.error??`?????? ${response.status}`);
    const errors=validateResponsePayload(value,request);
    if(errors.length)throw new Error(`????????${errors[0]}`);
    return value;
  }catch(error){
    if(signal.aborted||request.mode!=="rules")throw error;
    return generateRuleCandidates(request);
  }
}
