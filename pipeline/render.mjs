#!/usr/bin/env node
// Validasi scenes.json, kemudian render jadi video.mp4 guna Remotion (video/).
// Usage: node pipeline/render.mjs content/<slug>/scenes.json
import { readFileSync, existsSync, copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const VIDEO = join(ROOT, 'video');
const scenesPath = process.argv[2];
if (!scenesPath) {
  console.error('Usage: node pipeline/render.mjs content/<slug>/scenes.json');
  process.exit(1);
}

const spec = JSON.parse(readFileSync(join(ROOT, 'config/spec.json'), 'utf8'));
const doc = JSON.parse(readFileSync(scenesPath, 'utf8'));
const outDir = dirname(resolve(scenesPath));

const errors = validate(doc);
if (errors.length) {
  console.error('scenes.json tak lulus validasi:\n- ' + errors.join('\n- '));
  process.exit(2);
}

// Muzik: salin ke video/public supaya Remotion boleh baca guna staticFile()
const music = doc.music ?? spec.music;
if (music) {
  const src = resolve(ROOT, music);
  if (!existsSync(src)) {
    console.error(`Fail muzik tak jumpa: ${music}`);
    process.exit(2);
  }
  mkdirSync(join(VIDEO, 'public'), { recursive: true });
  copyFileSync(src, join(VIDEO, 'public', basename(src)));
  doc.music = basename(src);
}
const propsFile = join(outDir, '.render-props.json');
await import('node:fs').then((fs) => fs.writeFileSync(propsFile, JSON.stringify(doc)));

const args = ['remotion', 'render', 'src/index.ts', 'TikTok', join(outDir, 'video.mp4'), `--props=${propsFile}`];
const browser = findBrowser();
if (browser) args.push(`--browser-executable=${browser}`);

const result = spawnSync('npx', args, { cwd: VIDEO, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);

spawnSync('npx', ['remotion', 'still', 'src/index.ts', 'TikTok', join(outDir, 'thumb.png'), `--props=${propsFile}`, '--frame=30',
  ...(browser ? [`--browser-executable=${browser}`] : [])], { cwd: VIDEO, stdio: 'ignore' });
console.log(`Siap: ${join(outDir, 'video.mp4')}`);

// ---------------------------------------------------------------------------

function validate(d) {
  const errs = [];
  if (!Array.isArray(d.scenes) || d.scenes.length === 0) errs.push('scenes kosong');
  (d.scenes || []).forEach((s, i) => {
    if (!(s.duration > 0)) errs.push(`scene ${i}: duration mesti > 0`);
    (s.elements || []).forEach((e, j) => {
      if (!e.text) errs.push(`scene ${i} el ${j}: text kosong`);
      if (e.animation && !spec.animations.includes(e.animation)) {
        errs.push(`scene ${i} el ${j}: animation "${e.animation}" tak wujud (${spec.animations.join(', ')})`);
      }
    });
  });
  const total = (d.scenes || []).reduce((a, s) => a + (s.duration || 0), 0);
  if (total < spec.minDurationSec || total > spec.maxDurationSec) {
    errs.push(`jumlah durasi ${total}s luar julat ${spec.minDurationSec}-${spec.maxDurationSec}s`);
  }
  return errs;
}

// Guna Chromium sedia ada kalau ada (cloud sandbox); kalau tiada, Remotion muat turun sendiri.
function findBrowser() {
  if (process.env.REMOTION_BROWSER) return process.env.REMOTION_BROWSER;
  const base = '/opt/pw-browsers';
  if (!existsSync(base)) return null;
  for (const d of readdirSync(base).filter((n) => n.startsWith('chromium_headless_shell'))) {
    const p = join(base, d, 'chrome-headless-shell-linux64', 'chrome-headless-shell');
    if (existsSync(p)) return p;
  }
  return null;
}
