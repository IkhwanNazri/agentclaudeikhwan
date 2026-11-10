#!/usr/bin/env node
// Render scenes.json -> video.mp4 (1080x1920) guna Chromium (Playwright) + ffmpeg.
// Usage: node pipeline/render.mjs content/<slug>/scenes.json [--preview]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const scenesPath = process.argv[2];
const previewOnly = process.argv.includes('--preview');
if (!scenesPath) {
  console.error('Usage: node pipeline/render.mjs content/<slug>/scenes.json [--preview]');
  process.exit(1);
}

const spec = JSON.parse(readFileSync(join(ROOT, 'config/spec.json'), 'utf8'));
const doc = JSON.parse(readFileSync(scenesPath, 'utf8'));
const outDir = dirname(resolve(scenesPath));
const theme = { ...spec.theme, ...(doc.theme || {}) };
const W = spec.width, H = spec.height, FPS = doc.fps || spec.fps;

validate(doc);

let start = 0;
const timeline = doc.scenes.map((s) => {
  const t = { ...s, start, end: start + s.duration };
  start += s.duration;
  return t;
});
const total = start;

const html = buildHtml(timeline, total);
writeFileSync(join(outDir, 'preview.html'), html);
if (previewOnly) {
  console.log(`Preview: ${join(outDir, 'preview.html')}`);
  process.exit(0);
}

await render();

// ---------------------------------------------------------------------------

function validate(d) {
  const errors = [];
  if (!Array.isArray(d.scenes) || d.scenes.length === 0) errors.push('scenes kosong');
  (d.scenes || []).forEach((s, i) => {
    if (!(s.duration > 0)) errors.push(`scene ${i}: duration mesti > 0`);
    (s.elements || []).forEach((e, j) => {
      if (e.animation && !spec.animations.includes(e.animation)) {
        errors.push(`scene ${i} el ${j}: animation "${e.animation}" tak wujud (${spec.animations.join(', ')})`);
      }
    });
  });
  const dur = (d.scenes || []).reduce((a, s) => a + (s.duration || 0), 0);
  if (dur < spec.minDurationSec || dur > spec.maxDurationSec) {
    errors.push(`jumlah durasi ${dur}s luar julat ${spec.minDurationSec}-${spec.maxDurationSec}s`);
  }
  if (errors.length) {
    console.error('scenes.json tak lulus validasi:\n- ' + errors.join('\n- '));
    process.exit(2);
  }
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function elementHtml(e) {
  const size = { hook: theme.hookSize, body: theme.bodySize, caption: theme.captionSize, emoji: 220 }[e.style || 'body'] || theme.bodySize;
  const color = e.color || (e.highlight ? theme.accent : theme.primary);
  const anim = e.animation || 'fadeIn';
  const delay = e.delay || 0;
  const styles = [
    `font-size:${e.size || size}px`,
    `color:${color}`,
    `animation:${anim} ${e.animDuration || 0.6}s cubic-bezier(.2,.9,.3,1.2) ${delay}s both`,
    e.bg ? `background:${e.bg};padding:16px 32px;border-radius:24px` : '',
    e.style === 'hook' ? `text-shadow:0 0 40px ${theme.accent}88` : '',
  ].filter(Boolean).join(';');
  let inner = esc(e.text);
  if (e.highlightWords) {
    for (const w of e.highlightWords) {
      inner = inner.replaceAll(esc(w), `<span style="color:${theme.accent2}">${esc(w)}</span>`);
    }
  }
  if (anim === 'typewriter') {
    const n = [...String(e.text)].length;
    return `<div class="el tw" style="${styles};--n:${n};animation-timing-function:steps(${n})">${inner}</div>`;
  }
  return `<div class="el" style="${styles}">${inner}</div>`;
}

function buildHtml(scenes, totalSec) {
  const sa = spec.safeArea;
  const sceneDivs = scenes.map((s, i) => `
  <section class="scene" data-start="${s.start}" data-end="${s.end}"
    style="background:${s.bg || (i % 2 ? theme.backgroundAlt : theme.background)};justify-content:${s.align || 'center'}">
    ${(s.elements || []).map(elementHtml).join('\n    ')}
  </section>`).join('');

  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;800&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0}
  html,body{width:${W}px;height:${H}px;overflow:hidden;background:${theme.background};font-family:${theme.fontFamily}}
  .scene{position:absolute;inset:0;visibility:hidden;display:flex;flex-direction:column;align-items:center;gap:48px;
    padding:${sa.top}px ${sa.right}px ${sa.bottom}px ${sa.left}px;text-align:center}
  .scene.on{visibility:visible}
  .el{font-weight:800;line-height:1.15;max-width:100%;word-wrap:break-word}
  .tw{overflow:hidden;white-space:nowrap;width:calc(var(--n) * 1ch)}
  #bar{position:absolute;left:0;bottom:0;height:12px;background:${theme.accent};width:0}
  @keyframes pop{0%{transform:scale(0);opacity:0}70%{transform:scale(1.12);opacity:1}100%{transform:scale(1)}}
  @keyframes slideUp{from{transform:translateY(160px);opacity:0}to{transform:none;opacity:1}}
  @keyframes slideLeft{from{transform:translateX(300px);opacity:0}to{transform:none;opacity:1}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes zoom{from{transform:scale(2.2);opacity:0}to{transform:scale(1);opacity:1}}
  @keyframes bounce{0%{transform:translateY(-400px);opacity:0}60%{transform:translateY(40px);opacity:1}80%{transform:translateY(-15px)}100%{transform:none}}
  @keyframes shake{0%,100%{transform:none;opacity:1}20%,60%{transform:translateX(-25px) rotate(-3deg)}40%,80%{transform:translateX(25px) rotate(3deg)}}
  @keyframes typewriter{from{width:0}}
</style></head><body>
${sceneDivs}
<div id="bar"></div>
<script>
  const TOTAL=${totalSec};
  const scenes=[...document.querySelectorAll('.scene')];
  window.seek=(t)=>{
    for(const s of scenes){
      const st=+s.dataset.start, en=+s.dataset.end, on=t>=st&&t<en;
      s.classList.toggle('on',on);
      for(const a of s.getAnimations({subtree:true})){a.pause();a.currentTime=Math.max(0,(t-st)*1000);}
    }
    document.getElementById('bar').style.width=(t/TOTAL*100)+'%';
  };
  // preview dalam browser: main sendiri
  if(!navigator.webdriver){const t0=performance.now();(function loop(){seek(((performance.now()-t0)/1000)%TOTAL);requestAnimationFrame(loop)})();}
</script></body></html>`;
}

async function render() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  const outFile = join(outDir, 'video.mp4');
  const music = doc.music || spec.music;
  const args = ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-'];
  if (music && existsSync(join(ROOT, music))) args.push('-i', join(ROOT, music), '-shortest', '-c:a', 'aac', '-b:a', '192k');
  args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20', '-movflags', '+faststart', outFile);

  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'pipe'] });
  let ffErr = '';
  ff.stderr.on('data', (d) => (ffErr += d));
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(ffErr.slice(-2000))))));

  const frames = Math.round(total * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.seek(t), f / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % FPS === 0) process.stdout.write(`\rRender ${Math.round((f / frames) * 100)}%`);
  }
  ff.stdin.end();
  await done;

  // thumbnail untuk reviewer (frame pada 1s)
  await page.evaluate(() => window.seek(1));
  await page.screenshot({ path: join(outDir, 'thumb.png') });
  await browser.close();
  console.log(`\rSiap: ${outFile} (${total}s, ${frames} frame)`);
}
