// Sari kata di TENGAH (elak butang kanan TikTok & kawasan caption bawah). Perkataan semasa kuning.
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const Captions = ({ text, sec, hold }: { text: string; sec: number; hold?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(/\s+/).filter(Boolean);
  // agihan masa ikut panjang perkataan (lebih tepat dari sama rata)
  const weights = words.map((w) => 1 + w.replace(/[^\p{L}\p{N}]/gu, '').length * 0.18 + (/[.,?!…]$/.test(w) ? 1.2 : 0));
  const total = weights.reduce((a, b) => a + b, 0);
  const t = interpolate(frame, [0, sec * fps * 0.97], [0, total], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  let acc = 0;
  let cur = words.length - 1;
  for (let i = 0; i < words.length; i++) { acc += weights[i]; if (t < acc) { cur = i; break; } }
  if (frame > (hold ?? sec + 0.4) * fps) return null;
  const start = Math.floor(cur / 4) * 4;
  const chunk = words.slice(start, start + 4);
  return (
    <div style={{ position: 'absolute', left: 70, right: 170, top: 1180, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center',
      columnGap: 20, rowGap: 4, fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 66, lineHeight: 1.12, textTransform: 'uppercase',
      textAlign: 'center', WebkitTextStroke: '11px #120a0b', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.6)' }}>
      {chunk.map((w, i) => <span key={start + i} style={{ color: start + i === cur ? '#ffd64a' : '#fff8ea' }}>{w}</span>)}
    </div>
  );
};
