#!/usr/bin/env node
// Jana suara (Gemini TTS, tier percuma AI Studio) untuk setiap scene yang ada medan "say".
// Panjangkan durasi scene ikut panjang suara, kemudian tulis semula scenes.json.
// Usage: node pipeline/tts.mjs content/<slug>/scenes.json
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const scenesPath = process.argv[2];
if (!scenesPath) {
  console.error('Usage: node pipeline/tts.mjs content/<slug>/scenes.json');
  process.exit(1);
}
loadDotEnv();

const spec = JSON.parse(readFileSync(join(ROOT, 'config/spec.json'), 'utf8'));
const voice = spec.voice;
const doc = JSON.parse(readFileSync(scenesPath, 'utf8'));
const outDir = dirname(resolve(scenesPath));
const slug = basename(outDir);
const publicDir = join(ROOT, 'video', 'public');
mkdirSync(publicDir, { recursive: true });

const style = doc.voiceStyle || voice.defaultStyle;
// Dalam cloud sandbox, proxy masukkan key sebenar; nilai dummy ni diganti.
const apiKey = process.env.GEMINI_API_KEY || 'proxy-injected';
const endpoint = (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
let modelIndex = 0;

for (const [i, scene] of doc.scenes.entries()) {
  if (!scene.say) continue;
  const file = `${slug}_${i}.wav`;
  const pcm = join(outDir, `.voice_${i}.pcm`);
  synthesize(directorPrompt(style, scene.say), pcm);
  run('ffmpeg', ['-v', 'error', '-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', pcm, join(publicDir, file)]);
  const seconds = audioSeconds(join(publicDir, file));
  scene.voice = file;
  scene.duration = Math.max(scene.duration, Math.ceil((seconds + 0.4) * 10) / 10);
  console.log(`scene ${i}: ${seconds.toFixed(1)}s suara → durasi ${scene.duration}s`);
}

writeFileSync(scenesPath, JSON.stringify(doc, null, 2));
console.log('Suara siap. Seterusnya: node pipeline/render.mjs ' + scenesPath);

// ---------------------------------------------------------------------------

// Arahan nada diasingkan dari transkrip supaya model tak baca arahan tu kuat-kuat.
function directorPrompt(styleNote, transcript) {
  return [
    '### DIRECTOR NOTES (do NOT read aloud)',
    `Voice style: ${styleNote}`,
    'Language: Malaysian Malay (Bahasa Melayu Malaysia), natural casual accent.',
    'Speak ONLY the transcript below, nothing else.',
    '',
    '### TRANSCRIPT',
    transcript,
  ].join('\n');
}

function synthesize(text, pcmPath) {
  const body = JSON.stringify({
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice.voiceName } } },
    },
  });
  const bodyFile = pcmPath + '.req.json';
  writeFileSync(bodyFile, body);
  for (let attempt = 1; attempt <= 6; attempt++) {
    const res = spawnSync('curl', ['-sS', '-X', 'POST', endpoint(voice.models[modelIndex]), '-H', 'Content-Type: application/json',
      '-H', `x-goog-api-key: ${apiKey}`, '--data-binary', `@${bodyFile}`, '-w', '\n%{http_code}'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const out = res.stdout || '';
    const code = out.slice(out.lastIndexOf('\n') + 1);
    const json = out.slice(0, out.lastIndexOf('\n'));
    if (code === '200') {
      const data = JSON.parse(json).candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
      if (!data) throw new Error('Tiada audio dalam respons: ' + json.slice(0, 300));
      writeFileSync(pcmPath, Buffer.from(data, 'base64'));
      return;
    }
    if (code === '429' || code === '404' || code === '503') {
      if (modelIndex < voice.models.length - 1) {
        modelIndex++;
        console.log(`HTTP ${code}: tukar ke model ${voice.models[modelIndex]}`);
        continue;
      }
      if (code === '429' && attempt < 6) {
        console.log(`Had percuma (429), tunggu ${20 * attempt}s...`);
        spawnSync('sleep', [String(20 * attempt)]);
        continue;
      }
    }
    console.error(`Gemini TTS gagal (HTTP ${code}): ${json.slice(0, 500)}`);
    process.exit(3);
  }
}

function audioSeconds(file) {
  const r = run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
  return parseFloat(r);
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(`${cmd} gagal: ${r.stderr}`);
    process.exit(4);
  }
  return r.stdout;
}

function loadDotEnv() {
  const p = join(ROOT, '.env');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && m[2] && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
