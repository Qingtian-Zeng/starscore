import { ALLOWED_PITCHES } from "@starscore/core";

export const CANVAS_WIDTH = 750;
export const CANVAS_HEIGHT = 560;
export const PAD_X = 58;
export const PAD_Y = 76;

export function pitchToY(pitch: number): number {
  const index = ALLOWED_PITCHES.indexOf(pitch as typeof ALLOWED_PITCHES[number]);
  const safeIndex = Math.max(0, index);
  return PAD_Y + ((ALLOWED_PITCHES.length - 1 - safeIndex) / (ALLOWED_PITCHES.length - 1)) * (CANVAS_HEIGHT - PAD_Y * 2);
}

export function yToPitch(y: number): number {
  const ratio = 1 - Math.max(0, Math.min(1, (y - PAD_Y) / (CANVAS_HEIGHT - PAD_Y * 2)));
  const index = Math.round(ratio * (ALLOWED_PITCHES.length - 1));
  return ALLOWED_PITCHES[index] ?? ALLOWED_PITCHES[0];
}

export function xNormToX(xNorm: number): number { return PAD_X + xNorm * (CANVAS_WIDTH - PAD_X * 2); }
export function xToNorm(x: number): number { return Math.max(0, Math.min(1, (x - PAD_X) / (CANVAS_WIDTH - PAD_X * 2))); }
