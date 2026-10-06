import { Midi } from "@tonejs/midi";
import { LOOP_END_TICK, PPQ, type StarScoreProject } from "@starscore/core";

const drumMidi={kick:36,tap:37,hat:42} as const;
export function exportProjectMidi(project:StarScoreProject):Uint8Array{
  const midi=new Midi();midi.name=project.title;midi.header.setTempo(project.music.bpm);midi.header.timeSignatures.push({ticks:0,timeSignature:[4,4]});midi.header.meta.push({ticks:toMidiTicks(LOOP_END_TICK*2,midi.header.ppq),type:"marker",text:"StarScore 8-bar loop end"});midi.header.update();
  const lead=midi.addTrack();lead.name="Lead";const bass=midi.addTrack();bass.name="Rule Bass";const drums=midi.addTrack();drums.name="Rule Drums";drums.channel=9;
  for(const round of [0,LOOP_END_TICK]){
    project.tracks.lead.events.forEach(note=>lead.addNote({midi:note.pitch,ticks:toMidiTicks(note.startTick+round,midi.header.ppq),durationTicks:toMidiTicks(note.durationTick,midi.header.ppq),velocity:note.velocity}));
    project.tracks.bass.events.forEach(note=>bass.addNote({midi:note.pitch,ticks:toMidiTicks(note.startTick+round,midi.header.ppq),durationTicks:toMidiTicks(note.durationTick,midi.header.ppq),velocity:note.velocity}));
    project.tracks.drums.events.forEach(event=>drums.addNote({midi:drumMidi[event.instrument],ticks:toMidiTicks(event.startTick+round,midi.header.ppq),durationTicks:toMidiTicks(120,midi.header.ppq),velocity:event.velocity}));
  }
  return midi.toArray();
}
export function toMidiTicks(projectTicks:number,midiPpq:number){return Math.round(projectTicks/PPQ*midiPpq);}
export function inspectMidi(data:ArrayLike<number>|ArrayBuffer){const midi=new Midi(data);return{ppq:midi.header.ppq,bpm:midi.header.tempos[0]?.bpm,timeSignature:midi.header.timeSignatures[0]?.timeSignature,tracks:midi.tracks.map(track=>({name:track.name,channel:track.channel,notes:track.notes.map(note=>({midi:note.midi,ticks:note.ticks,durationTicks:note.durationTicks,velocity:note.velocity}))})),durationTicks:midi.durationTicks,meta:midi.header.meta};}
