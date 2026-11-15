#!/usr/bin/env node
// Jana suara (Gemini TTS, tier percuma AI Studio) untuk setiap scene yang ada medan "say".
// Panjangkan durasi scene ikut panjang suara, kemudian tulis semula scenes.json.
// Usage: node pipeline/tts.mjs content/<slug>/scenes.json
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const cleanOnly = process.argv.includes('--clean-only');
// --only=5,8 : jana semula babak tertentu sahaja
const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const only = onlyArg ? new Set(onlyArg.slice(7).split(',').map(Number)) : null;
const scenesPath = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!scenesPath) {
  console.error('Usage: node pipeline/tts.mjs content/<slug>/scenes.json [--clean-only]');
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

if (cleanOnly) {
  // Bersihkan suara sedia ada tanpa panggil API
  for (const scene of doc.scenes) if (scene.voice) cleanTail(join(publicDir, scene.voice));
  console.log('Hujung suara dibersihkan.');
  process.exit(0);
}

for (const [i, scene] of doc.scenes.entries()) {
  if (!scene.say) continue;
  if (only && !only.has(i)) continue;
  const file = `${slug}_${i}.wav`;
  const pcm = join(outDir, `.voice_${i}.pcm`);
  // TTS kadang-kadang ulang ayat dua kali: kalau terlalu panjang berbanding bilangan perkataan, cuba lagi
  const words = scene.say.split(/\s+/).filter(Boolean).length;
  const maxSec = words / 2.2 + 1.5;
  let seconds = 0;
  for (let attempt = 1; attempt <= 3; attempt++) {
    synthesize(directorPrompt(style, scene.say), pcm, scene.voiceName || voice.voiceName);
    run('ffmpeg', ['-v', 'error', '-y', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', pcm, join(publicDir, file)]);
    cleanTail(join(publicDir, file));
    seconds = audioSeconds(join(publicDir, file));
    if (seconds <= maxSec) break;
    console.log(`  scene ${i}: suara ${seconds.toFixed(1)}s terlalu panjang (had ${maxSec.toFixed(1)}s), cuba lagi (${attempt}/3)`);
  }
  if (doc.voiceSpeed && doc.voiceSpeed !== 1) speedUp(join(publicDir, file), doc.voiceSpeed);
  seconds = audioSeconds(join(publicDir, file));
  scene.voice = file;
  scene.duration = Math.ceil((seconds + 0.4) * 10) / 10;
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

function synthesize(text, pcmPath, voiceName) {
  const body = JSON.stringify({
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
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

// Gemini TTS kadang-kadang tinggalkan bunyi 'walkie-talkie' (letupan pendek selepas senyap)
// di hujung klip. Cari senyap terakhir dalam 1.5s hujung; kalau bunyi selepasnya pendek (<0.7s),
// potong di situ. Tambah fade-in/out pendek supaya tiada klik.
function cleanTail(file) {
  const dur = audioSeconds(file);
  const r = spawnSync('ffmpeg', ['-v', 'info', '-i', file, '-af', 'silencedetect=noise=-40dB:d=0.08', '-f', 'null', '-'], { encoding: 'utf8' });
  const starts = [...(r.stderr || '').matchAll(/silence_start: ([\d.]+)/g)].map((m) => parseFloat(m[1]));
  const ends = [...(r.stderr || '').matchAll(/silence_end: ([\d.]+)/g)].map((m) => parseFloat(m[1]));
  let cut = dur;
  for (let k = starts.length - 1; k >= 0; k--) {
    const s = starts[k];
    const e = ends[k] ?? dur;
    if (s < dur - 1.5) break;
    if (e < dur && dur - e < 0.7) { cut = s + 0.05; break; }
  }
  const fadeOut = Math.max(0, cut - 0.06);
  const tmp = file.replace(/\.wav$/, '.tmp.wav');
  run('ffmpeg', ['-v', 'error', '-y', '-i', file, '-af', `atrim=0:${cut},afade=t=in:d=0.02,afade=t=out:st=${fadeOut}:d=0.06`, tmp]);
  run('mv', [tmp, file]);
  if (cut < dur) console.log(`  potong bunyi hujung: ${dur.toFixed(2)}s → ${cut.toFixed(2)}s`);
}

// Cepatkan suara tanpa ubah pic (cth 1.15 untuk muatkan dalam had durasi)
function speedUp(file, factor) {
  const tmp = file.replace(/\.wav$/, '.fast.wav');
  run('ffmpeg', ['-v', 'error', '-y', '-i', file, '-af', `atempo=${factor}`, tmp]);
  run('mv', [tmp, file]);
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
