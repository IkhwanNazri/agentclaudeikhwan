// Babak podcast guna GAMBAR RUJUKAN OWNER sendiri (watak 100% sama), dihidupkan lapisan demi lapisan:
// mulut buka/tutup ikut dialog, kelip mata, kamera ikut yang bercakap. (Tiada gerak kepala/tangan: latar ikut bergerak.)
// 2D sahaja → render laju. Tiada suara (owner rakam sendiri).
import { useMemo, type ReactNode } from 'react';
import { useAudioData, type AudioData } from '@remotion/media-utils';
import '@fontsource/poppins/800.css';
import { Captions } from './Captions';
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

type Who = 'host' | 'cohost';
export type RefLine = { who: Who; from: number; to: number; voice?: string; say?: string };
export type RefPodcastProps = { duration: number; lines: RefLine[]; wideStart?: number; wideEnd?: number };

const IMG = 'placthinc/opening.png';
const IW = 1671;
const IH = 941;
// kedudukan ciri dalam gambar asal (piksel)
type Ell = { x: number; y: number; rx: number; ry: number };
const RIG: Record<Who, {
  focusX: number; skin: string; lid: string;
  head: Ell; neck: [number, number]; mouth: Ell; eyes: Ell[]; hand: Ell; wrist: [number, number];
}> = {
  cohost: {
    focusX: 430, skin: 'rgb(250,182,124)', lid: 'rgb(240,180,128)',
    head: { x: 400, y: 370, rx: 230, ry: 230 }, neck: [400, 560],
    mouth: { x: 406, y: 471, rx: 33, ry: 26 },
    eyes: [{ x: 356, y: 402, rx: 35, ry: 26 }, { x: 443, y: 389, rx: 20, ry: 22 }],
    hand: { x: 650, y: 585, rx: 85, ry: 75 }, wrist: [610, 640],
  },
  host: {
    focusX: 1230, skin: 'rgb(244,172,115)', lid: 'rgb(236,168,112)',
    head: { x: 1270, y: 380, rx: 235, ry: 225 }, neck: [1290, 560],
    mouth: { x: 1236, y: 468, rx: 37, ry: 23 },
    eyes: [{ x: 1202, y: 392, rx: 14, ry: 19 }, { x: 1266, y: 400, rx: 21, ry: 20 }],
    hand: { x: 955, y: 590, rx: 85, ry: 75 }, wrist: [1000, 650],
  },
};

const noise = (n: number) => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };
const ease = Easing.inOut(Easing.cubic);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const Patch = ({ s, e, color, children }: { s: number; e: Ell; color: string; children?: ReactNode }) => (
  <div style={{ position: 'absolute', left: (e.x - e.rx) * s, top: (e.y - e.ry) * s, width: e.rx * 2 * s, height: e.ry * 2 * s }}>
    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, filter: `blur(${2 * s}px)` }} />
    {children}
  </div>
);

// mulut: 0 = asal (terbuka), 1 = tutup senyum, 2 = separuh
const Mouth = ({ s, who, state }: { s: number; who: Who; state: 0 | 1 | 2 }) => {
  if (state === 0) return null;
  const r = RIG[who];
  const w = r.mouth.rx * 2 * s;
  const h = r.mouth.ry * 2 * s;
  return (
    <Patch s={s} e={r.mouth} color={r.skin}>
      <svg viewBox="0 0 100 60" width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        {state === 1
          ? <path d="M22 30 Q50 46 78 30" fill="none" stroke="#3a1a14" strokeWidth={6} strokeLinecap="round" />
          : <path d="M28 26 Q50 22 72 26 Q66 44 50 46 Q34 44 28 26 Z" fill="#8a2a2e" stroke="#3a1a14" strokeWidth={5} strokeLinejoin="round" />}
      </svg>
    </Patch>
  );
};

// lip-sync: buka mulut ikut kekuatan suara (RMS) pada frame ini
const rmsAt = (d: AudioData, t: number, win: number) => {
  const w = d.channelWaveforms[0];
  const a = Math.max(0, Math.floor(t * d.sampleRate));
  const b = Math.min(w.length, a + Math.floor(win * d.sampleRate));
  let sum = 0;
  for (let i = a; i < b; i++) sum += w[i] * w[i];
  return b > a ? Math.sqrt(sum / (b - a)) : 0;
};
const AudioMouth = ({ s, who, line }: { s: number; who: Who; line: RefLine }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const data = useAudioData(staticFile(line.voice ?? ''));
  const peak = useMemo(() => {
    if (!data) return 1;
    let m = 0.0001;
    for (let t = 0; t < data.durationInSeconds; t += 1 / fps) m = Math.max(m, rmsAt(data, t, 1 / fps));
    return m;
  }, [data, fps]);
  if (!data) return <Mouth s={s} who={who} state={1} />;
  const lvl = rmsAt(data, frame / fps - line.from, 1 / fps) / peak;
  return <Mouth s={s} who={who} state={lvl > 0.42 ? 0 : lvl > 0.16 ? 2 : 1} />;
};

