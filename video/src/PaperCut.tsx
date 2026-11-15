import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { CSSProperties, ReactNode } from 'react';

// Preview gaya "paper cut-out": lapisan kertas bertekstur, tepi koyak, bayang lembut,
// gerak stop-motion (10fps) dan sedikit "boil" supaya nampak macam dibuat dengan tangan.

const STEP = 3; // 30fps / 3 = 10fps rasa stop-motion

const PAPER = {
  wall: '#f3e6cf',
  wallDark: '#e6d3b3',
  floor: '#c9a27a',
  desk: '#8a5a3b',
  skin: '#f0c19a',
  hair: '#2b2220',
  shirt: '#6fa8c9',
  pants: '#3d4a63',
  red: '#d9534f',
  cream: '#fffaf0',
  ink: '#2b2220',
  mustard: '#e8b33c',
  green: '#7fae6b',
};

const useStepFrame = () => {
  const frame = useCurrentFrame();
  return Math.floor(frame / STEP) * STEP;
};

// Goyang kecil rawak tapi tetap (deterministik) setiap langkah
const boil = (seed: number, f: number, amp = 1.2) => {
  const x = Math.sin(seed * 91.7 + f * 12.9898) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 2 * amp;
};

const Defs = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <defs>
      {/* Tekstur gentian kertas */}
      <filter id="paper" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={4} result="n" />
        <feColorMatrix type="saturate" values="0" in="n" result="g" />
        <feComponentTransfer in="g" result="g2">
          <feFuncA type="linear" slope={0.18} />
        </feComponentTransfer>
        <feComposite in="g2" in2="SourceGraphic" operator="in" result="tex" />
        <feBlend in="SourceGraphic" in2="tex" mode="multiply" />
      </filter>
      {/* Tepi koyak / potong gunting tak sempurna */}
      <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={7} result="t" />
        <feDisplacementMap in="SourceGraphic" in2="t" scale={7} xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={2} result="n" />
        <feColorMatrix type="saturate" values="0" in="n" result="g" />
        <feComponentTransfer in="g" result="g2">
          <feFuncA type="linear" slope={0.22} />
        </feComponentTransfer>
        <feComposite in="g2" in2="d" operator="in" result="tex" />
        <feBlend in="d" in2="tex" mode="multiply" />
      </filter>
    </defs>
  </svg>
);

// Satu lapisan kertas: bayang jatuh + tepi koyak
const Layer = ({ children, depth = 1, style }: { children: ReactNode; depth?: number; style?: CSSProperties }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      filter: `drop-shadow(${4 * depth}px ${7 * depth}px ${6 * depth}px rgba(60,35,15,0.35))`,
      ...style,
    }}
  >
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <g filter="url(#rough)">{children}</g>
    </svg>
  </div>
);

const Background = ({ f }: { f: number }) => (
  <Layer depth={0.4}>
    <rect x={-40} y={-40} width={1160} height={2000} fill={PAPER.wall} />
    {/* jalur kertas dinding */}
    {Array.from({ length: 7 }).map((_, i) => (
      <rect key={i} x={i * 170 - 20} y={-40} width={80} height={1400} fill={PAPER.wallDark} opacity={0.55} />
    ))}
    {/* tingkap: langit petang + bangunan KL kertas */}
    <rect x={640} y={260} width={340} height={440} fill="#f6b27a" />
    <rect x={640} y={500} width={340} height={200} fill="#e7896b" />
    <rect x={670} y={470} width={60} height={230} fill="#7a5c86" />
    <rect x={745} y={400} width={50} height={300} fill="#5f4a72" />
    <polygon points="770,330 760,400 780,400" fill="#5f4a72" />
    <rect x={810} y={440} width={70} height={260} fill="#7a5c86" />
    <rect x={895} y={500} width={60} height={200} fill="#5f4a72" />
    <circle cx={900 + boil(1, f, 1)} cy={340} r={34} fill="#fff1c9" />
    <rect x={630} y={250} width={360} height={20} fill={PAPER.cream} />
    <rect x={630} y={690} width={360} height={24} fill={PAPER.cream} />
    <rect x={800} y={260} width={14} height={440} fill={PAPER.cream} />
    {/* lantai */}
    <rect x={-40} y={1380} width={1160} height={600} fill={PAPER.floor} />
    <rect x={-40} y={1370} width={1160} height={26} fill="#a8805c" />
  </Layer>
);

const Calendar = ({ f }: { f: number }) => {
  const months = ['NOV', 'OKT', 'SEP', 'OGO', 'JUL', 'JUN', 'MEI', 'APR', 'MAC', 'FEB', 'JAN'];
  return (
    <Layer depth={1}>
      <g transform={`rotate(${-3 + boil(3, f, 0.4)} 330 560)`}>
        <rect x={150} y={330} width={360} height={430} fill={PAPER.cream} />
        <rect x={150} y={330} width={360} height={110} fill={PAPER.red} />
        <circle cx={230} cy={340} r={14} fill={PAPER.ink} />
        <circle cx={430} cy={340} r={14} fill={PAPER.ink} />
        <text x={330} y={415} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={78} fill={PAPER.cream}>
          {months[0]}
        </text>
        {Array.from({ length: 20 }).map((_, i) => (
          <rect
            key={i}
            x={180 + (i % 5) * 62}
            y={470 + Math.floor(i / 5) * 66}
            width={46}
            height={46}
            fill={i === 11 ? PAPER.mustard : '#ead9bd'}
          />
        ))}
      </g>
    </Layer>
  );
};

