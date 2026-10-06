import { mkdir, writeFile } from "node:fs/promises";
import midiPackage from "@tonejs/midi";
import { createNightSailProject, exportProjectJson, LOOP_END_TICK, PPQ } from "../packages/core/dist/index.js";

const { Midi }=midiPackage;const project=createNightSailProject();project.id="sample-night-sail";project.createdAt="2026-10-05T00:00:00.000Z";project.updatedAt=project.createdAt;
const midi=new Midi();midi.name=project.title;midi.header.setTempo(90);midi.header.timeSignatures.push({ticks:0,timeSignature:[4,4]});const mt=t=>Math.round(t/PPQ*midi.header.ppq);midi.header.meta.push({ticks:mt(LOOP_END_TICK*2),type:"marker",text:"StarScore 8-bar loop end"});midi.header.update();
const lead=midi.addTrack();lead.name="Lead";const bass=midi.addTrack();bass.name="Rule Bass";const drums=midi.addTrack();drums.name="Rule Drums";drums.channel=9;const drumMidi={kick:36,tap:37,hat:42};
for(const round of [0,LOOP_END_TICK]){for(const note of project.tracks.lead.events)lead.addNote({midi:note.pitch,ticks:mt(note.startTick+round),durationTicks:mt(note.durationTick),velocity:note.velocity});for(const note of project.tracks.bass.events)bass.addNote({midi:note.pitch,ticks:mt(note.startTick+round),durationTicks:mt(note.durationTick),velocity:note.velocity});for(const event of project.tracks.drums.events)drums.addNote({midi:drumMidi[event.instrument],ticks:mt(event.startTick+round),durationTicks:mt(120),velocity:event.velocity});}
await mkdir(new URL("../samples/",import.meta.url),{recursive:true});await writeFile(new URL("../samples/night-sail.starscore.json",import.meta.url),exportProjectJson(project));await writeFile(new URL("../samples/night-sail.mid",import.meta.url),midi.toArray());
