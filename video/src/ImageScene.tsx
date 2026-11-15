// Babak 2D dari satu gambar penuh (cth rujukan pembukaan owner): kamera pan/zoom antara titik fokus,
// lampu & tanglung berkelip, habuk terapung. Laju dirender (tiada WebGL). Tiada suara: owner rakam sendiri.
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// x, y = titik fokus dalam piksel gambar asal; zoom 0 = muat lebar (syot lebar), 1 = penuh tinggi bingkai
export type Shot = { at: number; x: number; y: number; zoom: number };
export type Glow = { x: number; y: number; r: number; color: string; flicker?: number };
export type ImageSceneProps = { image: string; w: number; h: number; duration: number; shots: Shot[]; glows?: Glow[]; dust?: boolean };

const ease = Easing.inOut(Easing.cubic);
const noise = (n: number) => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };

export const ImageScene = ({ image, w, h, shots, glows = [], dust = true }: ImageSceneProps) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();
  const t = frame / fps;
  // cari syot semasa & seterusnya, peralihan 0.7s
  let i = 0;
  while (i < shots.length - 1 && t >= shots[i + 1].at) i++;
  const a = shots[i];
  const b = shots[Math.min(i + 1, shots.length - 1)];
  const prev = shots[Math.max(0, i - 1)];
  const k = i === 0 ? 1 : ease(interpolate(t, [a.at, a.at + 0.7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const lerp = (p: number, q: number) => p + (q - p) * k;
  const fit = W / w;
  const full = H / h;
  const drift = (t - a.at) * 0.012; // tolak perlahan dalam syot
  const zoom = lerp(prev.zoom, a.zoom) + drift * (b === a ? 1 : 1);
  const s = fit + (full - fit) * zoom;
  const fx = lerp(prev.x, a.x);
  const fy = lerp(prev.y, a.y);
  const sw = w * s;
  const sh = h * s;
  const tx = Math.min(0, Math.max(W - sw, W / 2 - fx * s));
  const ty = sh <= H ? (H - sh) / 2 : Math.min(0, Math.max(H - sh, H / 2 - fy * s));
  const sway = Math.sin(t * 0.9) * 3;
  return (
    <AbsoluteFill style={{ backgroundColor: '#050304', overflow: 'hidden' }}>
      {/* latar kabur untuk syot lebar */}
      <Img src={staticFile(image)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(40px) brightness(0.35)', transform: 'scale(1.15)' }} />
      <div style={{ position: 'absolute', left: tx, top: ty + sway, width: sw, height: sh }}>
        <Img src={staticFile(image)} style={{ width: '100%', height: '100%', display: 'block' }} />
        {glows.map((g, j) => {
          const fl = (g.flicker ?? 0.3) * (noise(Math.floor(frame / 3) + j * 7) > 0.92 ? 1 : noise(frame + j) * 0.35);
          return (
            <div key={j} style={{ position: 'absolute', left: (g.x - g.r) * s, top: (g.y - g.r) * s, width: g.r * 2 * s, height: g.r * 2 * s, borderRadius: '50%',
              background: `radial-gradient(circle, ${g.color} 0%, transparent 70%)`, mixBlendMode: 'screen', opacity: 0.55 - fl }} />
          );
        })}
      </div>
      {dust ? Array.from({ length: 28 }, (_, j) => {
        const x = (noise(j) * W + t * (8 + noise(j + 3) * 14)) % W;
        const y = (noise(j + 9) * H - t * (10 + noise(j + 5) * 20) + H * 10) % H;
        return <div key={j} style={{ position: 'absolute', left: x, top: y, width: 4 + noise(j + 1) * 5, height: 4 + noise(j + 1) * 5, borderRadius: '50%', background: '#ffd9a0', opacity: 0.15 + noise(j + 2) * 0.35, filter: 'blur(1px)' }} />;
      }) : null}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.65) 100%)' }} />
    </AbsoluteFill>
  );
};
