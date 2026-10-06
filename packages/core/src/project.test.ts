import { describe, expect, it } from "vitest";
import { createBlankProject, createNightSailProject, deleteNote, isSerializable, reconnectAfter, setDrumSlot, setNoteDuration, validateProject, validateUserNotes } from "./project.js";
import { exportProjectJson, importProjectJson } from "./serialization.js";
import { applyResponseCandidate, createResponseRequest, generateRuleCandidates, validateResponsePayload } from "./responses.js";

describe("project model", () => {
  it("creates the deterministic Night Sail example occupying exactly 3840 ticks", () => {
    const notes = createNightSailProject().tracks.lead.events;
    const last = notes.at(-1)!;
    expect(notes).toHaveLength(6);
    expect(last.startTick + last.durationTick).toBe(3840);
    expect(validateUserNotes(notes)).toEqual([]);
  });

  it("creates an empty serializable project without browser globals", () => {
    const project = createBlankProject();
    expect(project.tracks.lead.events).toEqual([]);
    expect(isSerializable(project)).toBe(true);
    expect(typeof window).toBe("undefined");
  });

  it("protects the eight-beat budget without mutating the project", () => {
    const project = createNightSailProject();
    const result = setNoteDuration(project, "night-1", 960);
    expect(result.ok).toBe(false);
    expect(project.tracks.lead.events[0]?.durationTick).toBe(480);
    expect(validateProject(project)).toEqual([]);
  });

  it("reconnects a complete single chain and recalculates every start tick", () => {
    const project = createNightSailProject();
    const result = reconnectAfter(project, "night-1", "night-6");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.project.tracks.lead.events.map(note => note.id)).toEqual(["night-1","night-6","night-2","night-3","night-4","night-5"]);
    expect(new Set(result.project.tracks.lead.events.map(note => note.id)).size).toBe(6);
    expect(validateProject(result.project)).toEqual([]);
  });

  it("rejects self connection and keeps the original order", () => {
    const project = createNightSailProject();
    expect(reconnectAfter(project, "night-2", "night-2").ok).toBe(false);
    expect(project.tracks.lead.events.map(note => note.id)).toEqual(["night-1","night-2","night-3","night-4","night-5","night-6"]);
  });

  it("deletes without leaving timing gaps", () => {
    const project = createNightSailProject();
    const result = deleteNote(project, "night-3");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.project.tracks.lead.events.map(note => note.startTick)).toEqual([0,480,960,1440,2400]);
    expect(result.project.layout.notes["night-3"]).toBeUndefined();
    expect(validateProject(result.project)).toEqual([]);
  });

  it("expands one drum slot across four bars without duplicates", () => {
    const project = createNightSailProject();
    const result = setDrumSlot(project, 1, "hat");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.project.tracks.drums.events.filter(event => event.startTick % 1920 === 240)).toHaveLength(4);
    expect(validateProject(result.project)).toEqual([]);
  });

  it("round-trips JSON into a new project id with music and layout intact", () => {
    const original = createNightSailProject(); const result = importProjectJson(exportProjectJson(original), new Date("2026-10-05T00:00:00.000Z"));
    expect(result.ok).toBe(true); if(!result.ok)return;
    expect(result.project.id).not.toBe(original.id); expect(result.project.tracks).toEqual(original.tracks); expect(result.project.layout).toEqual(original.layout); expect(result.project.mixer).toEqual(original.mixer);
  });

  it("rejects malformed and future JSON without producing a project", () => {
    expect(importProjectJson("{bad").ok).toBe(false);
    const future = JSON.parse(exportProjectJson(createNightSailProject())); future.schemaVersion=2;
    expect(importProjectJson(JSON.stringify(future))).toEqual({ok:false,message:"项目版本高于当前应用，无法安全导入。"});
    const invalid = JSON.parse(exportProjectJson(createNightSailProject())); invalid.tracks.lead.events[0].pitch=61;
    expect(importProjectJson(JSON.stringify(invalid)).ok).toBe(false);
  });
});

describe("response candidates",()=>{
  it("generates two legal candidates and accepts one without touching the seed",()=>{const project=createNightSailProject();const before=project.tracks.lead.events.map(({id,pitch,startTick,durationTick,velocity})=>({id,pitch,startTick,durationTick,velocity}));const request=createResponseRequest(project,"request-test","rules");const payload=generateRuleCandidates(request);expect(validateResponsePayload(payload,request)).toEqual([]);expect(payload.candidates).toHaveLength(2);const accepted=applyResponseCandidate(project,payload.candidates[0]!,"rules",project.seedRevision,"2026-10-06T00:00:00.000Z");expect(accepted.tracks.lead.events.slice(0,before.length).map(({id,pitch,startTick,durationTick,velocity})=>({id,pitch,startTick,durationTick,velocity}))).toEqual(before);expect(accepted.tracks.lead.events.slice(before.length)).toHaveLength(6);expect(project.responseMeta).toBeUndefined();});
  it("rejects stale adoption",()=>{const project=createNightSailProject();const payload=generateRuleCandidates(createResponseRequest(project,"request-stale","rules"));expect(()=>applyResponseCandidate({...project,seedRevision:1},payload.candidates[0]!,"rules",0)).toThrow(/过期/);});
});
