// Dua watak utama PLACTHINC — boneka kertas potong 2D (vektor SVG, percuma, tajam, setiap bahagian berasingan untuk animasi).
// Host lelaki: rambut hitam beralun, cermin mata segi empat hitam, hoodie gelap.
// Co-host perempuan: tudung PINK (sentiasa), blazer arang, skirt hitam panjang.
import type { ReactNode } from 'react';

export type Mouth = 'smile' | 'open' | 'o' | 'worried' | 'grin';
export type Eyes = 'open' | 'blink' | 'wide' | 'happy';
export type Brows = 'normal' | 'up' | 'worried' | 'angry';
export type Pose = {
  mouth?: Mouth; eyes?: Eyes; brows?: Brows;
  head?: number; // senget kepala (darjah)
  armL?: number; armR?: number; // lengan atas (darjah, + = ke luar/atas)
  foreL?: number; foreR?: number; // siku
};

const INK = '#141012';
const SW = 7; // garis hitam tebal
export const COLORS = {
  skin: '#f3c9a3', skinShade: '#e2a882', blush: '#f29a95',
  hair: '#1b1716', hairHi: '#3a302c',
  hoodie: '#2e2f36', hoodieDark: '#202127', string: '#efe9df',
  pants: '#1d1d22', shoe: '#2a2a2e', sole: '#efe9df',
  hijab: '#ec6fa0', hijabDark: '#cf4f84', hijabLight: '#f590b8',
  blazer: '#3b3c44', lapel: '#4a4b55', inner: '#16161a', skirt: '#17171b',
};

// Penapis kertas: bayang lapisan + tekstur gentian
export const PaperDefs = ({ id }: { id: string }) => (
  <defs>
    <filter id={`${id}-p`} x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.16 0" result="na" />
      <feComposite in="na" in2="SourceGraphic" operator="in" result="tex" />
      <feBlend in="tex" in2="SourceGraphic" mode="multiply" result="t" />
      <feDropShadow in="t" dx="3" dy="5" stdDeviation="3.5" floodColor="#000" floodOpacity="0.38" />
    </filter>
  </defs>
);

