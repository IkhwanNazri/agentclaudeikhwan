// Preview "teater boneka kertas 3D": pentas bertirai, tangan dalang angkat kad tajuk,
// tirai terbuka, kemudian watak kertas (Aina) digerakkan dengan batang oleh tangan.
import { useMemo, type ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

const STEP = 2; // 15fps: rasa buatan tangan / stop-motion
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const C = {
  cream: '#f6ecd8',
  card: '#efe2c6',
  edge: '#fff8ea',
  red: '#b3262e',
  redDark: '#7d1520',
  gold: '#d6a740',
  wood: '#6b3f26',
  woodDark: '#4a2a18',
  skin: '#f1c39c',
  hand: '#e9b48d',
  hair: '#2a201e',
  shirt: '#6ea6c8',
  pants: '#3c4862',
  ink: '#2a201e',
  wall: '#e9d2a8',
  sky: '#f5a96f',
  bldg: '#6d5482',
  green: '#78a866',
  mustard: '#e3ae38',
};

// ---------------------------------------------------------------- tekstur

const usePaperTexture = () =>
  useMemo(() => {
    const size = 256;
    const cv = document.createElement('canvas');
    cv.width = size;
    cv.height = size;
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 9000; i++) {
      const v = 215 + Math.floor(rnd() * 40);
      ctx.fillStyle = `rgb(${v},${v},${v - 6})`;
      ctx.fillRect(rnd() * size, rnd() * size, 1 + rnd() * 2, 1);
    }
    // gentian kertas
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 120; i++) {
      ctx.strokeStyle = '#8a7a60';
      ctx.beginPath();
      const x = rnd() * size;
      const y = rnd() * size;
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + rnd() * 20, y + rnd() * 6, x + 10 + rnd() * 30, y + rnd() * 8);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

const useTextTexture = (lines: { text: string; color: string; size: number }[], w = 1024, h = 640) =>
  useMemo(() => {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext('2d')!;
    ctx.clearRect(0, 0, w, h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const total = lines.reduce((a, l) => a + l.size * 1.15, 0);
    let y = h / 2 - total / 2;
    for (const l of lines) {
      y += (l.size * 1.15) / 2;
      ctx.font = `900 ${l.size}px Poppins, "Arial Black", sans-serif`;
      ctx.fillStyle = l.color;
      ctx.fillText(l.text, w / 2, y);
      y += (l.size * 1.15) / 2;
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [lines, w, h]);

// ---------------------------------------------------------------- kepingan kertas

type ShapeFn = () => THREE.Shape;

const rect = (w: number, h: number, r = 0.04): ShapeFn => () => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  if (r <= 0.001) {
    // tanpa bucu bulat: elak titik bertindih yang rosakkan triangulasi
    s.moveTo(x, y);
    s.lineTo(x + w, y);
    s.lineTo(x + w, y + h);
    s.lineTo(x, y + h);
    s.closePath();
    return s;
  }
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
};

const circle = (r: number): ShapeFn => () => {
  const s = new THREE.Shape();
  s.absarc(0, 0, r, 0, Math.PI * 2, false);
  return s;
};

const poly = (pts: [number, number][]): ShapeFn => () => {
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)));
  s.closePath();
  return s;
};

// Kepingan kertas tebal (kad manila): muka berwarna + tepi potongan krim
const Paper = ({
  shape,
  color,
  depth = 0.035,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  tex,
  cast = true,
}: {
  cast?: boolean;
  shape: ShapeFn;
  color: string;
  depth?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  tex: THREE.Texture;
}) => {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape(), { depth, bevelEnabled: false, curveSegments: 24 });
    g.translate(0, 0, -depth / 2);
    return g;
  }, [shape, depth]);
  const mats = useMemo(() => {
    const t = tex.clone();
    t.repeat.set(1.3, 1.3);
    t.needsUpdate = true;
    return [
      new THREE.MeshStandardMaterial({ color, map: t, roughness: 0.92 }),
      new THREE.MeshStandardMaterial({ color: C.edge, roughness: 1 }),
    ];
  }, [color, tex]);
  return <mesh geometry={geo} material={mats} position={position} rotation={rotation} castShadow={cast} receiveShadow />;
};

// ---------------------------------------------------------------- tangan dalang