// Helaian kalendar berterbangan (JAN, FEB, ...) jatuh merentasi skrin
const FlyingPages = ({ f }: { f: number }) => {
  const pages = ['JAN', 'FEB', 'MAC', 'APR', 'MEI', 'JUN', 'JUL'];
  return (
    <>
      {pages.map((m, i) => {
        const start = i * 9;
        const t = Math.max(0, f - start);
        if (t <= 0) return null;
        const x = 330 + Math.sin(i * 1.7) * 120 + t * (i % 2 ? 7 : -5);
        const y = 560 + t * 22 + Math.sin(t * 0.35 + i) * 30;
        const rot = t * (i % 2 ? 9 : -7);
        if (y > 2100) return null;
        return (
          <Layer key={m} depth={1.6}>
            <g transform={`translate(${x} ${y}) rotate(${rot})`}>
              <rect x={-90} y={-60} width={180} height={120} fill={PAPER.cream} />
              <rect x={-90} y={-60} width={180} height={34} fill={PAPER.red} />
              <text x={0} y={34} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={PAPER.ink}>
                {m}
              </text>
            </g>
          </Layer>
        );
      })}
    </>
  );
};

// Watak boneka kertas bersendi (split-pin): kepala, rambut, badan, lengan, kaki
const Aina = ({ f, shock }: { f: number; shock: number }) => {
  const bob = boil(5, f, 2);
  const armRot = interpolate(shock, [0, 1], [10, -55]);
  const headTilt = interpolate(shock, [0, 1], [3, -6]) + boil(6, f, 1);
  const eye = interpolate(shock, [0, 1], [10, 19]);
  const cupTilt = interpolate(shock, [0, 1], [0, 28]);
  const pin = (x: number, y: number) => <circle cx={x} cy={y} r={7} fill="#c9b27a" stroke="#8a7a4b" strokeWidth={2} />;
  return (
    <Layer depth={1.4}>
      <g transform={`translate(560 ${1010 + bob})`}>
        {/* kaki */}
        <rect x={-70} y={330} width={58} height={250} rx={18} fill={PAPER.pants} />
        <rect x={12} y={330} width={58} height={250} rx={18} fill={PAPER.pants} />
        <ellipse cx={-48} cy={585} rx={52} ry={24} fill={PAPER.ink} />
        <ellipse cx={48} cy={585} rx={52} ry={24} fill={PAPER.ink} />
        {/* lengan belakang */}
        <g transform="rotate(14 -95 70)">
          <rect x={-125} y={60} width={56} height={230} rx={26} fill={PAPER.shirt} />
          <circle cx={-97} cy={292} r={30} fill={PAPER.skin} />
        </g>
        {/* badan */}
        <path d="M -110 40 Q 0 0 110 40 L 128 350 L -128 350 Z" fill={PAPER.shirt} />
        <path d="M -30 30 L 0 90 L 30 30 Z" fill={PAPER.cream} />
        <rect x={-6} y={90} width={12} height={160} fill="#4f8db0" />
        {/* lanyard */}
        <path d="M -40 34 L -8 200 M 40 34 L 8 200" stroke={PAPER.red} strokeWidth={8} fill="none" />
        <rect x={-30} y={196} width={60} height={78} rx={6} fill={PAPER.cream} />
        <rect x={-20} y={208} width={40} height={10} fill={PAPER.shirt} />
        {pin(-95, 70)}
        {/* lengan depan pegang kopi */}
        <g transform={`rotate(${armRot} 95 70)`}>
          <rect x={68} y={60} width={56} height={230} rx={26} fill={PAPER.shirt} />
          <circle cx={96} cy={292} r={30} fill={PAPER.skin} />
          <g transform={`translate(96 270) rotate(${cupTilt})`}>
            <path d="M -36 -70 L 36 -70 L 28 10 L -28 10 Z" fill={PAPER.cream} />
            <rect x={-36} y={-50} width={72} height={20} fill={PAPER.red} />
            <path d="M 36 -55 Q 64 -40 34 -14" stroke={PAPER.cream} strokeWidth={12} fill="none" />
            {shock > 0.5 ? <ellipse cx={46} cy={-82} rx={16} ry={10} fill="#7a4a2b" /> : null}
          </g>
        </g>
        {pin(95, 70)}
        {/* leher + kepala */}
        <rect x={-26} y={-30} width={52} height={60} fill={PAPER.skin} />
        <g transform={`rotate(${headTilt} 0 -40)`}>
          {/* rambut belakang (bob) */}
          <path d="M -150 -170 Q -160 40 -110 60 L 110 60 Q 160 40 150 -170 Q 0 -300 -150 -170 Z" fill={PAPER.hair} />
          <circle cx={0} cy={-120} r={135} fill={PAPER.skin} />
          {/* poni */}
          <path d="M -140 -150 Q -120 -270 0 -268 Q 130 -268 145 -140 Q 60 -190 -20 -170 Q -90 -160 -140 -150 Z" fill={PAPER.hair} />
          {/* mata */}
          <circle cx={-50} cy={-110} r={eye} fill={PAPER.cream} />
          <circle cx={50} cy={-110} r={eye} fill={PAPER.cream} />
          <circle cx={-50} cy={-108} r={9} fill={PAPER.ink} />
          <circle cx={50} cy={-108} r={9} fill={PAPER.ink} />
          {/* kening */}
          <rect x={-78} y={-150 - shock * 16} width={50} height={9} rx={4} fill={PAPER.hair} transform={`rotate(${-8 * shock} -53 -146)`} />
          <rect x={28} y={-150 - shock * 16} width={50} height={9} rx={4} fill={PAPER.hair} transform={`rotate(${8 * shock} 53 -146)`} />
          {/* pipi */}
          <ellipse cx={-85} cy={-60} rx={24} ry={14} fill="#ec9a8a" />
          <ellipse cx={85} cy={-60} rx={24} ry={14} fill="#ec9a8a" />
          {/* mulut: senyum → "O" terkejut */}
          {shock > 0.5 ? (
            <ellipse cx={0} cy={-45} rx={20} ry={26} fill="#7a2f2f" />
          ) : (
            <path d="M -26 -55 Q 0 -32 26 -55" stroke="#7a2f2f" strokeWidth={8} fill="none" strokeLinecap="round" />
          )}
        </g>
      </g>
    </Layer>
  );
};