const P = ({ id, children }: { id: string; children: ReactNode }) => <g filter={`url(#${id}-p)`}>{children}</g>;
const S = { stroke: INK, strokeWidth: SW, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

// ---------------------------------------------------------------- muka (dikongsi)

export const Face = ({ pose, female = false }: { pose: Pose; female?: boolean }) => {
  const { mouth = 'smile', eyes = 'open', brows = 'normal' } = pose;
  const ey = 250;
  const eye = (cx: number) => {
    if (eyes === 'blink') return <path d={`M${cx - 16} ${ey} Q${cx} ${ey + 8} ${cx + 16} ${ey}`} fill="none" {...S} strokeWidth={6} />;
    if (eyes === 'happy') return <path d={`M${cx - 16} ${ey + 4} Q${cx} ${ey - 14} ${cx + 16} ${ey + 4}`} fill="none" {...S} strokeWidth={6} />;
    const r = eyes === 'wide' ? 17 : 14;
    return (
      <g>
        {eyes === 'wide' ? <ellipse cx={cx} cy={ey} rx={r + 6} ry={r + 8} fill="#fff" {...S} strokeWidth={4} /> : null}
        <ellipse cx={cx} cy={ey} rx={r - 2} ry={r} fill={INK} />
        <circle cx={cx + 4} cy={ey - 5} r={4.5} fill="#fff" />
        {female ? <path d={`M${cx + (cx < 200 ? -14 : 14)} ${ey - 9} l${cx < 200 ? -9 : 9} -7`} {...S} strokeWidth={4} /> : null}
      </g>
    );
  };
  const brow = (cx: number, side: number) => {
    const by = ey - 34;
    const tilt = brows === 'worried' ? -side * 7 : brows === 'angry' ? side * 8 : 0;
    const lift = brows === 'up' ? -9 : 0;
    return <path d={`M${cx - 18} ${by + lift + tilt} Q${cx} ${by - 9 + lift} ${cx + 18} ${by + lift - tilt}`} fill="none" {...S} strokeWidth={female ? 6 : 9} />;
  };
  const my = 312;
  const mouths: Record<Mouth, ReactNode> = {
    smile: <path d={`M178 ${my} Q200 ${my + 20} 222 ${my}`} fill="none" {...S} strokeWidth={6} />,
    grin: <path d={`M174 ${my - 4} Q200 ${my + 30} 226 ${my - 4} Z`} fill="#fff" {...S} strokeWidth={5} />,
    open: (
      <g>
        <path d={`M176 ${my - 6} Q200 ${my + 40} 224 ${my - 6} Q200 ${my + 2} 176 ${my - 6} Z`} fill="#7a1f2b" {...S} strokeWidth={5} />
        <path d={`M186 ${my + 16} Q200 ${my + 8} 214 ${my + 16} Q200 ${my + 26} 186 ${my + 16} Z`} fill="#e86b74" />
      </g>
    ),
    o: <ellipse cx={200} cy={my + 6} rx={11} ry={15} fill="#7a1f2b" {...S} strokeWidth={5} />,
    worried: <path d={`M182 ${my + 10} Q200 ${my - 4} 218 ${my + 10}`} fill="none" {...S} strokeWidth={6} />,
  };
  return (
    <g>
      <ellipse cx={150} cy={290} rx={17} ry={10} fill={COLORS.blush} opacity={0.75} />
      <ellipse cx={250} cy={290} rx={17} ry={10} fill={COLORS.blush} opacity={0.75} />
      {brow(162, -1)}{brow(238, 1)}
      {eye(162)}{eye(238)}
      <path d="M200 268 l-7 18 h12" fill="none" {...S} strokeWidth={4} />
      {mouths[mouth]}
    </g>
  );
};

// lengan bersendi: bahu → siku → tangan (warna lengan baju)
const Arm = ({ id, x, y, side, up, fore, sleeve, cuff }: { id: string; x: number; y: number; side: 1 | -1; up: number; fore: number; sleeve: string; cuff?: string }) => (
  <g transform={`translate(${x} ${y}) rotate(${side * up})`}>
    <P id={id}><rect x={-24} y={-10} width={48} height={120} rx={24} fill={sleeve} {...S} /></P>
    <g transform={`translate(0 104) rotate(${side * fore})`}>
      <P id={id}><rect x={-22} y={-8} width={44} height={104} rx={22} fill={sleeve} {...S} /></P>
      {cuff ? <rect x={-22} y={78} width={44} height={16} rx={6} fill={cuff} {...S} strokeWidth={4} /> : null}
      <g transform="translate(0 104)">
        <P id={id}>
          <path d="M-22 -8 h44 v26 q0 26 -22 26 q-22 0 -22 -26 Z" fill={COLORS.skin} {...S} />
          <path d={`M${side * 20} 4 q${side * 18} 6 ${side * 10} 22`} fill={COLORS.skin} {...S} strokeWidth={5} />
          <path d="M-10 26 v12 M0 28 v14 M10 26 v12" stroke={COLORS.skinShade} strokeWidth={3} strokeLinecap="round" />
        </P>
      </g>
    </g>
  </g>
);

// ---------------------------------------------------------------- host lelaki

const CURLS: [number, number, number][] = [[92,230,30],[96,186,34],[122,146,36],[160,118,38],[200,108,40],[240,116,38],[278,142,36],[304,182,34],[308,226,30]];

export const MaleHost = ({ id = 'm', pose = {}, view = '0 0 400 900' }: { id?: string; pose?: Pose; view?: string }) => {
  const { head = 0, armL = 8, armR = 8, foreL = 10, foreR = 10 } = pose;
  return (
    <svg viewBox={view} width="100%" height="100%" overflow={view === '0 0 400 900' ? 'visible' : 'hidden'}>
      <PaperDefs id={id} />
      {/* kaki */}
      <P id={id}>
        <rect x={140} y={600} width={56} height={220} rx={18} fill={COLORS.pants} {...S} />
        <rect x={204} y={600} width={56} height={220} rx={18} fill={COLORS.pants} {...S} />
      </P>
      <P id={id}>
        <path d="M126 812 h76 q10 0 10 14 v10 h-96 v-8 q0 -16 10 -16 Z" fill={COLORS.shoe} {...S} />
        <path d="M198 812 h76 q10 0 10 16 v8 h-96 v-10 q0 -14 10 -14 Z" fill={COLORS.shoe} {...S} />
        <path d="M118 836 h94 M190 836 h94" stroke={COLORS.sole} strokeWidth={6} />
      </P>
      <Arm id={id} x={118} y={430} side={1} up={armL} fore={foreL} sleeve={COLORS.hoodie} cuff={COLORS.hoodieDark} />
      {/* badan hoodie */}
      <P id={id}>
        <path d="M140 372 Q200 340 260 372 L298 430 Q306 520 292 640 L108 640 Q94 520 102 430 Z" fill={COLORS.hoodie} {...S} />
        <path d="M150 380 Q200 430 250 380 Q232 350 200 350 Q168 350 150 380 Z" fill={COLORS.hoodieDark} {...S} strokeWidth={5} />
        <path d="M140 540 h120 l14 70 h-148 Z" fill={COLORS.hoodieDark} {...S} strokeWidth={5} />
        <path d="M186 400 v70 M214 400 v70" stroke={COLORS.string} strokeWidth={6} strokeLinecap="round" />
        <circle cx={186} cy={474} r={5} fill={COLORS.string} /><circle cx={214} cy={474} r={5} fill={COLORS.string} />
      </P>
      <Arm id={id} x={282} y={430} side={-1} up={armR} fore={foreR} sleeve={COLORS.hoodie} cuff={COLORS.hoodieDark} />
      {/* kepala */}
      <g transform={`rotate(${head} 200 360)`}>
        <P id={id}><rect x={182} y={330} width={36} height={40} fill={COLORS.skinShade} {...S} strokeWidth={5} /></P>
        <P id={id}>
          <ellipse cx={92} cy={262} rx={18} ry={26} fill={COLORS.skin} {...S} />
          <ellipse cx={308} cy={262} rx={18} ry={26} fill={COLORS.skin} {...S} />
          <path d="M96 230 Q96 140 200 140 Q304 140 304 230 L300 286 Q290 352 200 356 Q110 352 100 286 Z" fill={COLORS.skin} {...S} />
        </P>
        {/* rambut hitam beralun: gulungan bertindih + isi dalam */}
        <P id={id}>
          {CURLS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={COLORS.hair} {...S} />)}
          <path d="M96 236 Q100 150 200 140 Q300 150 304 236 Q290 196 262 200 Q248 178 224 190 Q200 172 176 190 Q152 178 138 200 Q110 196 96 236 Z" fill={COLORS.hair} />
          <path d="M138 200 Q152 178 176 190 Q200 172 224 190 Q248 178 262 200" fill="none" {...S} strokeWidth={6} />
          <path d="M120 150 Q140 128 164 132 M206 122 Q232 116 252 132 M276 164 Q292 178 294 198" fill="none" stroke={COLORS.hairHi} strokeWidth={6} strokeLinecap="round" />
        </P>
        <Face pose={pose} />
        {/* cermin mata segi empat */}
        <g fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round">
          <rect x={126} y={226} width={72} height={52} rx={12} />
          <rect x={202} y={226} width={72} height={52} rx={12} />
          <path d="M198 244 h4 M126 240 h-22 M274 240 h22" />
        </g>
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- co-host perempuan (tudung pink)

export const FemaleCohost = ({ id = 'f', pose = {}, view = '0 0 400 900' }: { id?: string; pose?: Pose; view?: string }) => {
  const { head = 0, armL = 8, armR = 8, foreL = 10, foreR = 10 } = pose;
  return (
    <svg viewBox={view} width="100%" height="100%" overflow={view === '0 0 400 900' ? 'visible' : 'hidden'}>
      <PaperDefs id={id} />
      {/* kasut + skirt panjang */}
      <P id={id}>
        <path d="M150 818 h50 q8 0 8 12 v8 h-68 v-6 q0 -14 10 -14 Z" fill={COLORS.inner} {...S} />
        <path d="M200 818 h50 q10 0 10 14 v6 h-68 v-8 q0 -12 8 -12 Z" fill={COLORS.inner} {...S} />
      </P>
      <P id={id}>
        <path d="M128 590 L272 590 L300 826 L100 826 Z" fill={COLORS.skirt} {...S} />
        <path d="M168 610 L158 820 M232 610 L242 820" stroke="#2a2a30" strokeWidth={5} />
      </P>
      <Arm id={id} x={120} y={440} side={1} up={armL} fore={foreL} sleeve={COLORS.blazer} cuff={COLORS.lapel} />
      {/* blazer */}
      <P id={id}>
        <path d="M134 400 Q200 380 266 400 L296 450 Q302 540 290 620 L110 620 Q98 540 104 450 Z" fill={COLORS.blazer} {...S} />
        <path d="M176 402 L200 520 L224 402 Z" fill={COLORS.inner} {...S} strokeWidth={5} />
        <path d="M150 404 L176 402 L200 520 L170 470 Z M250 404 L224 402 L200 520 L230 470 Z" fill={COLORS.lapel} {...S} strokeWidth={5} />
        <circle cx={200} cy={548} r={7} fill={INK} /><circle cx={200} cy={584} r={7} fill={INK} />
      </P>
      <Arm id={id} x={280} y={440} side={-1} up={armR} fore={foreR} sleeve={COLORS.blazer} cuff={COLORS.lapel} />
      {/* kepala + tudung pink */}
      <g transform={`rotate(${head} 200 380)`}>
        <P id={id}>
          {/* labuh tudung di dada & bahu */}
          <path d="M96 250 Q80 360 112 420 Q150 470 200 478 Q250 470 288 420 Q320 360 304 250 Z" fill={COLORS.hijab} {...S} />
          <path d="M130 400 Q170 440 200 446 Q236 440 268 402" fill="none" stroke={COLORS.hijabDark} strokeWidth={6} strokeLinecap="round" />
          <path d="M118 360 Q150 404 196 418" fill="none" stroke={COLORS.hijabDark} strokeWidth={5} strokeLinecap="round" />
        </P>
        <P id={id}>
          <path d="M88 240 Q86 112 200 108 Q314 112 312 240 Q314 330 252 368 Q200 392 148 368 Q86 330 88 240 Z" fill={COLORS.hijab} {...S} />
          <path d="M110 170 Q140 128 200 124" fill="none" stroke={COLORS.hijabLight} strokeWidth={8} strokeLinecap="round" />
        </P>
        {/* muka dalam bukaan tudung */}
        <P id={id}>
          <path d="M122 236 Q122 168 200 166 Q278 168 278 236 L276 280 Q270 344 200 350 Q130 344 124 280 Z" fill={COLORS.skin} {...S} />
          <path d="M122 214 Q160 182 200 180 Q240 182 278 214 Q270 170 200 164 Q130 170 122 214 Z" fill={COLORS.hijabDark} {...S} strokeWidth={5} />
        </P>
        <g transform="translate(200 0) scale(0.84 1) translate(-200 0)">
          <Face pose={pose} female />
        </g>
      </g>
    </svg>
  );
};
