#!/usr/bin/env node
// Jana gambar gaya PS2 untuk setiap scene yang ada "imagePrompt" guna Pollinations.ai (percuma, tanpa key),
// kemudian tapis jadi pixel PS2 (ffmpeg) dan simpan ke video/public.
// Usage: node pipeline/images.mjs content/<slug>/scenes.json [--force]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const scenesPath = process.argv[2];
const force = process.argv.includes('--force');
if (!scenesPath) {
  console.error('Usage: node pipeline/images.mjs content/<slug>/scenes.json [--force]');
  process.exit(1);
}

const spec = JSON.parse(readFileSync(join(ROOT, 'config/spec.json'), 'utf8'));
const cfg = spec.images;
const doc = JSON.parse(readFileSync(scenesPath, 'utf8'));
const outDir = dirname(resolve(scenesPath));
const slug = basename(outDir);
const publicDir = join(ROOT, 'video', 'public');
mkdirSync(publicDir, { recursive: true });

// Watak dikunci dengan penerangan + seed yang sama supaya rupa konsisten antara babak
const characters = doc.characters ?? {};
const seed = doc.seed ?? 1234;

const jobs = [];
for (const [i, scene] of doc.scenes.entries()) {
  if (scene.imagePrompt) jobs.push({ target: scene, key: `${i}` });
  (scene.shots ?? []).forEach((shot, k) => shot.imagePrompt && jobs.push({ target: shot, key: `${i}_${k}` }));
}

for (const [n, { target: scene, key: i }] of jobs.entries()) {
  const file = `${slug}_img_${i}.png`;
  const finalPath = join(publicDir, file);
  if (existsSync(finalPath) && !force) {
    scene.image = file;
    console.log(`scene ${i}: guna gambar sedia ada`);
    continue;
  }
  const castNotes = Object.entries(characters)
    .filter(([name]) => scene.imagePrompt.includes(name))
    .map(([name, look]) => `${name} is a ${look}`)
    .join('. ');
  // Aksi babak dulu (model ikut bahagian awal prompt), kemudian rupa watak, kemudian gaya PS2
  const prompt = [scene.imagePrompt, castNotes, cfg.styleSuffix].filter(Boolean).join('. ');
  const raw = join(outDir, `.img_${i}.jpg`);
  fetchImage(prompt, raw, seed + n);
  // Potong watermark bawah, kecilkan (pixel PS2), besarkan semula tanpa smoothing
  const filter = `crop=iw:ih-${cfg.cropBottom}:0:0,scale=${cfg.pixelWidth}:-2:flags=area,eq=contrast=1.08:saturation=0.9,scale=1080:1920:flags=neighbor:force_original_aspect_ratio=increase,crop=1080:1920`;
  run('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-vf', filter, finalPath]);
  scene.image = file;
  console.log(`scene ${i}: gambar siap`);
}

writeFileSync(scenesPath, JSON.stringify(doc, null, 2));
console.log('Gambar siap. Seterusnya: node pipeline/tts.mjs ' + scenesPath);

// ---------------------------------------------------------------------------

function fetchImage(prompt, outPath, imgSeed) {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
    + `?width=576&height=1024&seed=${imgSeed}&model=${cfg.model}&nologo=true`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const r = spawnSync('curl', ['-sS', '-L', '--max-time', '150', '-o', outPath, '-w', '%{http_code}', url], { encoding: 'utf8' });
    if (r.stdout === '200') return;
    console.log(`Pollinations HTTP ${r.stdout || r.stderr.trim()} — cuba lagi dalam ${15 * attempt}s`);
    spawnSync('sleep', [String(15 * attempt)]);
  }
  console.error('Gagal jana gambar selepas 4 cubaan.');
  process.exit(3);
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(`${cmd} gagal: ${r.stderr}`);
    process.exit(4);
  }
  return r.stdout;
}
