import { BPM, LOOP_END_TICK, PPQ, pitchNames, type DrumEvent, type NoteEvent, type StarScoreProject } from "@starscore/core";
import * as Tone from "tone";

export interface PlaybackHooks { onNote: (id: string | null) => void; onProgress: (value: number) => void; onEnded: () => void; }

class AudioEngine {
  private leadSynth: Tone.PolySynth | null = null; private bassSynth: Tone.MonoSynth | null = null;
  private kick: Tone.MembraneSynth | null = null; private tap: Tone.NoiseSynth | null = null; private hat: Tone.MetalSynth | null = null;
  private gains: Record<"lead"|"bass"|"drums", Tone.Gain> | null = null;
  private scheduled: number[] = [];
  private runToken = 0;

  private async ready(token: number) {
    await Tone.start();
    if(token!==this.runToken)return false;
    if (!this.leadSynth) {
      this.gains = { lead: new Tone.Gain(.82).toDestination(), bass: new Tone.Gain(.52).toDestination(), drums: new Tone.Gain(.42).toDestination() };
      this.leadSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: .018, decay: .34, sustain: .18, release: .85 }
      }).connect(this.gains.lead); this.leadSynth.volume.value = -9;
      this.bassSynth = new Tone.MonoSynth({ oscillator: { type: "sine" }, envelope: { attack: .03, decay: .25, sustain: .38, release: .35 }, filterEnvelope: { attack: .02, decay: .2, sustain: .2, release: .3, baseFrequency: 90, octaves: 2 } }).connect(this.gains.bass); this.bassSynth.volume.value = -8;
      this.kick = new Tone.MembraneSynth({ pitchDecay: .05, octaves: 5, envelope: { attack: .001, decay: .22, sustain: 0, release: .15 } }).connect(this.gains.drums); this.kick.volume.value = -8;
      this.tap = new Tone.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: .001, decay: .055, sustain: 0 } }).connect(this.gains.drums); this.tap.volume.value = -18;
      this.hat = new Tone.MetalSynth({ envelope: { attack: .001, decay: .04, release: .015 }, harmonicity: 4.2, modulationIndex: 18, resonance: 2600, octaves: 1.5 }).connect(this.gains.drums); this.hat.frequency.value = 220; this.hat.volume.value = -22;
    }
    return true;
  }

  async audition(note: NoteEvent) {
    if(!await this.ready(this.runToken))return;
    this.leadSynth!.triggerAttackRelease(pitchNames[note.pitch] ?? Tone.Frequency(note.pitch, "midi").toNote(), Math.max(.09, note.durationTick / PPQ * 60 / BPM * .7), undefined, note.velocity);
  }

  async play(project: StarScoreProject, hooks: PlaybackHooks) {
    this.stop();
    const token=this.runToken;
    if(!await this.ready(token))return;
    const ticksToSeconds = (ticks: number) => ticks / PPQ * 60 / BPM;
    (Object.keys(project.mixer) as Array<keyof typeof project.mixer>).forEach(track => { this.gains![track].gain.value = project.mixer[track].enabled ? project.mixer[track].gain : 0; });
    const transport = Tone.getTransport(); transport.stop(); transport.cancel(); transport.PPQ = PPQ; transport.bpm.value = BPM; transport.position = 0;
    project.tracks.lead.events.forEach(note => {
      transport.scheduleOnce(time => { if (token !== this.runToken) return; this.leadSynth!.triggerAttackRelease(pitchNames[note.pitch] ?? Tone.Frequency(note.pitch, "midi").toNote(), ticksToSeconds(note.durationTick) * .9, time, note.velocity); Tone.getDraw().schedule(()=>hooks.onNote(note.id),time); }, `${note.startTick}i`);
    });
    project.tracks.bass.events.forEach(note => transport.scheduleOnce(time => { if (token === this.runToken) this.bassSynth!.triggerAttackRelease(Tone.Frequency(note.pitch, "midi").toNote(), ticksToSeconds(note.durationTick) * .82, time, note.velocity); }, `${note.startTick}i`));
    project.tracks.drums.events.forEach(event => transport.scheduleOnce(time => { if (token === this.runToken) this.scheduleDrum(event, time); }, `${event.startTick}i`));
    const totalTicks = LOOP_END_TICK;
    transport.scheduleOnce(time => Tone.getDraw().schedule(()=>{ if (token === this.runToken) { hooks.onNote(null); hooks.onProgress(1); hooks.onEnded(); transport.stop(); transport.cancel(); } },time), `${LOOP_END_TICK}i`);
    const began = performance.now() + 80;
    const frame = () => {
      if (token !== this.runToken) return;
      const progress = Math.max(0, Math.min(1, (performance.now() - began) / (ticksToSeconds(totalTicks) * 1000)));
      hooks.onProgress(progress);
      if (progress < 1) this.scheduled.push(window.setTimeout(frame, 32));
    };
    frame();
    transport.start("+0.08", 0);
  }

  stop() {
    this.runToken += 1;
    this.scheduled.forEach(window.clearTimeout);
    this.scheduled = [];
    const transport = Tone.getTransport(); transport.stop(); transport.cancel(); transport.position = 0;
    this.leadSynth?.releaseAll(); this.bassSynth?.triggerRelease();
  }

  getDebugState() { return { timers: this.scheduled.length, initialized: Boolean(this.leadSynth), runToken: this.runToken }; }
  private scheduleDrum(event: DrumEvent, time: number) { if (event.instrument === "kick") this.kick?.triggerAttackRelease("C1", .12, time, event.velocity); else if (event.instrument === "tap") this.tap?.triggerAttackRelease(.04, time, event.velocity); else this.hat?.triggerAttackRelease("16n", time, event.velocity); }
  dispose() { this.stop(); this.leadSynth?.dispose(); this.bassSynth?.dispose(); this.kick?.dispose(); this.tap?.dispose(); this.hat?.dispose(); Object.values(this.gains ?? {}).forEach(node => node.dispose()); this.leadSynth = null; this.bassSynth = null; this.kick = null; this.tap = null; this.hat = null; this.gains = null; }
}

export const audioEngine = new AudioEngine();
