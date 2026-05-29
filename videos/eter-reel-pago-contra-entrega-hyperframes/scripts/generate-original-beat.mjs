import { writeFileSync } from "node:fs";
import { join } from "node:path";

const sampleRate = 44100;
const seconds = 15.05;
const bpm = 148;
const totalSamples = Math.floor(sampleRate * seconds);
const channels = 2;
const data = new Float32Array(totalSamples);
const beat = (60 / bpm) * sampleRate;

const clamp = (v) => Math.max(-1, Math.min(1, v));
const env = (t, decay) => Math.exp(-t * decay);

for (let i = 0; i < totalSamples; i++) {
  const t = i / sampleRate;
  const step = i % beat;
  const halfStep = i % (beat / 2);
  let v = 0;

  if (step < sampleRate * 0.18) {
    const kt = step / sampleRate;
    const pitch = 58 - kt * 120;
    v += Math.sin(2 * Math.PI * pitch * t) * env(kt, 18) * 0.95;
  }

  if (Math.abs((i % (beat * 2)) - beat) < sampleRate * 0.07) {
    const st = Math.abs((i % (beat * 2)) - beat) / sampleRate;
    v += (Math.random() * 2 - 1) * env(st, 34) * 0.34;
  }

  if (halfStep < sampleRate * 0.018) {
    const ht = halfStep / sampleRate;
    v += (Math.random() * 2 - 1) * env(ht, 85) * 0.16;
  }

  const bass = Math.sin(2 * Math.PI * 43 * t) * 0.11;
  const neon = Math.sin(2 * Math.PI * (220 + Math.sin(t * 5.4) * 28) * t) * 0.035;
  data[i] = clamp((v + bass + neon) * 0.72);
}

const bytesPerSample = 2;
const blockAlign = channels * bytesPerSample;
const byteRate = sampleRate * blockAlign;
const dataBytes = totalSamples * blockAlign;
const buffer = Buffer.alloc(44 + dataBytes);

buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataBytes, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(channels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataBytes, 40);

for (let i = 0; i < totalSamples; i++) {
  const sample = Math.round(clamp(data[i]) * 32767);
  buffer.writeInt16LE(sample, 44 + i * 4);
  buffer.writeInt16LE(sample, 44 + i * 4 + 2);
}

writeFileSync(join(process.cwd(), "assets", "eter-original-beat.wav"), buffer);
