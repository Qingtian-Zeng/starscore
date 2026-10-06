import { describe,expect,it } from "vitest";
import { createNightSailProject, LOOP_END_TICK } from "@starscore/core";
import { exportProjectMidi,inspectMidi,toMidiTicks } from "./midi";

describe("MIDI export",()=>{
  it("exports two unchanged rounds with three tracks, tempo and meter",()=>{const project=createNightSailProject();const before=JSON.stringify(project);const parsed=inspectMidi(exportProjectMidi(project));expect(JSON.stringify(project)).toBe(before);expect(parsed.bpm).toBeCloseTo(90,3);expect(parsed.timeSignature).toEqual([4,4]);expect(parsed.tracks).toHaveLength(3);expect(parsed.tracks[0]?.notes).toHaveLength(project.tracks.lead.events.length*2);expect(parsed.tracks[1]?.notes).toHaveLength(project.tracks.bass.events.length*2);expect(parsed.tracks[2]?.notes).toHaveLength(project.tracks.drums.events.length*2);expect(parsed.tracks[0]?.notes[0]).toMatchObject({midi:60,ticks:0,durationTicks:toMidiTicks(480,parsed.ppq)});expect(parsed.tracks[0]?.notes[project.tracks.lead.events.length]?.ticks).toBe(toMidiTicks(LOOP_END_TICK,parsed.ppq));expect(parsed.meta.some(event=>event.type==="marker"&&event.ticks===toMidiTicks(LOOP_END_TICK*2,parsed.ppq))).toBe(true);});
});
