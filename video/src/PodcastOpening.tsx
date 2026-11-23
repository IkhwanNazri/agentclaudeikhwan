// Pembukaan podcast 2D (susun atur ikut gambar rujukan owner) guna watak dari zip PLACTHINC:
// tirai hitam, 2 lampu gantung, logo tengah, co-host kiri + host kanan di meja (mikrofon, tanglung, buku, tengkorak).
// Mulut tukar ikut dialog, tangan bergagang bergerak, kepala goyang. Tiada suara (owner rakam sendiri). Render laju (tiada WebGL).
import type { CSSProperties } from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

type Who = 'host' | 'cohost';
export type Line = { who: Who; from: number; to: number; mood?: 'talk' | 'scared' | 'happy' };
export type PodcastOpeningProps = { duration: number; lines: Line[] };

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const noise = (n: number) => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };
const src = (n: string) => staticFile(`placthinc2/${n}.png`);

const FACE: Record<Who, { idle: string; open: string; scared: string; happy: string }> = {
  host: { idle: 'mexpr0', open: 'mexpr1', scared: 'mexpr2', happy: 'mexpr4' },
  cohost: { idle: 'fexpr4', open: 'fexpr0', scared: 'fexpr5', happy: 'fexpr3' },
};

const abs = (s: CSSProperties): CSSProperties => ({ position: 'absolute', ...s });

