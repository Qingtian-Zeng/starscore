export type NoteOrigin = "user" | "rules" | "model";

export interface NoteEvent {
  id: string;
  pitch: number;
  startTick: number;
  durationTick: number;
  velocity: number;
  origin: NoteOrigin;
  editedByUser: boolean;
}

export type DrumInstrument = "kick" | "tap" | "hat";

export interface DrumEvent {
  id: string;
  instrument: DrumInstrument;
  startTick: number;
  velocity: number;
  origin: "rules";
  editedByUser: boolean;
}

export interface MixerChannel { enabled: boolean; gain: number; }

export type ResponseProvider = "rules" | "model";

export interface ResponseCandidate {
  id: string;
  label: "A" | "B";
  notes: NoteEvent[];
}

export interface ResponseMeta {
  provider: ResponseProvider;
  seedRevision: number;
  candidateId: string;
  acceptedAt: string;
}

export interface StarScoreProject {
  schemaVersion: 1;
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  revision: number;
  seedRevision: number;
  music: {
    ppq: 480;
    bpm: 90;
    meter: readonly [4, 4];
    loopBars: 4;
    key: "C";
    scale: "major-pentatonic";
  };
  tracks: {
    lead: { id: "lead"; events: NoteEvent[] };
    bass: { id: "bass"; events: NoteEvent[] };
    drums: { id: "drums"; events: DrumEvent[] };
  };
  layout: { notes: Record<string, { xNorm: number }> };
  mixer: { lead: MixerChannel; bass: MixerChannel; drums: MixerChannel };
  responseMeta?: ResponseMeta;
}