const Blink = ({ s, who }: { s: number; who: Who }) => (
  <>
    {RIG[who].eyes.map((e, i) => (
      <Patch key={i} s={s} e={e} color={RIG[who].lid}>
        <svg viewBox="0 0 100 100" width={e.rx * 2 * s} height={e.ry * 2 * s} style={{ position: 'absolute', inset: 0 }}>
          <path d="M8 52 Q50 74 92 52" fill="none" stroke="#1a1010" strokeWidth={9} strokeLinecap="round" />
        </svg>
      </Patch>
    ))}
  </>
);

export const RefPodcast = ({ lines, wideStart = 1.4, wideEnd = 1.4, duration }: RefPodcastProps) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const t = frame / fps;
  const cur = lines.find((l) => t >= l.from && t < l.to);
  // kamera: lebar → ikut yang bercakap → lebar di hujung (peralihan 0.8s)
  const fit = W / IW;
  const full = H / IH;
  const keys = [{ t: 0, x: IW / 2, z: 0 }, ...lines.map((l) => ({ t: Math.max(wideStart, l.from - 0.3), x: RIG[l.who].focusX, z: 1 })), { t: duration - wideEnd, x: IW / 2, z: 0 }];
  let ki = 0;
  while (ki < keys.length - 1 && t >= keys[ki + 1].t) ki++;
  const ka = keys[Math.max(0, ki - 1)];
  const kb = keys[ki];
  const k = ki === 0 ? 1 : ease(interpolate(t, [kb.t, kb.t + 0.8], [0, 1], clamp));
  const zoom = ka.z + (kb.z - ka.z) * k + (kb.z > 0 ? (t - kb.t) * 0.008 : 0);
  const s = fit + (full - fit) * zoom;
  const fx = ka.x + (kb.x - ka.x) * k;
  const sw = IW * s;
  const sh = IH * s;
  const tx = Math.min(0, Math.max(W - sw, W / 2 - fx * s));
  const ty = sh <= H ? (H - sh) / 2 : 0;

  const talking = (w: Who) => !!cur && cur.who === w;
  const mouthState = (w: Who): 0 | 1 | 2 => {
    if (!talking(w)) return 1;
    const step = Math.floor(frame / 3);
    const n = noise(step + (w === 'host' ? 11 : 3));
    return n > 0.55 ? 0 : n > 0.25 ? 2 : 1;
  };
  const blinking = (w: Who) => (frame + (w === 'host' ? 41 : 0)) % Math.round(fps * 3.4) < 4;

  return (
    <AbsoluteFill style={{ backgroundColor: '#050304', overflow: 'hidden' }}>
      <Img src={staticFile(IMG)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.35)', transform: 'scale(1.15)' }} />
      <div style={{ position: 'absolute', left: tx, top: ty, width: sw, height: sh, overflow: 'hidden' }}>
        <Img src={staticFile(IMG)} style={{ width: '100%', height: '100%', display: 'block' }} />
        {/* hanya tampalan dalam muka: latar tak terusik */}
        {(['cohost', 'host'] as Who[]).map((w) => (
          <div key={w}>
            {cur && cur.who === w && cur.voice ? <AudioMouth s={s} who={w} line={cur} /> : <Mouth s={s} who={w} state={mouthState(w)} />}
            {blinking(w) ? <Blink s={s} who={w} /> : null}
          </div>
        ))}
        {/* kelip lampu & tanglung */}
        {[[490, 115, 150], [1165, 115, 150], [785, 700, 130]].map(([x, y, r], j) => (
          <div key={j} style={{ position: 'absolute', left: (x - r) * s, top: (y - r) * s, width: r * 2 * s, height: r * 2 * s, borderRadius: '50%',
            background: 'radial-gradient(circle, #ffc46a 0%, transparent 70%)', mixBlendMode: 'screen', opacity: noise(Math.floor(frame / 3) + j * 7) > 0.93 ? 0.1 : 0.4 + noise(frame + j) * 0.12 }} />
        ))}
      </div>
      {Array.from({ length: 24 }, (_, j) => {
        const x = (noise(j) * W + t * (8 + noise(j + 3) * 14)) % W;
        const y = (noise(j + 9) * H - t * (10 + noise(j + 5) * 20) + H * 10) % H;
        return <div key={j} style={{ position: 'absolute', left: x, top: y, width: 5, height: 5, borderRadius: '50%', background: '#ffd9a0', opacity: 0.12 + noise(j + 2) * 0.3 }} />;
      })}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.65) 100%)' }} />
      {lines.map((l, i) => (l.voice ? (
        <Sequence key={i} from={Math.round(l.from * fps)} durationInFrames={Math.round((l.to - l.from + 0.4) * fps)}>
          <Audio src={staticFile(l.voice)} />
          {l.say ? <Captions text={l.say} sec={l.to - l.from} /> : null}
        </Sequence>
      ) : null))}
    </AbsoluteFill>
  );
};