// Tangan manusia (stylised) menggenggam batang menegak di asal (0,0,0); lengan turun ke bawah.
const Hand = ({ side = 1 }: { side?: 1 | -1 }) => {
  const skin = <meshStandardMaterial color={C.hand} roughness={0.55} />;
  return (
    <group>
      {/* lengan bawah turun ke belakang papan */}
      <mesh position={[0.1 * side, -1.45, -0.18]} rotation={[-0.06, 0, -0.1 * side]} castShadow>
        <capsuleGeometry args={[0.24, 2.2, 8, 16]} />
        {skin}
      </mesh>
      <mesh position={[0.26 * side, -2.9, -0.25]} rotation={[-0.06, 0, -0.1 * side]}>
        <cylinderGeometry args={[0.36, 0.4, 1.4, 20]} />
        <meshStandardMaterial color="#2c2c34" roughness={0.9} />
      </mesh>
      {/* tapak & belakang tangan (di belakang batang) */}
      <mesh position={[0.06 * side, -0.05, -0.12]} scale={[1, 1.25, 0.6]} castShadow>
        <sphereGeometry args={[0.27, 20, 16]} />
        {skin}
      </mesh>
      {/* 4 jari melingkar di depan batang: barisan buku lali */}
      {[0.2, 0.06, -0.08, -0.22].map((y, i) => (
        <group key={i} position={[-0.02 * side, y, 0.07]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <capsuleGeometry args={[0.072, 0.26 - i * 0.02, 6, 12]} />
            {skin}
          </mesh>
          {/* garis lipatan jari */}
          <mesh position={[0.02 * side, -0.065, 0.02]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.012, 0.18, 4, 8]} />
            <meshStandardMaterial color="#c98e6c" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {/* ibu jari melintang di atas */}
      <mesh position={[0.02 * side, 0.32, 0.1]} rotation={[0, 0, 1.25 * side]} castShadow>
        <capsuleGeometry args={[0.07, 0.24, 6, 12]} />
        {skin}
      </mesh>
    </group>
  );
};

const Rod = ({ length }: { length: number }) => (
  <mesh position={[0, -length / 2, 0]} castShadow>
    <cylinderGeometry args={[0.035, 0.035, length, 10]} />
    <meshStandardMaterial color="#c9a26b" roughness={0.7} />
  </mesh>
);

// ---------------------------------------------------------------- pentas

const Curtain = ({ side, open, tex }: { side: 1 | -1; open: number; tex: THREE.Texture }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(3.2, 8, 90, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      p.setZ(i, Math.sin(x * 9) * 0.1 + Math.sin(x * 23) * 0.025);
    }
    g.computeVertexNormals();
    g.translate(-1.6 * side, 0, 0); // tepi luar di x=0 → skala dari luar
    return g;
  }, [side]);
  const mat = useMemo(() => {
    const t = tex.clone();
    t.repeat.set(3, 6);
    t.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ color: C.red, map: t, roughness: 0.75, side: THREE.DoubleSide });
  }, [tex]);
  const sx = interpolate(open, [0, 1], [1, 0.26]);
  return (
    <group position={[3.2 * side, 1.25, 0.55]} scale={[sx, 1, 1]}>
      <mesh geometry={geo} material={mat} receiveShadow />
    </group>
  );
};