const Lamp = ({ x, frame, seed }: { x: number; frame: number; seed: number }) => {
  const fl = noise(Math.floor(frame / 3) + seed) > 0.94 ? 0.35 : 0.9 + noise(frame + seed) * 0.1;
  const swing = Math.sin(frame * 0.04 + seed) * 1.5;
  return (
    <div style={abs({ left: x - 150, top: -40, width: 300, height: 420, transformOrigin: '150px 0', scale: '1.35', transform: `rotate(${swing}deg)` })}>
      <div style={abs({ left: 147, top: 0, width: 6, height: 150, background: '#0b0b0b' })} />
      <div style={abs({ left: -60, top: 120, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,196,106,0.55) 0%, transparent 65%)', opacity: fl })} />
      <div style={abs({ left: 40, top: 145, width: 220, height: 95, background: 'linear-gradient(#3a3532, #151312)', clipPath: 'polygon(30% 0, 70% 0, 100% 100%, 0 100%)', boxShadow: '0 0 0 3px #f4ead8' })} />
      <div style={abs({ left: 95, top: 222, width: 110, height: 34, borderRadius: '0 0 60px 60px', background: '#fff1c2', boxShadow: `0 0 ${60 * fl}px ${25 * fl}px rgba(255,190,90,${0.8 * fl})` })} />
    </div>
  );
};

const Curtains = () => (
  <>
    <AbsoluteFill style={{ background: 'repeating-linear-gradient(90deg, #120e0d 0px, #241c1a 38px, #0d0a0a 70px, #1d1715 104px, #120e0d 140px)' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(70,50,35,0.35), transparent 60%)' }} />
    {[-1, 1].map((side) => (
      <div key={side} style={abs({ top: 0, [side < 0 ? 'left' : 'right']: -40, width: 230, height: 1920,
        background: 'repeating-linear-gradient(90deg, #0a0807 0px, #1f1816 22px, #070605 44px)', borderRadius: side < 0 ? '0 0 140px 0' : '0 0 0 140px',
        boxShadow: '0 0 60px rgba(0,0,0,0.9)' })} />
    ))}
  </>
);

const HostPuppet = ({ who, cx, cy, bw, line, frame, fps, inward }: { who: Who; cx: number; cy: number; bw: number; line?: Line; frame: number; fps: number; inward: 1 | -1 }) => {
  const t = frame / fps;
  const talking = !!line && t >= line.from && t < line.to;
  const lf = talking && line ? frame - line.from * fps : frame;
  const mouthOpen = talking && Math.floor(lf / 4) % 3 !== 2 && noise(Math.floor(lf / 4) + (who === 'host' ? 3 : 9)) > 0.25;
  const f = FACE[who];
  const mood = line?.mood ?? 'talk';
  const face = talking ? (mouthOpen ? f.open : mood === 'scared' ? f.scared : f.idle) : f.idle;
  const bh = bw * (558 / (who === 'host' ? 258 : 252));
  const bob = talking ? Math.abs(Math.sin(lf * 0.28)) * 10 : Math.sin(frame * 0.07 + (who === 'host' ? 1 : 0)) * 4;
  const tilt = talking ? Math.sin(lf * 0.17) * 5 : Math.sin(frame * 0.05) * 1.5;
  const hw = bw * (who === 'host' ? 0.86 : 0.83);
  // tangan bergagang: naik & bergerak bila bercakap
  const lift = spring({ frame: talking ? lf : 0, fps, config: { damping: 12 } }) * (talking ? 1 : 0);
  const handRot = inward * (-12 + (talking ? Math.sin(lf * 0.22) * 16 : 0));
  const handY = cy + bh * 0.05 - lift * bh * 0.16;
  return (
    <>
      <div style={abs({ left: cx - bw / 2, top: cy - bh / 2 - bob, width: bw, height: bh })}>
        <Img src={src(who === 'host' ? 'male_body' : 'female_body')} style={{ width: '100%', height: '100%' }} />
      </div>
      <div style={abs({ left: cx - hw / 2, top: cy - bh * 0.31 - hw * 0.45 - bob * 1.2, width: hw, transformOrigin: '50% 85%', transform: `rotate(${tilt}deg)` })}>
        <Img src={src(face)} style={{ width: '100%' }} />
      </div>
      <div style={abs({ left: cx + inward * bw * 0.62 - bw * 0.3, top: handY, width: bw * 0.6, transformOrigin: '50% 100%', transform: `rotate(${handRot}deg) scaleX(${-inward})` })}>
        <Img src={src('hand10')} style={{ width: '100%' }} />
      </div>
    </>
  );
};

export const PodcastOpening = ({ lines }: PodcastOpeningProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cur = lines.find((l) => t >= l.from && t < l.to);
  const lineOf = (w: Who) => (cur && cur.who === w ? cur : undefined);
  // tolak kamera perlahan ke arah yang bercakap
  const target = cur ? (cur.who === 'host' ? 1 : -1) : 0;
  const ox = 540 + target * 160;
  const zoom = 1 + (cur ? 0.05 : 0) + t * 0.003;
  const intro = spring({ frame, fps, config: { damping: 14 } });
  const lanternFl = noise(Math.floor(frame / 2)) > 0.9 ? 0.5 : 0.85 + noise(frame * 3) * 0.15;
  return (
    <AbsoluteFill style={{ backgroundColor: '#050304', overflow: 'hidden' }}>
      <AbsoluteFill style={{ transformOrigin: `${ox}px 1000px`, transform: `scale(${zoom})`, transition: 'none' }}>
        <Curtains />
        <Lamp x={230} frame={frame} seed={1} />
        <Lamp x={850} frame={frame} seed={7} />
        {/* logo atas kertas koyak */}
        <div style={abs({ left: 140, top: 390 - (1 - intro) * 500, width: 800, height: 380, background: '#120d0c', clipPath: 'polygon(2% 12%, 12% 4%, 30% 9%, 48% 2%, 66% 8%, 84% 3%, 98% 12%, 95% 40%, 99% 70%, 90% 94%, 70% 88%, 50% 97%, 28% 90%, 8% 96%, 1% 70%, 4% 42%)', boxShadow: 'inset 0 0 0 4px #e9dcc6' })} />
        <Img src={src('logo')} style={abs({ left: 160, top: 360 - (1 - intro) * 500, width: 760, transform: `rotate(${Math.sin(frame * 0.05) * 1.2}deg)` })} />
        <HostPuppet who="cohost" cx={285} cy={1230} bw={470} line={lineOf('cohost')} frame={frame} fps={fps} inward={1} />
        <HostPuppet who="host" cx={795} cy={1230} bw={470} line={lineOf('host')} frame={frame} fps={fps} inward={-1} />
        {/* mikrofon */}
        <Img src={src('mic0')} style={abs({ left: 385, top: 1130, width: 140, transform: 'rotate(-8deg)' })} />
        <Img src={src('mic0')} style={abs({ left: 555, top: 1130, width: 140, transform: 'rotate(8deg) scaleX(-1)' })} />
        {/* meja kayu */}
        <div style={abs({ left: -20, top: 1500, width: 1120, height: 460, background: 'linear-gradient(#6b3f26 0%, #5a3320 8%, #3e2416 100%)', borderTop: '10px solid #8a5634', boxShadow: '0 -18px 50px rgba(0,0,0,0.7)' })} />
        <div style={abs({ left: -20, top: 1500, width: 1120, height: 460, background: 'repeating-linear-gradient(0deg, transparent 0 22px, rgba(0,0,0,0.08) 22px 24px)' })} />
        <Img src={src('books')} style={abs({ left: 20, top: 1345, width: 240 })} />
        <Img src={src('skull')} style={abs({ left: 830, top: 1330, width: 230 })} />
        <div style={abs({ left: 320, top: 1150, width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,170,64,0.6) 0%, transparent 65%)', opacity: lanternFl })} />
        <Img src={src('lantern')} style={abs({ left: 445, top: 1250, width: 190, filter: `brightness(${0.85 + lanternFl * 0.35})` })} />
      </AbsoluteFill>
      {/* habuk & vignet */}
      {Array.from({ length: 26 }, (_, j) => {
        const x = (noise(j) * 1080 + t * (8 + noise(j + 3) * 14)) % 1080;
        const y = (noise(j + 9) * 1920 - t * (10 + noise(j + 5) * 20) + 19200) % 1920;
        return <div key={j} style={abs({ left: x, top: y, width: 4 + noise(j + 1) * 5, height: 4 + noise(j + 1) * 5, borderRadius: '50%', background: '#ffd9a0', opacity: 0.12 + noise(j + 2) * 0.3 })} />;
      })}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.7) 100%)' }} />
      <AbsoluteFill style={{ backgroundColor: '#000', opacity: interpolate(frame, [0, 12], [1, 0], clamp) }} />
    </AbsoluteFill>
  );
};
