import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

await loadLocalEnv();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY. Generate the voice in AI Studio or set an API key and rerun this script.");
  process.exit(1);
}

const root = new URL(".", import.meta.url);
const transcriptPath = new URL("./voiceover.txt", root);
const outputPath = fileURLToPath(new URL("./assets/voiceover.wav", root));
const transcript = await readFile(transcriptPath, "utf8");

const prompt = `Say in Spanish with an Argentine neutral accent, young-adult professional tone, clear and close, urban premium brand energy, firm pace, short pauses, no shouting, no exaggerated announcer style:\n\n${transcript}`;

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    }),
  },
);

if (!response.ok) {
  const text = await response.text();
  console.error(`Gemini TTS failed: ${response.status} ${response.statusText}`);
  console.error(text);
  process.exit(1);
}

const json = await response.json();
const base64 = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
if (!base64) {
  console.error("Gemini TTS response did not include inline audio data.");
  console.error(JSON.stringify(json, null, 2));
  process.exit(1);
}

const pcm = Buffer.from(base64, "base64");
const wav = createWavFromPcm(pcm, 24000, 1, 16);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, wav);
console.log(`Voiceover written to ${outputPath}`);

function createWavFromPcm(pcmBuffer, sampleRate, channels, bitDepth) {
  const byteRate = (sampleRate * channels * bitDepth) / 8;
  const blockAlign = (channels * bitDepth) / 8;
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

async function loadLocalEnv() {
  const candidates = [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), ".env"),
  ];

  for (const file of candidates) {
    try {
      const content = await readFile(file, "utf8");
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#") || !line.includes("=")) continue;
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        let value = line.slice(index + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    } catch {
      // Optional local env file.
    }
  }
}
