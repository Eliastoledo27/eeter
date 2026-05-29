import { renderSettings } from "./renderSettings";

export const secondsToFrames = (seconds: number) =>
  Math.round(seconds * renderSettings.fps);

export const timeline = {
  opening: { start: 0, duration: 5 },
  urban: { start: 5, duration: 10 },
  formal: { start: 15, duration: 10 },
  casual: { start: 25, duration: 10 },
  boots: { start: 35, duration: 10 },
  cta: { start: 45, duration: 10 },
  closing: { start: 55, duration: 5 },
} as const;

export const transitions = [4.6, 14.6, 24.6, 34.6, 44.6, 54.6];