const Stage = ({ tex, open }: { tex: THREE.Texture; open: number }) => {
  const footlights = Array.from({ length: 9 }, (_, i) => -2.8 + i * 0.7);
  return (
    <group>
      {/* dinding gelap teater */}
      <mesh position={[0, 0, -4]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1c0f12" roughness={1} />
      </mesh>
      {/* bingkai proscenium kadbod emas */}
      <Paper cast={false} tex={tex} shape={rect(0.7, 8.6, 0.05)} color={C.gold} depth={0.25} position={[-3.05, 1.1, 0.9]} />
      <Paper cast={false} tex={tex} shape={rect(0.7, 8.6, 0.05)} color={C.gold} depth={0.25} position={[3.05, 1.1, 0.9]} />
      <Paper cast={false} tex={tex} shape={rect(6.8, 1.0, 0.05)} color={C.gold} depth={0.25} position={[0, 5.0, 0.9]} />
      {/* valance tirai atas */}
      <Paper cast={false} tex={tex} shape={poly([[-2.8, 0.4], [2.8, 0.4], [2.8, -0.2], [2.1, -0.55], [1.4, -0.2], [0.7, -0.55], [0, -0.2], [-0.7, -0.55], [-1.4, -0.2], [-2.1, -0.55], [-2.8, -0.2]])}
        color={C.redDark} depth={0.12} position={[0, 4.25, 0.75]} />
      <Curtain side={-1} open={open} tex={tex} />
      <Curtain side={1} open={open} tex={tex} />
      {/* papan depan (playboard) kayu, dalang sembunyi di belakang */}
      <Paper cast={false} tex={tex} shape={rect(7.2, 2.6, 0.06)} color={C.wood} depth={0.3} position={[0, -3.45, 1.25]} />
      <Paper cast={false} tex={tex} shape={rect(7.4, 0.22, 0.04)} color={C.gold} depth={0.36} position={[0, -2.17, 1.25]} />
      <Paper cast={false} tex={tex} shape={rect(5.6, 1.4, 0.3)} color={C.woodDark} depth={0.05} position={[0, -3.5, 1.42]} />
      {/* lampu kaki pentas */}
      {footlights.map((x) => (
        <mesh key={x} position={[x, -2.0, 1.32]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <meshStandardMaterial color="#fff2c4" emissive="#ffd27a" emissiveIntensity={2.5} />
        </mesh>
      ))}
    </group>
  );
};

// Set di belakang tirai: dinding pejabat kertas, tingkap KL, kalendar
const StorySet = ({ tex, f }: { tex: THREE.Texture; f: number }) => (
  <group>
    <Paper tex={tex} shape={rect(6.2, 7.6, 0)} color={C.wall} depth={0.05} position={[0, 1.4, -2.2]} />
    {/* tingkap */}
    <Paper tex={tex} shape={rect(2.2, 2.6, 0.03)} color={C.sky} position={[1.4, 2.4, -2.1]} />
    <Paper tex={tex} shape={poly([[-0.9, -1.2], [-0.9, 0.1], [-0.5, 0.1], [-0.5, 0.6], [-0.15, 0.6], [-0.15, -0.2], [0.25, -0.2], [0.25, 0.9], [0.32, 1.2], [0.39, 0.9], [0.39, -0.1], [0.9, -0.1], [0.9, -1.2]])}
      color={C.bldg} position={[1.4, 2.3, -2.04]} />
    <Paper tex={tex} shape={circle(0.25)} color="#fff0c4" position={[2.05, 3.25, -2.05]} />
    <Paper tex={tex} shape={rect(2.4, 0.14, 0)} color={C.cream} position={[1.4, 1.1, -2.0]} />
    {/* kalendar dinding */}
    <group position={[-1.5, 2.6, -2.05]} rotation={[0, 0, -0.06]}>
      <Paper tex={tex} shape={rect(1.7, 2.0, 0.04)} color={C.cream} />
      <Paper tex={tex} shape={rect(1.7, 0.5, 0.04)} color={C.red} position={[0, 0.75, 0.03]} />
      <CalendarLabel f={f} />
      {Array.from({ length: 12 }, (_, i) => (
        <Paper key={i} tex={tex} shape={rect(0.26, 0.26, 0.02)} color={i === 7 ? C.mustard : '#e2cfae'} depth={0.015}
          position={[-0.5 + (i % 4) * 0.34, 0.15 - Math.floor(i / 4) * 0.34, 0.03]} />
      ))}
    </group>
    {/* meja kertas berdiri */}
    <Paper tex={tex} shape={rect(2.6, 0.18, 0.02)} color={C.wood} position={[-1.4, -0.9, -1.2]} />
    <Paper tex={tex} shape={rect(0.14, 1.2, 0)} color={C.woodDark} position={[-2.5, -1.6, -1.25]} />
    <Paper tex={tex} shape={rect(0.14, 1.2, 0)} color={C.woodDark} position={[-0.3, -1.6, -1.25]} />
    <Paper tex={tex} shape={poly([[-0.45, 0], [0.45, 0], [0.38, 0.62], [-0.38, 0.62]])} color="#5d6670" position={[-1.1, -0.8, -1.15]} />
    {/* pasu pokok */}
    <Paper tex={tex} shape={poly([[-0.22, 0], [0.22, 0], [0.18, 0.4], [-0.18, 0.4]])} color={C.mustard} position={[-2.2, -0.8, -1.15]} />
    <Paper tex={tex} shape={() => { const s = new THREE.Shape(); s.absellipse(0, 0, 0.16, 0.42, 0, Math.PI * 2, false, 0); return s; }}
      color={C.green} position={[-2.2, -0.05, -1.17]} />
  </group>
);

const CalendarLabel = ({ f }: { f: number }) => {
  const months = ['JAN', 'FEB', 'MAC', 'APR', 'MEI', 'JUN', 'JUL', 'OGO', 'SEP', 'OKT', 'NOV'];
  const idx = Math.min(months.length - 1, Math.max(0, Math.floor((f - 200) / 5)));
  const tex = useTextTexture(useMemo(() => [{ text: months[idx], color: '#fff8ea', size: 300 }], [idx]), 1024, 420);
  return (
    <mesh position={[0, 0.75, 0.06]}>
      <planeGeometry args={[1.5, 0.6]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
};

// ---------------------------------------------------------------- boneka

const TitleCard = ({ tex }: { tex: THREE.Texture }) => {
  const text = useTextTexture(
    useMemo(
      () => [
        { text: 'KENAPA MASA', color: C.ink, size: 128 },
        { text: 'CEPAT JE', color: C.red, size: 150 },
        { text: 'BERJALAN?', color: C.ink, size: 128 },
      ],
      [],
    ),
  );
  return (
    <group>
      <Paper tex={tex} shape={rect(4.0, 2.6, 0.18)} color={C.card} depth={0.06} />
      <Paper tex={tex} shape={rect(3.75, 2.35, 0.14)} color="#fbf4e4" depth={0.02} position={[0, 0, 0.04]} />
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[3.7, 2.3]} />
        <meshStandardMaterial map={text} transparent roughness={0.9} />
      </mesh>
    </group>
  );
};

const Clock = ({ tex, f }: { tex: THREE.Texture; f: number }) => (
  <group>
    <Paper tex={tex} shape={circle(0.62)} color={C.red} depth={0.06} />
    <Paper tex={tex} shape={circle(0.52)} color={C.cream} depth={0.02} position={[0, 0, 0.04]} />
    <group position={[0, 0, 0.07]} rotation={[0, 0, -f * 0.45]}>
      <Paper tex={tex} shape={rect(0.06, 0.42, 0.02)} color={C.ink} depth={0.015} position={[0, 0.19, 0]} />
    </group>
    <group position={[0, 0, 0.085]} rotation={[0, 0, -f * 0.06]}>
      <Paper tex={tex} shape={rect(0.08, 0.3, 0.02)} color={C.ink} depth={0.015} position={[0, 0.13, 0]} />
    </group>
  </group>
);

// Aina: boneka kertas bersendi (pin split), digerakkan dengan batang dari bawah
const Aina = ({ tex, f, walk }: { tex: THREE.Texture; f: number; walk: number }) => {
  const swing = Math.sin(f * 0.5) * 0.45 * walk;
  const legSwing = Math.sin(f * 0.5) * 0.3 * walk;
  const pin = (x: number, y: number, z: number) => (
    <mesh position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.045, 0.045, 0.02, 12]} />
      <meshStandardMaterial color="#c8a54a" metalness={0.6} roughness={0.35} />
    </mesh>
  );
  return (
    <group>
      {/* kaki */}
      <group position={[-0.17, -0.55, -0.03]} rotation={[0, 0, legSwing]}>
        <Paper tex={tex} shape={rect(0.24, 0.95, 0.1)} color={C.pants} position={[0, -0.42, 0]} />
        <Paper tex={tex} shape={rect(0.34, 0.14, 0.06)} color={C.ink} position={[0.05, -0.9, 0.01]} />
      </group>
      <group position={[0.17, -0.55, -0.03]} rotation={[0, 0, -legSwing]}>
        <Paper tex={tex} shape={rect(0.24, 0.95, 0.1)} color={C.pants} position={[0, -0.42, 0]} />
        <Paper tex={tex} shape={rect(0.34, 0.14, 0.06)} color={C.ink} position={[0.05, -0.9, 0.01]} />
      </group>
      {/* lengan belakang */}
      <group position={[-0.42, 0.45, -0.04]} rotation={[0, 0, -swing]}>
        <Paper tex={tex} shape={rect(0.22, 0.85, 0.1)} color={C.shirt} position={[0, -0.38, 0]} />
        <Paper tex={tex} shape={circle(0.12)} color={C.skin} position={[0, -0.82, 0.01]} />
      </group>
      {pin(-0.42, 0.45, 0.03)}
      {/* badan */}
      <Paper tex={tex} shape={poly([[-0.45, 0.6], [0.45, 0.6], [0.52, -0.6], [-0.52, -0.6]])} color={C.shirt} />
      <Paper tex={tex} shape={poly([[-0.14, 0.6], [0.14, 0.6], [0, 0.34]])} color={C.cream} position={[0, 0, 0.03]} />
      <Paper tex={tex} shape={poly([[-0.2, 0.58], [-0.16, 0.58], [-0.02, -0.1], [-0.06, -0.1]])} color={C.red} position={[0, 0, 0.035]} />
      <Paper tex={tex} shape={poly([[0.2, 0.58], [0.16, 0.58], [0.02, -0.1], [0.06, -0.1]])} color={C.red} position={[0, 0, 0.035]} />
      <Paper tex={tex} shape={rect(0.26, 0.32, 0.03)} color={C.cream} position={[0, -0.24, 0.045]} />
      {/* lengan depan */}
      <group position={[0.42, 0.45, 0.05]} rotation={[0, 0, swing]}>
        <Paper tex={tex} shape={rect(0.22, 0.85, 0.1)} color={C.shirt} position={[0, -0.38, 0]} />
        <Paper tex={tex} shape={circle(0.12)} color={C.skin} position={[0, -0.82, 0.01]} />
      </group>
      {pin(0.42, 0.45, 0.08)}
      {/* kepala */}
      <group position={[0, 1.2, 0.02]} rotation={[0, 0, Math.sin(f * 0.25) * 0.06]}>
        <Paper tex={tex} shape={() => { const s = new THREE.Shape(); s.absarc(0, 0.08, 0.66, 0, Math.PI, false); s.lineTo(-0.66, -0.55); s.lineTo(0.66, -0.55); s.closePath(); return s; }}
          color={C.hair} position={[0, 0, -0.04]} />
        <Paper tex={tex} shape={circle(0.55)} color={C.skin} />
        <Paper tex={tex} shape={() => { const s = new THREE.Shape(); s.moveTo(-0.6, 0.12); s.quadraticCurveTo(-0.5, 0.72, 0, 0.7); s.quadraticCurveTo(0.55, 0.7, 0.62, 0.15); s.quadraticCurveTo(0.2, 0.36, -0.1, 0.3); s.quadraticCurveTo(-0.4, 0.26, -0.6, 0.12); return s; }}
          color={C.hair} position={[0, 0, 0.03]} />
        <Paper tex={tex} shape={circle(0.075)} color={C.ink} depth={0.02} position={[-0.2, -0.02, 0.04]} />
        <Paper tex={tex} shape={circle(0.075)} color={C.ink} depth={0.02} position={[0.2, -0.02, 0.04]} />
        <Paper tex={tex} shape={circle(0.025)} color="#ffffff" depth={0.02} position={[-0.18, 0.01, 0.055]} />
        <Paper tex={tex} shape={circle(0.025)} color="#ffffff" depth={0.02} position={[0.22, 0.01, 0.055]} />
        <Paper tex={tex} shape={() => { const s = new THREE.Shape(); s.absellipse(0, 0, 0.1, 0.06, 0, Math.PI * 2, false, 0); return s; }} color="#ec9686" depth={0.015} position={[-0.34, -0.2, 0.04]} />
        <Paper tex={tex} shape={() => { const s = new THREE.Shape(); s.absellipse(0, 0, 0.1, 0.06, 0, Math.PI * 2, false, 0); return s; }} color="#ec9686" depth={0.015} position={[0.34, -0.2, 0.04]} />
        <Paper tex={tex} shape={() => { const s = new THREE.Shape(); s.absarc(0, -0.2, 0.12, Math.PI, 0, false); s.closePath(); return s; }} color="#8a2f2f" depth={0.015} position={[0, 0, 0.045]} />
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- kamera

const Rig = ({ f }: { f: number }) => {
  const { camera } = useThree();
  const { fps } = useVideoConfig();
  const z = interpolate(f, [0, fps * 4, fps * 10], [14.5, 13.6, 12.4], clamp);
  const x = Math.sin(f * 0.02) * 0.15;
  camera.position.set(x, 0.6, z);
  camera.lookAt(0, 0.4, 0);
  return null;
};

// ---------------------------------------------------------------- komposisi

// Boneka + batang + tangan dalang. Tangan di hujung batang (y = -rod), lengan turun
// ke belakang papan depan (z kekal di belakang playboard).
const Puppeteer = ({ children, rod, x, y, z, tilt = 0 }: { children: ReactNode; rod: number; x: number; y: number; z: number; tilt?: number }) => (
  <group position={[x, y, z]} rotation={[0, 0, tilt]}>
    {children}
    <group position={[0, -0.1, -0.06]}>
      <Rod length={rod + 0.25} />
    </group>
    <group position={[0, -rod, -0.12]} scale={1.35}>
      <Hand />
    </group>
  </group>
);

const Scene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.floor(frame / STEP) * STEP;
  const tex = usePaperTexture();

  // 0-4s: kad tajuk naik, goyang; 4-4.7s turun
  const up = spring({ frame: f - 12, fps, config: { damping: 11, mass: 0.8 } });
  const down = interpolate(f, [fps * 4, fps * 4.7], [0, 1], clamp);
  const cardY = interpolate(up, [0, 1], [-6.5, 1.0]) - down * 7.5;
  const cardTilt = Math.sin(f * 0.18) * 0.06 * up;
  // tirai buka 4.5s-6s
  const open = interpolate(f, [fps * 4.5, fps * 6], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  // Aina naik dari bawah 6s, berjalan kiri → kanan
  const ainaUp = spring({ frame: f - fps * 6, fps, config: { damping: 12 } });
  const walk = interpolate(f, [fps * 6.6, fps * 7], [0, 1], clamp);
  const ainaX = interpolate(f, [fps * 6, fps * 10], [-1.8, 1.4], clamp);
  const hop = Math.abs(Math.sin(f * 0.25)) * 0.18 * walk;
  const ainaY = interpolate(ainaUp, [0, 1], [-6, -0.1]) + hop;

  return (
    <>
      <Rig f={f} />
      <color attach="background" args={['#120a0c']} />
      <ambientLight intensity={0.35} color="#ffe2c4" />
      <hemisphereLight args={['#ffe8cc', '#2a1214', 0.5]} />
      <directionalLight position={[0.8, 3.5, 12]} intensity={1.5} color="#ffd6a8" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={7} shadow-camera-bottom={-6} shadow-bias={-0.0005} />
      <spotLight position={[0, 7, 10]} angle={0.4} penumbra={0.6} intensity={260} decay={2} color="#fff0d6" castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024} target-position={[0, 0.5, 0]} />
      <pointLight position={[0, -1.6, 2.2]} intensity={6} distance={6} color="#ffc070" />

      <StorySet tex={tex} f={f} />
      <Stage tex={tex} open={open} />

      {/* kad tajuk + jam di tangan dalang (depan tirai) */}
      {cardY > -9 ? (
        <Puppeteer rod={2.5} x={0} y={cardY} z={0.95} tilt={cardTilt}>
          <TitleCard tex={tex} />
          <group position={[1.6, 1.45, 0.08]} rotation={[0, 0, 0.2]}>
            <Clock tex={tex} f={f} />
          </group>
        </Puppeteer>
      ) : null}

      {/* Aina digerakkan dengan batang */}
      {f > fps * 5.8 ? (
        <Puppeteer rod={1.95} x={ainaX} y={ainaY} z={-0.4} tilt={Math.sin(f * 0.25) * 0.05 * walk}>
          <Aina tex={tex} f={f} walk={walk} />
        </Puppeteer>
      ) : null}
    </>
  );
};

export const PuppetStage = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: '#120a0c' }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        gl={{ antialias: true }}
        camera={{ fov: 40, near: 0.1, far: 60 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Scene />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, transparent 50%, rgba(10,4,4,0.6) 100%)', pointerEvents: 'none' }} />
    </AbsoluteFill>
  );
};
