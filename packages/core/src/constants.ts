export const PPQ = 480 as const;
export const BPM = 90 as const;
export const USER_END_TICK = 3840 as const;
export const LOOP_END_TICK = 7680 as const;
export const DEFAULT_DURATION_TICK = 480 as const;
export const ALLOWED_DURATIONS = [240, 480, 960] as const;
export const MIN_VELOCITY = 0.1 as const;
export const MAX_VELOCITY = 1 as const;
export const MAX_USER_NOTES = 8 as const;
export const ALLOWED_PITCHES = [60, 62, 64, 67, 69, 72, 74, 76] as const;

export const pitchNames: Record<number, string> = {
  60: "C4", 62: "D4", 64: "E4", 67: "G4",
  69: "A4", 72: "C5", 74: "D5", 76: "E5"
};
