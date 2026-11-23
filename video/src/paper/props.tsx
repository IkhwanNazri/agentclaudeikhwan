// Prop gaya kertas potong (sama gaya dengan watak): lampu gantung, tanglung, mikrofon, buku, tengkorak, meja, tirai.
import type { CSSProperties, ReactNode } from 'react';
import { PaperDefs } from './characters';

const INK = '#141012';
const S = { stroke: INK, strokeWidth: 6, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };
const Svg = ({ id, w, h, vb, style, children }: { id: string; w: number; h: number; vb: string; style?: CSSProperties; children: ReactNode }) => (
  <svg viewBox={vb} width={w} height={h} style={{ position: 'absolute', overflow: 'visible', ...style }}>
    <PaperDefs id={id} />
    <g filter={`url(#${id}-p)`}>{children}</g>
  </svg>
);

export const HangLamp = ({ id, x, glow = 1, swing = 0 }: { id: string; x: number; glow?: number; swing?: number }) => (
  <div style={{ position: 'absolute', left: x - 150, top: -10, width: 300, height: 520, transformOrigin: '150px 0', transform: `rotate(${swing}deg)` }}>
    <div style={{ position: 'absolute', left: -110, top: 170, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,198,110,0.5) 0%, transparent 62%)', opacity: glow }} />
    <Svg id={id} w={300} h={300} vb="0 0 300 300">
      <path d="M150 0 V120" stroke={INK} strokeWidth={6} />
      <path d="M100 120 h100 l50 80 h-200 Z" fill="#2a2726" {...S} />
      <path d="M110 128 h80" stroke="#4a4442" strokeWidth={6} strokeLinecap="round" />
      <path d="M95 200 h110 q0 34 -55 34 q-55 0 -55 -34 Z" fill="#fff1c2" {...S} />
    </Svg>
  </div>
);

export const Lantern = ({ id, x, y, w = 170, glow = 1 }: { id: string; x: number; y: number; w?: number; glow?: number }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w, height: w * 1.5 }}>
    <div style={{ position: 'absolute', left: -w, top: -w * 0.5, width: w * 3, height: w * 3, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,166,64,0.55) 0%, transparent 60%)', opacity: glow }} />
    <Svg id={id} w={w} h={w * 1.5} vb="0 0 200 300">
      <path d="M70 40 Q100 0 130 40" fill="none" {...S} />
      <rect x={60} y={40} width={80} height={26} rx={8} fill="#3b3330" {...S} />
      <path d="M58 66 h84 l14 150 h-112 Z" fill={`rgb(255,${190 + 40 * glow},${90 + 50 * glow})`} {...S} />
      <path d="M100 120 q-18 30 0 60 q18 -30 0 -60 Z" fill="#fff6d8" opacity={0.6 + 0.4 * glow} />
      <path d="M58 66 L100 216 M142 66 L100 216" stroke="#3b3330" strokeWidth={5} />
      <rect x={36} y={216} width={128} height={30} rx={10} fill="#3b3330" {...S} />
    </Svg>
  </div>
);

export const Mic = ({ id, x, y, w = 120, flip = false }: { id: string; x: number; y: number; w?: number; flip?: boolean }) => (
  <Svg id={id} w={w} h={w * 2.6} vb="0 0 120 312" style={{ left: x, top: y, transform: flip ? 'scaleX(-1)' : undefined }}>
    <rect x={30} y={10} width={60} height={100} rx={30} fill="#2b2b30" {...S} />
    <path d="M38 40 h44 M38 60 h44 M38 80 h44" stroke="#4a4a52" strokeWidth={5} />
    <path d="M60 110 V290" stroke={INK} strokeWidth={14} />
    <path d="M60 110 V290" stroke="#3a3a40" strokeWidth={7} />
    <ellipse cx={60} cy={296} rx={46} ry={12} fill="#2b2b30" {...S} />
  </Svg>
);

export const Books = ({ id, x, y, w = 230 }: { id: string; x: number; y: number; w?: number }) => (
  <Svg id={id} w={w} h={w * 0.62} vb="0 0 230 142" style={{ left: x, top: y }}>
    <rect x={10} y={84} width={210} height={50} rx={6} fill="#6b2a26" {...S} />
    <path d="M24 98 h182" stroke="#d6a740" strokeWidth={5} />
    <rect x={24} y={38} width={180} height={48} rx={6} fill="#2f4a3a" {...S} />
    <path d="M38 52 h152" stroke="#d6a740" strokeWidth={5} />
    <rect x={18} y={88} width={8} height={42} fill="#efe2c6" />
  </Svg>
);

export const Skull = ({ id, x, y, w = 200 }: { id: string; x: number; y: number; w?: number }) => (
  <Svg id={id} w={w} h={w} vb="0 0 200 200" style={{ left: x, top: y }}>
    <path d="M30 100 Q30 20 100 20 Q170 20 170 100 Q170 132 146 142 V176 H54 V142 Q30 132 30 100 Z" fill="#efe3c8" {...S} />
    <ellipse cx={72} cy={100} rx={22} ry={24} fill={INK} />
    <ellipse cx={128} cy={100} rx={22} ry={24} fill={INK} />
    <path d="M100 124 l-10 20 h20 Z" fill={INK} />
    <path d="M70 158 V176 M90 158 V176 M110 158 V176 M130 158 V176" stroke={INK} strokeWidth={5} />
  </Svg>
);

export const Desk = ({ top }: { top: number }) => (
  <>
    <div style={{ position: 'absolute', left: -20, top, width: 1120, height: 1920 - top + 20, background: 'linear-gradient(#7a4a2c, #4a2a18)', borderTop: `8px solid ${INK}`, boxShadow: '0 -16px 40px rgba(0,0,0,0.6)' }} />
    <div style={{ position: 'absolute', left: -20, top: top + 8, width: 1120, height: 26, background: '#9a6238', borderBottom: `6px solid ${INK}` }} />
    <div style={{ position: 'absolute', left: -20, top: top + 40, width: 1120, height: 1920 - top, background: 'repeating-linear-gradient(0deg, transparent 0 26px, rgba(0,0,0,0.1) 26px 29px)' }} />
  </>
);

export const Curtains = () => (
  <>
    <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, #15100f 0px, #2a201d 40px, #100c0b 76px, #231a18 112px, #15100f 150px)' }} />
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 32%, rgba(90,62,40,0.35), transparent 60%)' }} />
    {[-1, 1].map((s) => (
      <div key={s} style={{ position: 'absolute', top: 0, [s < 0 ? 'left' : 'right']: -30, width: 210, height: 1920,
        background: 'repeating-linear-gradient(90deg, #0b0807 0px, #221a17 24px, #080605 48px)', borderRadius: s < 0 ? '0 0 160px 0' : '0 0 0 160px',
        boxShadow: `inset ${-s * 8}px 0 0 ${INK}, 0 0 50px rgba(0,0,0,0.9)` }} />
    ))}
  </>
);