const Desk = () => (
  <Layer depth={1.2}>
    <rect x={-40} y={1420} width={700} height={50} fill={PAPER.desk} />
    <rect x={20} y={1470} width={40} height={300} fill="#6e4630" />
    <rect x={540} y={1470} width={40} height={300} fill="#6e4630" />
    {/* pasu pokok */}
    <path d="M 70 1420 L 170 1420 L 155 1320 L 85 1320 Z" fill={PAPER.mustard} />
    <ellipse cx={95} cy={1270} rx={30} ry={70} fill={PAPER.green} transform="rotate(-20 95 1270)" />
    <ellipse cx={145} cy={1260} rx={30} ry={70} fill="#6b9a5a" transform="rotate(18 145 1260)" />
    <ellipse cx={120} cy={1240} rx={26} ry={78} fill={PAPER.green} />
    {/* laptop */}
    <path d="M 260 1420 L 500 1420 L 520 1436 L 240 1436 Z" fill="#9aa3ad" />
    <rect x={290} y={1250} width={180} height={170} fill="#5d6670" transform="skewX(-6)" />
  </Layer>
);

// Jalur kertas koyak untuk teks hook
const HookStrip = ({ f, appear }: { f: number; appear: number }) => {
  const scale = interpolate(appear, [0, 1], [0.6, 1]);
  return (
    <AbsoluteFill style={{ opacity: appear }}>
      <Layer depth={1.3}>
        <g transform={`translate(540 ${1700}) rotate(${-2 + boil(9, f, 0.5)}) scale(${scale})`}>
          <rect x={-470} y={-90} width={940} height={180} fill={PAPER.cream} />
          <text x={0} y={-12} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={60} fill={PAPER.ink}>
            Baru semalam Januari.
          </text>
          <text x={0} y={60} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={60} fill={PAPER.red}>
            Dah November?!
          </text>
        </g>
      </Layer>
    </AbsoluteFill>
  );
};

export const PaperCut = () => {
  const f = useStepFrame();
  const { fps } = useVideoConfig();
  const shock = interpolate(f, [fps * 1.2, fps * 1.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const appear = interpolate(f, [fps * 0.2, fps * 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Kamera: tolak masuk perlahan + parallax ringan antara lapisan
  const zoom = interpolate(f, [0, fps * 6], [1.0, 1.12]);
  const pan = (k: number) => interpolate(f, [0, fps * 6], [0, -30 * k]);
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER.wall, overflow: 'hidden' }}>
      <Defs />
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: '50% 45%' }}>
        <AbsoluteFill style={{ transform: `translateX(${pan(0.4)}px)` }}>
          <Background f={f} />
        </AbsoluteFill>
        <AbsoluteFill style={{ transform: `translateX(${pan(0.7)}px)` }}>
          <Calendar f={f} />
        </AbsoluteFill>
        <AbsoluteFill style={{ transform: `translateX(${pan(1)}px)` }}>
          <Desk />
          <Aina f={f} shock={shock} />
        </AbsoluteFill>
        <FlyingPages f={Math.max(0, f / STEP - 12)} />
      </AbsoluteFill>
      {/* vignette hangat */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(70,40,15,0.35) 100%)' }} />
      <HookStrip f={f} appear={appear} />
    </AbsoluteFill>
  );
};
