// Babak cerita 2D dari gambar owner (menegak 9:16): kamera zoom/pan, kabus, cahaya berkelip, kelip mata watak,
// tukar versi gambar (A→B) dengan kesan seram, narasi + SFX. Satu fail JSON setiap video (senarai babak).
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

type Ell = { x: number; y: number; rx: number; ry: number };
export type Cam = { x: number; y: number; zoom: number }; // titik fokus (px gambar) + zoom (1 = penuh bingkai)
export type Glow = { x: number; y: number; r: number; color?: string; flicker?: number };
export type BlinkFace = { eyes: Ell[]; lid: string; seed?: number };
export type SfxCue = { src: string; at: number; dur?: number; volume?: number; loop?: boolean; fade?: number };
export type Shot = {
  image: string; w: number; h: number; duration: number;
  from?: Cam; to?: Cam; glows?: Glow[]; faces?: BlinkFace[]; fog?: number;
  toAt?: number; // saat kamera sampai 'to' (lalai: hujung syot)
  alt?: { image: string; at: number; flash?: boolean }; // tukar ke versi B pada saat 'at'
  voice?: string; voiceAt?: number; sfx?: SfxCue[]; shake?: { at: number; dur: number; amp?: number };
  endCard?: { at: number; logo?: string }; // gelap perlahan + logo
};
export type StoryProps = { shots: Shot[] };

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = Easing.inOut(Easing.sin);
const noise = (n: number) => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };

const ShotView = ({ shot }: { shot: Shot }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const t = frame / fps;
  const p = ease(interpolate(t, [0, shot.toAt ?? shot.duration], [0, 1], clamp));
  const a = shot.from ?? { x: shot.w / 2, y: shot.h / 2, zoom: 1 };
  const b = shot.to ?? { x: a.x, y: a.y, zoom: a.zoom * 1.08 };
  const base = Math.max(W / shot.w, H / shot.h);
  const s = base * (a.zoom + (b.zoom - a.zoom) * p);
  const fx = a.x + (b.x - a.x) * p;
  const fy = a.y + (b.y - a.y) * p;
  const sw = shot.w * s;
  const sh = shot.h * s;
  let tx = Math.min(0, Math.max(W - sw, W / 2 - fx * s));
  let ty = Math.min(0, Math.max(H - sh, H / 2 - fy * s));
  if (shot.shake && t >= shot.shake.at && t < shot.shake.at + shot.shake.dur) {
    const amp = (shot.shake.amp ?? 14) * (1 - (t - shot.shake.at) / shot.shake.dur);
    tx += (noise(frame) - 0.5) * amp * 2;
    ty += (noise(frame + 99) - 0.5) * amp * 2;
  }
  const altOn = shot.alt ? interpolate(t, [shot.alt.at, shot.alt.at + 0.12], [0, 1], clamp) : 0;
  const flash = shot.alt?.flash ? interpolate(t, [shot.alt.at - 0.05, shot.alt.at, shot.alt.at + 0.35], [0, 1, 0], clamp) : 0;
  const fog = shot.fog ?? 0.5;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#000' }}>
      <div style={{ position: 'absolute', left: tx, top: ty, width: sw, height: sh }}>
        <Img src={staticFile(shot.image)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        {shot.alt ? <Img src={staticFile(shot.alt.image)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: altOn }} /> : null}
        {(shot.glows ?? []).map((g, j) => {
          const off = noise(Math.floor(frame / 3) + j * 13) > 1 - (g.flicker ?? 0.06);
          return (
            <div key={j} style={{ position: 'absolute', left: (g.x - g.r) * s, top: (g.y - g.r) * s, width: g.r * 2 * s, height: g.r * 2 * s, borderRadius: '50%',
              background: `radial-gradient(circle, ${g.color ?? '#ffc46a'} 0%, transparent 70%)`, mixBlendMode: 'screen', opacity: off ? 0.05 : 0.38 + noise(frame + j) * 0.12 }} />
          );
        })}
        {altOn < 0.5 ? (shot.faces ?? []).map((f, j) => {
          const blink = (frame + (f.seed ?? j * 29)) % Math.round(fps * 3.1) < 4;
          return blink ? f.eyes.map((e, k) => (
            <div key={`${j}-${k}`} style={{ position: 'absolute', left: (e.x - e.rx) * s, top: (e.y - e.ry) * s, width: e.rx * 2 * s, height: e.ry * 2 * s }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: f.lid, filter: `blur(${1.2 * s}px)` }} />
              <div style={{ position: 'absolute', left: '8%', right: '8%', top: '52%', height: Math.max(2, 3 * s), borderRadius: 4, background: '#1a1010' }} />
            </div>
          )) : null;
        }) : null}
      </div>
      {/* kabus bergerak (2 lapis) */}
      {[0, 1].map((k) => (
        <AbsoluteFill key={k} style={{ opacity: fog * (k ? 0.55 : 0.8),
          background: `radial-gradient(ellipse 60% 18% at ${((t * (12 + k * 9) + k * 40) % 140) - 20}% ${78 - k * 18}%, rgba(200,205,230,0.55), transparent 70%),
                       radial-gradient(ellipse 50% 14% at ${((t * (9 + k * 7) + 70 + k * 30) % 140) - 20}% ${88 - k * 22}%, rgba(190,195,220,0.45), transparent 70%)` }} />
      ))}
      {Array.from({ length: 22 }, (_, j) => {
        const x = (noise(j) * W + t * (8 + noise(j + 3) * 14)) % W;
        const y = (noise(j + 9) * H - t * (10 + noise(j + 5) * 20) + H * 10) % H;
        return <div key={j} style={{ position: 'absolute', left: x, top: y, width: 5, height: 5, borderRadius: '50%', background: '#ffe2b0', opacity: 0.1 + noise(j + 2) * 0.25 }} />;
      })}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />
      <AbsoluteFill style={{ backgroundColor: '#fff', opacity: flash * 0.85 }} />
      {shot.endCard ? (
        <AbsoluteFill style={{ backgroundColor: '#000', opacity: interpolate(t, [shot.endCard.at, shot.endCard.at + 1], [0, 1], clamp), alignItems: 'center', justifyContent: 'center' }}>
          <Img src={staticFile(shot.endCard.logo ?? 'placthinc2/logo.png')} style={{ width: 760, opacity: interpolate(t, [shot.endCard.at + 0.9, shot.endCard.at + 1.6], [0, 1], clamp), transform: `scale(${interpolate(t, [shot.endCard.at + 0.9, shot.endCard.at + 3], [0.92, 1.02], clamp)})` }} />
        </AbsoluteFill>
      ) : null}
      {shot.voice ? <Sequence from={Math.round((shot.voiceAt ?? 0.4) * fps)}><Audio src={staticFile(shot.voice)} /></Sequence> : null}
      {(shot.sfx ?? []).map((x, i) => {
        const len = Math.round((x.dur ?? 4) * fps);
        const fd = Math.max(1, Math.round((x.fade ?? 0) * fps));
        return (
          <Sequence key={i} from={Math.round(x.at * fps)} durationInFrames={len}>
            <Audio src={staticFile(`sfx/${x.src}.wav`)} loop={x.loop} volume={(f) => (x.volume ?? 0.5) * (x.fade ? Math.min(1, f / fd, (len - f) / fd) : 1)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const storyDuration = (p: StoryProps, fps: number) => Math.max(1, Math.round(p.shots.reduce((a, s) => a + s.duration, 0) * fps));

export const StoryScene = ({ shots }: StoryProps) => {
  const { fps } = useVideoConfig();
  let start = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {shots.map((s, i) => {
        const from = start;
        const d = Math.round(s.duration * fps);
        start += d;
        return <Sequence key={i} from={from} durationInFrames={d}><ShotView shot={s} /></Sequence>;
      })}
    </AbsoluteFill>
  );
};
