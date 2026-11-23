// Enjin video 2D gaya kertas potong. Dipacu scenes.json: babak podcast (2 pengacara) → babak cerita.
// Watak & pergerakan konsisten (characters.tsx). Tiada suara (owner rakam sendiri). Render laju.
import { AbsoluteFill, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { FemaleCohost, MaleHost, type Mouth, type Pose } from './characters';
import { Books, Curtains, Desk, HangLamp, Lantern, Mic, Skull } from './props';

export type Who = 'host' | 'cohost';
export type Mood = 'talk' | 'happy' | 'scared' | 'shock';
export type Line = { who: Who; from: number; to: number; mood?: Mood };
export type PaperScene = { set: 'podcast'; duration: number; lines?: Line[] };
export type PaperShowProps = { scenes: PaperScene[] };

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const noise = (n: number) => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };

// ---------------------------------------------------------------- gerak watak (dikongsi semua babak)

const TALK: Mouth[] = ['open', 'smile', 'o', 'open', 'grin', 'smile'];
// pose watak pada frame ini: mulut ikut dialog, kelip mata, angguk, tangan isyarat
export const actPose = ({ frame, fps, talking, mood = 'talk', seed, inner }: { frame: number; fps: number; talking: boolean; mood?: Mood; seed: number; inner: 'L' | 'R' }): Pose => {
  const blink = (frame + seed * 37) % Math.round(fps * 3.2) < 4;
  const mouth: Mouth = talking ? TALK[Math.floor((frame + seed) / 4 + noise(Math.floor(frame / 4) + seed) * 2) % TALK.length]
    : mood === 'scared' ? 'worried' : mood === 'shock' ? 'o' : mood === 'happy' ? 'grin' : 'smile';
  const eyes = blink ? 'blink' : mood === 'shock' || mood === 'scared' ? 'wide' : mood === 'happy' && !talking ? 'happy' : 'open';
  const brows = mood === 'scared' ? 'worried' : mood === 'shock' || (talking && Math.sin(frame * 0.11 + seed) > 0.4) ? 'up' : 'normal';
  const head = talking ? Math.sin(frame * 0.16 + seed) * 5 : Math.sin(frame * 0.05 + seed) * 2;
  const g = talking ? 95 + Math.sin(frame * 0.2 + seed) * 25 : mood === 'shock' ? 150 : 14;
  const f = talking ? 55 + Math.sin(frame * 0.27 + seed) * 25 : mood === 'shock' ? 30 : 12;
  return inner === 'L'
    ? { mouth, eyes, brows, head, armL: g, foreL: f, armR: 10, foreR: 14 }
    : { mouth, eyes, brows, head, armR: g, foreR: f, armL: 10, foreL: 14 };
};

// ---------------------------------------------------------------- babak: podcast

const Podcast = ({ lines = [] }: { lines?: Line[] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cur = lines.find((l) => t >= l.from && t < l.to);
  const talking = (w: Who) => !!cur && cur.who === w;
  const moodOf = (w: Who): Mood | undefined => (cur?.who === w ? cur.mood : cur?.mood === 'scared' || cur?.mood === 'shock' ? cur.mood : undefined);
  const rise = (d: number) => interpolate(spring({ frame: frame - d, fps, config: { damping: 13 } }), [0, 1], [700, 0]);
  const bob = (w: Who, s: number) => (talking(w) ? Math.abs(Math.sin(frame * 0.3 + s)) * 10 : Math.sin(frame * 0.06 + s) * 3);
  const flick = (s: number) => (noise(Math.floor(frame / 3) + s) > 0.95 ? 0.4 : 0.9 + noise(frame + s) * 0.1);
  const focus = cur ? (cur.who === 'host' ? 1 : -1) : 0;
  const zoom = 1 + (cur ? 0.045 : 0) + t * 0.002;
  const W = 530;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: '#0b0808' }}>
      <AbsoluteFill style={{ transformOrigin: `${540 + focus * 170}px 1000px`, transform: `scale(${zoom})` }}>
        <Curtains />
        <HangLamp id="l1" x={240} glow={flick(1)} swing={Math.sin(frame * 0.04) * 1.5} />
        <HangLamp id="l2" x={840} glow={flick(5)} swing={Math.sin(frame * 0.04 + 2) * 1.5} />
        <Img src={staticFile('placthinc2/logo.png')} style={{ position: 'absolute', left: 190, top: 250 - rise(0) * 0.8, width: 700, transform: `rotate(${Math.sin(frame * 0.05) * 1.2}deg)` }} />
        <div style={{ position: 'absolute', left: 285 - W / 2, top: 630 + rise(4) - bob('cohost', 1), width: W, height: W * 2.25 }}>
          <FemaleCohost id="pc" pose={actPose({ frame, fps, talking: talking('cohost'), mood: moodOf('cohost'), seed: 1, inner: 'R' })} />
        </div>
        <div style={{ position: 'absolute', left: 795 - W / 2, top: 630 + rise(8) - bob('host', 3), width: W, height: W * 2.25 }}>
          <MaleHost id="ph" pose={actPose({ frame, fps, talking: talking('host'), mood: moodOf('host'), seed: 3, inner: 'L' })} />
        </div>
        <Mic id="m1" x={395} y={1150} w={115} />
        <Mic id="m2" x={570} y={1150} w={115} flip />
        <Desk top={1440} />
        <Books id="bk" x={30} y={1300} w={250} />
        <Lantern id="ln" x={450} y={1180} w={180} glow={flick(9)} />
        <Skull id="sk" x={835} y={1245} w={205} />
      </AbsoluteFill>
      {Array.from({ length: 24 }, (_, j) => {
        const x = (noise(j) * 1080 + t * (8 + noise(j + 3) * 14)) % 1080;
        const y = (noise(j + 9) * 1920 - t * (10 + noise(j + 5) * 20) + 19200) % 1920;
        return <div key={j} style={{ position: 'absolute', left: x, top: y, width: 5, height: 5, borderRadius: '50%', background: '#ffd9a0', opacity: 0.12 + noise(j + 2) * 0.3 }} />;
      })}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 48%, transparent 50%, rgba(0,0,0,0.7) 100%)' }} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- komposisi

export const paperDuration = (p: PaperShowProps, fps: number) => Math.max(1, Math.round(p.scenes.reduce((a, s) => a + s.duration, 0) * fps));

export const PaperShow = ({ scenes }: PaperShowProps) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  let start = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {scenes.map((s, i) => {
        const from = start;
        start += Math.round(s.duration * fps);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.round(s.duration * fps)}>
            {s.set === 'podcast' ? <Podcast lines={s.lines} /> : null}
          </Sequence>
        );
      })}
      <AbsoluteFill style={{ backgroundColor: '#000', opacity: interpolate(frame, [0, 10], [1, 0], clamp), pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};
