// Kit teater boneka kertas 3D: tekstur, kepingan kertas, tangan dalang, boneka, pentas.
import { useMemo, type ReactNode } from 'react';
import { interpolate } from 'remotion';
import * as THREE from 'three';

export const C = {
  cream: '#f6ecd8',
  card: '#efe2c6',
  edge: '#fff8ea',
  red: '#b3262e',
  redDark: '#7d1520',
  gold: '#d6a740',
  wood: '#6b3f26',
  woodDark: '#4a2a18',
  skin: '#f1c39c',
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

let paperTex: THREE.Texture | null = null;
export const paperTexture = () => {
  if (paperTex) return paperTex;
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
  tex.repeat.set(1.3, 1.3);
  tex.colorSpace = THREE.SRGBColorSpace;
  paperTex = tex;
  return tex;
};

type TextLine = { text: string; color: string; size: number };
const textCache = new Map<string, THREE.Texture>();
export const textTexture = (lines: TextLine[], w = 1024, h = 640) => {
  const key = JSON.stringify([lines, w, h]);
  const hit = textCache.get(key);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d')!;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const total = lines.reduce((a, l) => a + l.size * 1.15, 0);
  let y = h / 2 - total / 2;
  for (const l of lines) {
    y += (l.size * 1.15) / 2;
    let size = l.size;
    ctx.font = `800 ${size}px Poppins, "Arial Black", sans-serif`;
    const tw = ctx.measureText(l.text).width;
    if (tw > w * 0.92) {
      size = Math.floor((size * w * 0.92) / tw);
      ctx.font = `800 ${size}px Poppins, "Arial Black", sans-serif`;
    }
    ctx.fillStyle = l.color;
    ctx.fillText(l.text, w / 2, y);
    y += (l.size * 1.15) / 2;
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  textCache.set(key, tex);
  return tex;
};

// ---------------------------------------------------------------- bentuk (dicache supaya geometri tak dibina semula setiap frame)

export type ShapeFn = () => THREE.Shape;
const shapeCache = new Map<string, ShapeFn>();
const cached = (key: string, make: ShapeFn): ShapeFn => {
  const hit = shapeCache.get(key);
  if (hit) return hit;
  shapeCache.set(key, make);
  return make;
};

export const rect = (w: number, h: number, r = 0.04): ShapeFn =>
  cached(`rect:${w}:${h}:${r}`, () => {
    const s = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    if (r <= 0.001) {
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
  });

export const circle = (r: number): ShapeFn =>
  cached(`circle:${r}`, () => {
    const s = new THREE.Shape();
    s.absarc(0, 0, r, 0, Math.PI * 2, false);
    return s;
  });

export const ellipse = (rx: number, ry: number): ShapeFn =>
  cached(`ellipse:${rx}:${ry}`, () => {
    const s = new THREE.Shape();
    s.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
    return s;
  });

export const poly = (pts: [number, number][]): ShapeFn =>
  cached(`poly:${JSON.stringify(pts)}`, () => {
    const s = new THREE.Shape();
    pts.forEach(([x, y], i) => (i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)));
    s.closePath();
    return s;
  });

// Hirisan pai (sudut 0..1 daripada bulatan penuh)
export const pie = (r: number, frac: number): ShapeFn => {
  const f = Math.round(frac * 200) / 200;
  return cached(`pie:${r}:${f}`, () => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.absarc(0, 0, r, Math.PI / 2, Math.PI / 2 - Math.PI * 2 * Math.max(0.01, f), true);
    s.closePath();
    return s;
  });
};

export const custom = (key: string, make: ShapeFn): ShapeFn => cached(`custom:${key}`, make);

// ---------------------------------------------------------------- kepingan kertas

const matCache = new Map<string, THREE.Material[]>();
const paperMats = (color: string, emissive?: string) => {
  const key = `${color}:${emissive ?? ''}`;
  const hit = matCache.get(key);
  if (hit) return hit;
  const m = [
    new THREE.MeshStandardMaterial({
      color,
      map: paperTexture(),
      roughness: 0.92,
      emissive: emissive ?? '#000000',
      emissiveIntensity: emissive ? 1.4 : 0,
    }),
    new THREE.MeshStandardMaterial({ color: C.edge, roughness: 1 }),
  ];
  matCache.set(key, m);
  return m;
};

const geoCache = new Map<string, THREE.ExtrudeGeometry>();
const paperGeo = (shape: ShapeFn, depth: number) => {
  const key = `${shapeKeyOf(shape)}:${depth}`;
  const hit = geoCache.get(key);
  if (hit) return hit;
  const g = new THREE.ExtrudeGeometry(shape(), { depth, bevelEnabled: false, curveSegments: 24 });
  g.translate(0, 0, -depth / 2);
  geoCache.set(key, g);
  return g;
};
const shapeKeys = new WeakMap<ShapeFn, string>();
let shapeId = 0;
const shapeKeyOf = (fn: ShapeFn) => {
  let k = shapeKeys.get(fn);
  if (!k) {
    k = `s${shapeId++}`;
    shapeKeys.set(fn, k);
  }
  return k;
};

type V3 = [number, number, number];

export const Paper = ({
  shape,
  color,
  depth = 0.035,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  cast = true,
  glow,
}: {
  shape: ShapeFn;
  color: string;
  depth?: number;
  position?: V3;
  rotation?: V3;
  cast?: boolean;
  glow?: string;
}) => (
  <mesh geometry={paperGeo(shape, depth)} material={paperMats(color, glow)} position={position} rotation={rotation} castShadow={cast} receiveShadow />
);

// Plane teks atas kad
export const TextPlane = ({ lines, w, h, position = [0, 0, 0], pxW = 1024, pxH = 640 }: { lines: TextLine[]; w: number; h: number; position?: V3; pxW?: number; pxH?: number }) => (
  <mesh position={position}>
    <planeGeometry args={[w, h]} />
    <meshStandardMaterial map={textTexture(lines, pxW, pxH)} transparent roughness={0.9} />
  </mesh>
);

// ---------------------------------------------------------------- tangan dalang (lebih realistik)

const skinMat = new THREE.MeshPhysicalMaterial({ color: '#e2a47c', roughness: 0.5, sheen: 0.5, sheenColor: new THREE.Color('#ffd2b8'), sheenRoughness: 0.6 });
const skinDark = new THREE.MeshStandardMaterial({ color: '#b97a58', roughness: 0.7 });
const knuckleMat = new THREE.MeshPhysicalMaterial({ color: '#d9977a', roughness: 0.55, sheen: 0.4, sheenColor: new THREE.Color('#ffd2b8') });
const nailMat = new THREE.MeshPhysicalMaterial({ color: '#f1c6b6', roughness: 0.25, clearcoat: 0.6 });
const sleeveMat = new THREE.MeshStandardMaterial({ color: '#23232b', roughness: 0.95 });
const up = new THREE.Vector3(0, 1, 0);

// Kapsul antara dua titik (ruas jari)
const Seg = ({ a, b, r, mat = skinMat }: { a: V3; b: V3; r: number; mat?: THREE.Material }) => {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const len = Math.max(0.001, va.distanceTo(vb));
  const q = new THREE.Quaternion().setFromUnitVectors(up, vb.clone().sub(va).normalize());
  return (
    <mesh position={mid} quaternion={q} material={mat} castShadow>
      <capsuleGeometry args={[r, len, 6, 14]} />
    </mesh>
  );
};

// Genggaman tangan kanan pada batang menegak di (0,0,0). Belakang tangan ke kiri,
// jari melingkar ke depan (ke arah kamera), ibu jari melintang di atas.
export const Hand = () => {
  const fingers = [
    { y: 0.18, r: 0.06 },
    { y: 0.06, r: 0.064 },
    { y: -0.06, r: 0.061 },
    { y: -0.17, r: 0.052 },
  ];
  return (
    <group>
      {/* lengan bawah meruncing ke pergelangan */}
      <mesh position={[-0.15, -1.2, -0.09]} rotation={[0, 0, 0.07]} scale={[1, 1, 0.8]} material={skinMat} castShadow>
        <capsuleGeometry args={[0.18, 1.85, 10, 24]} />
      </mesh>
      {/* tulang pergelangan (ulna) sedikit timbul */}
      <mesh position={[-0.24, -0.33, -0.1]} scale={[0.6, 1, 0.6]} material={skinMat}>
        <sphereGeometry args={[0.07, 12, 10]} />
      </mesh>
      {/* lengan baju + cuff */}
      <mesh position={[-0.2, -2.55, -0.08]} rotation={[0, 0, 0.08]} material={sleeveMat}>
        <cylinderGeometry args={[0.3, 0.34, 1.2, 24]} />
      </mesh>
      <mesh position={[-0.15, -1.97, -0.08]} rotation={[Math.PI / 2, 0, 0.08]} material={sleeveMat}>
        <torusGeometry args={[0.29, 0.05, 10, 24]} />
      </mesh>
      {/* belakang tangan / tapak */}
      <mesh position={[-0.14, -0.02, -0.08]} scale={[0.19, 0.33, 0.17]} material={skinMat} castShadow>
        <sphereGeometry args={[1, 24, 18]} />
      </mesh>
      {/* jari: 3 ruas melingkar batang */}
      {fingers.map(({ y, r }, i) => {
        const k: V3 = [-0.22, y, -0.03];
        const j1: V3 = [-0.06, y - 0.005, 0.12];
        const j2: V3 = [0.1, y - 0.01, 0.06];
        const tip: V3 = [0.08, y - 0.012, -0.05];
        return (
          <group key={i}>
            <mesh position={k} material={knuckleMat} scale={[1, 0.9, 1]}>
              <sphereGeometry args={[r * 1.12, 14, 10]} />
            </mesh>
            <Seg a={k} b={j1} r={r} />
            <Seg a={j1} b={j2} r={r * 0.94} />
            <Seg a={j2} b={tip} r={r * 0.86} />
            {/* lipatan sendi */}
            <mesh position={[j1[0] + 0.01, j1[1] - r * 0.9, j1[2] + 0.01]} rotation={[0, 0.6, Math.PI / 2]} material={skinDark}>
              <capsuleGeometry args={[0.006, r * 1.1, 3, 6]} />
            </mesh>
          </group>
        );
      })}
      {/* ibu jari + kuku */}
      <Seg a={[-0.18, -0.16, 0.04]} b={[-0.02, 0.18, 0.17]} r={0.072} />
      <Seg a={[-0.02, 0.18, 0.17]} b={[0.11, 0.25, 0.13]} r={0.064} />
      <mesh position={[0.1, 0.27, 0.165]} rotation={[0.5, 0.2, -0.5]} scale={[0.05, 0.016, 0.06]} material={nailMat}>
        <sphereGeometry args={[1, 12, 8]} />
      </mesh>
    </group>
  );
};


// ---------------------------------------------------------------- tangan dalang gaya kertas (bentuk jari jelas)

const SKIN = '#e8b08a';
const SKIN_SHADE = '#b06f50';

// Jari dari sendi buku lali (x=0) ke hujung (x=len), hujung bulat
const fingerShape = (len: number, h: number) =>
  custom(`finger:${len}:${h}`, () => {
    const s = new THREE.Shape();
    const r = h / 2;
    s.moveTo(0, -r);
    s.lineTo(len - r, -r * 0.92);
    s.quadraticCurveTo(len + r * 0.15, -r * 0.9, len + r * 0.15, 0);
    s.quadraticCurveTo(len + r * 0.15, r * 0.95, len - r, r);
    s.lineTo(0, r);
    // buku lali bulat di hujung kiri
    s.quadraticCurveTo(-r * 1.1, r, -r * 1.1, 0);
    s.quadraticCurveTo(-r * 1.1, -r, 0, -r);
    return s;
  });

const THUMB = custom('thumb', () => {
  const s = new THREE.Shape();
  s.moveTo(0, -0.075);
  s.quadraticCurveTo(0.2, -0.085, 0.36, -0.06);
  s.quadraticCurveTo(0.45, -0.045, 0.45, 0.0);
  s.quadraticCurveTo(0.45, 0.06, 0.36, 0.065);
  s.quadraticCurveTo(0.2, 0.075, 0, 0.085);
  s.quadraticCurveTo(-0.09, 0.08, -0.09, 0);
  s.quadraticCurveTo(-0.09, -0.075, 0, -0.075);
  return s;
});

const BACK_OF_HAND = custom('backHand', () => {
  const s = new THREE.Shape();
  s.moveTo(-0.08, -0.3);
  s.quadraticCurveTo(-0.2, -0.05, -0.12, 0.26);
  s.quadraticCurveTo(-0.06, 0.34, 0.06, 0.3);
  s.lineTo(0.1, -0.3);
  s.closePath();
  return s;
});

const FOREARM = poly([[-0.17, -0.18], [0.12, -0.24], [0.1, -2.5], [-0.3, -2.5]]);

// Genggaman pada batang menegak di (0,0). Kamera nampak jari melingkar ke depan.
export const PaperHand = () => {
  const fingers = [
    { y: 0.165, len: 0.36, h: 0.122 },
    { y: 0.045, len: 0.39, h: 0.128 },
    { y: -0.077, len: 0.37, h: 0.122 },
    { y: -0.188, len: 0.3, h: 0.104 },
  ];
  return (
    <group>
      {/* lengan + lengan baju */}
      <Paper shape={FOREARM} color={SKIN} depth={0.03} position={[-0.08, 0, -0.06]} />
      <Paper shape={rect(0.56, 1.3, 0.06)} color="#2b2b34" depth={0.05} position={[-0.17, -2.45, -0.03]} />
      <Paper shape={rect(0.62, 0.14, 0.04)} color="#3a3a46" depth={0.05} position={[-0.16, -1.82, 0.0]} />
      {/* belakang tangan (di belakang batang) */}
      <Paper shape={BACK_OF_HAND} color={SKIN} depth={0.04} position={[-0.12, -0.01, -0.03]} />
      {/* jari: lapisan bayang di belakang + jari + garis sendi */}
      {fingers.map(({ y, len, h }, i) => (
        <group key={i} position={[-0.2, y, 0.06 - i * 0.006]} rotation={[0, 0, -0.06]}>
          <Paper shape={fingerShape(len + 0.01, h + 0.022)} color={SKIN_SHADE} depth={0.02} position={[0.004, -0.012, -0.012]} />
          <Paper shape={fingerShape(len, h)} color={SKIN} depth={0.03} />
          {/* lipatan sendi tengah & hujung */}
          <Paper shape={rect(0.012, h * 0.62, 0.005)} color={SKIN_SHADE} depth={0.008} position={[len * 0.5, 0, 0.02]} />
          <Paper shape={rect(0.01, h * 0.5, 0.005)} color={SKIN_SHADE} depth={0.008} position={[len * 0.8, 0, 0.02]} />
        </group>
      ))}
      {/* ibu jari melintang atas jari telunjuk */}
      <group position={[-0.22, 0.08, 0.13]} rotation={[0, 0, -0.22]}>
        <Paper shape={THUMB} color={SKIN_SHADE} depth={0.02} position={[0.005, -0.01, -0.012]} />
        <Paper shape={THUMB} color={SKIN} depth={0.03} />
        <Paper shape={rect(0.012, 0.09, 0.005)} color={SKIN_SHADE} depth={0.008} position={[0.24, 0, 0.02]} />
        {/* kuku */}
        <Paper shape={rect(0.11, 0.085, 0.035)} color="#f6d3c4" depth={0.008} position={[0.37, 0.005, 0.02]} />
        <Paper shape={rect(0.03, 0.07, 0.012)} color="#fbe6dc" depth={0.006} position={[0.405, 0.005, 0.026]} />
      </group>
    </group>
  );
};

export const Rod = ({ length }: { length: number }) => (
  <mesh position={[0, -length / 2, 0]} castShadow>
    <cylinderGeometry args={[0.03, 0.03, length, 10]} />
    <meshStandardMaterial color="#c9a26b" roughness={0.7} />
  </mesh>
);

// Boneka + batang + tangan. Tangan di hujung batang (y = -rod), lengan turun ke belakang papan.
export const Puppeteer = ({ children, rod, x = 0, y = 0, z = 0, tilt = 0, scale = 1, hand = true }: {
  children: ReactNode; rod: number; x?: number; y?: number; z?: number; tilt?: number; scale?: number; hand?: boolean;
}) => (
  <group position={[x, y, z]} rotation={[0, 0, tilt]}>
    <group scale={scale}>{children}</group>
    <group position={[0, -0.1, -0.06]}>
      <Rod length={rod + 0.25} />
    </group>
    {hand ? (
      <group position={[0, -rod, -0.1]} scale={1.3}>
        <PaperHand />
      </group>
    ) : null}
  </group>
);

// ---------------------------------------------------------------- boneka generik

export type Look = {
  skin?: string;
  hair?: 'bob' | 'bun' | 'short' | 'grey' | 'cap';
  hairColor?: string;
  shirt?: string;
  pants?: string;
  dress?: boolean;
  beard?: boolean;
  glasses?: boolean;
  lanyard?: boolean;
  bow?: string;
};
export type Pose = {
  armF?: number; // lengan depan (radian, + = angkat ke depan/atas)
  armB?: number;
  leg?: number;
  head?: number;
  mouth?: number; // 0 tutup .. 1 buka
  eyes?: 'open' | 'wide' | 'closed';
  hold?: 'coffee' | 'phone' | 'clock' | 'pot' | 'book' | 'mic' | null;
  phoneGlow?: number;
};

export const AINA: Look = { hair: 'bob', lanyard: true };

const HoldItem = ({ item, glow = 1 }: { item: NonNullable<Pose['hold']>; glow?: number }) => {
  if (item === 'coffee')
    return (
      <group position={[0, -0.92, 0.04]}>
        <Paper shape={poly([[-0.14, 0.18], [0.14, 0.18], [0.11, -0.12], [-0.11, -0.12]])} color={C.cream} />
        <Paper shape={rect(0.28, 0.07, 0)} color={C.red} position={[0, 0.07, 0.02]} />
      </group>
    );
  if (item === 'phone')
    return (
      <group position={[0.02, -0.98, 0.06]} rotation={[0, 0, 0.3]}>
        <Paper shape={rect(0.2, 0.36, 0.04)} color="#222" />
        <Paper shape={rect(0.16, 0.3, 0.03)} color="#9fe8ff" glow={glow > 0 ? '#5fd8ff' : undefined} depth={0.01} position={[0, 0, 0.025]} />
      </group>
    );
  if (item === 'clock')
    return (
      <group position={[0, -0.95, 0.05]}>
        <Paper shape={circle(0.16)} color={C.gold} />
        <Paper shape={circle(0.12)} color={C.cream} depth={0.01} position={[0, 0, 0.025]} />
        <Paper shape={rect(0.02, 0.1, 0)} color={C.ink} depth={0.01} position={[0, 0.04, 0.035]} />
      </group>
    );
  if (item === 'pot')
    return (
      <group position={[0.05, -0.95, 0.06]}>
        <Paper shape={poly([[-0.17, 0], [0.17, 0], [0.13, -0.26], [-0.13, -0.26]])} color="#c0643a" />
        <Paper shape={ellipse(0.09, 0.22)} color={C.green} position={[-0.05, 0.2, -0.01]} rotation={[0, 0, 0.3]} />
        <Paper shape={ellipse(0.08, 0.2)} color="#6b9a5a" position={[0.07, 0.18, -0.02]} rotation={[0, 0, -0.35]} />
      </group>
    );
  if (item === 'book')
    return (
      <group position={[0.05, -0.95, 0.06]} rotation={[0, 0, 0.15]}>
        <Paper shape={rect(0.42, 0.3, 0.02)} color="#5a3a2a" />
        <Paper shape={rect(0.36, 0.24, 0.01)} color="#e8d9b5" depth={0.01} position={[0, 0, 0.025]} />
      </group>
    );
  return (
    <group position={[0, -0.92, 0.05]}>
      <Paper shape={rect(0.07, 0.3, 0.03)} color="#333" position={[0, -0.05, 0]} />
      <Paper shape={circle(0.09)} color="#555" position={[0, 0.14, 0]} />
    </group>
  );
};

const HAIR_BACK_BOB = custom('hairBob', () => {
  const s = new THREE.Shape();
  s.absarc(0, 0.08, 0.66, 0, Math.PI, false);
  s.lineTo(-0.66, -0.55);
  s.lineTo(0.66, -0.55);
  s.closePath();
  return s;
});
const FRINGE = custom('fringe', () => {
  const s = new THREE.Shape();
  s.moveTo(-0.6, 0.12);
  s.quadraticCurveTo(-0.5, 0.72, 0, 0.7);
  s.quadraticCurveTo(0.55, 0.7, 0.62, 0.15);
  s.quadraticCurveTo(0.2, 0.36, -0.1, 0.3);
  s.quadraticCurveTo(-0.4, 0.26, -0.6, 0.12);
  return s;
});
const SHORT_HAIR = custom('shortHair', () => {
  const s = new THREE.Shape();
  s.moveTo(-0.6, 0.0);
  s.quadraticCurveTo(-0.66, 0.74, 0, 0.72);
  s.quadraticCurveTo(0.66, 0.74, 0.6, 0.0);
  s.quadraticCurveTo(0.45, 0.42, 0, 0.4);
  s.quadraticCurveTo(-0.45, 0.42, -0.6, 0.0);
  return s;
});
const BEARD = custom('beard', () => {
  const s = new THREE.Shape();
  s.moveTo(-0.5, -0.05);
  s.quadraticCurveTo(-0.45, -0.85, 0, -0.95);
  s.quadraticCurveTo(0.45, -0.85, 0.5, -0.05);
  s.quadraticCurveTo(0.2, -0.35, 0, -0.3);
  s.quadraticCurveTo(-0.2, -0.35, -0.5, -0.05);
  return s;
});
const MOUTH_SMILE = custom('mouthSmile', () => {
  const s = new THREE.Shape();
  s.absarc(0, -0.2, 0.12, Math.PI, 0, false);
  s.closePath();
  return s;
});

const PinDot = ({ x, y, z }: { x: number; y: number; z: number }) => (
  <mesh position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[0.045, 0.045, 0.02, 12]} />
    <meshStandardMaterial color="#c8a54a" metalness={0.6} roughness={0.35} />
  </mesh>
);

// Boneka kertas bersendi (pin split). Asal di tengah badan; kaki ~-1.45, kepala ~+1.8.
export const Puppet = ({ look = AINA, pose = {} }: { look?: Look; pose?: Pose }) => {
  const skin = look.skin ?? C.skin;
  const hairC = look.hairColor ?? (look.hair === 'grey' ? '#d9d4cc' : C.hair);
  const shirt = look.shirt ?? C.shirt;
  const pants = look.pants ?? C.pants;
  const { armF = 0, armB = 0, leg = 0, head = 0, mouth = 0, eyes = 'open', hold = null, phoneGlow = 1 } = pose;
  const eyeR = eyes === 'wide' ? 0.1 : 0.075;
  return (
    <group>
      {/* kaki */}
      {look.dress ? null : (
        <>
          <group position={[-0.17, -0.55, -0.03]} rotation={[0, 0, leg]}>
            <Paper shape={rect(0.24, 0.95, 0.1)} color={pants} position={[0, -0.42, 0]} />
            <Paper shape={rect(0.34, 0.14, 0.06)} color={C.ink} position={[0.05, -0.9, 0.01]} />
          </group>
          <group position={[0.17, -0.55, -0.03]} rotation={[0, 0, -leg]}>
            <Paper shape={rect(0.24, 0.95, 0.1)} color={pants} position={[0, -0.42, 0]} />
            <Paper shape={rect(0.34, 0.14, 0.06)} color={C.ink} position={[0.05, -0.9, 0.01]} />
          </group>
        </>
      )}
      {look.dress ? (
        <>
          <Paper shape={rect(0.18, 0.6, 0.06)} color={skin} position={[-0.17, -1.0, -0.04]} />
          <Paper shape={rect(0.18, 0.6, 0.06)} color={skin} position={[0.17, -1.0, -0.04]} />
          <Paper shape={rect(0.3, 0.13, 0.06)} color={C.red} position={[-0.17, -1.33, -0.03]} />
          <Paper shape={rect(0.3, 0.13, 0.06)} color={C.red} position={[0.17, -1.33, -0.03]} />
        </>
      ) : null}
      {/* lengan belakang */}
      <group position={[-0.42, 0.45, -0.04]} rotation={[0, 0, -armB]}>
        <Paper shape={rect(0.22, 0.85, 0.1)} color={shirt} position={[0, -0.38, 0]} />
        <Paper shape={circle(0.12)} color={skin} position={[0, -0.82, 0.01]} />
      </group>
      <PinDot x={-0.42} y={0.45} z={0.03} />
      {/* badan */}
      {look.dress ? (
        <Paper shape={poly([[-0.42, 0.6], [0.42, 0.6], [0.7, -0.75], [-0.7, -0.75]])} color={shirt} />
      ) : (
        <Paper shape={poly([[-0.45, 0.6], [0.45, 0.6], [0.52, -0.6], [-0.52, -0.6]])} color={shirt} />
      )}
      <Paper shape={poly([[-0.14, 0.6], [0.14, 0.6], [0, 0.34]])} color={C.cream} position={[0, 0, 0.03]} />
      {look.bow ? <Paper shape={poly([[-0.2, 0.62], [0, 0.52], [0.2, 0.62], [0.2, 0.42], [0, 0.52], [-0.2, 0.42]])} color={look.bow} position={[0, 0, 0.05]} /> : null}
      {look.lanyard ? (
        <>
          <Paper shape={poly([[-0.2, 0.58], [-0.16, 0.58], [-0.02, -0.1], [-0.06, -0.1]])} color={C.red} position={[0, 0, 0.035]} />
          <Paper shape={poly([[0.2, 0.58], [0.16, 0.58], [0.02, -0.1], [0.06, -0.1]])} color={C.red} position={[0, 0, 0.035]} />
          <Paper shape={rect(0.26, 0.32, 0.03)} color={C.cream} position={[0, -0.24, 0.045]} />
        </>
      ) : null}
      {/* lengan depan + barang dipegang */}
      <group position={[0.42, 0.45, 0.05]} rotation={[0, 0, armF]}>
        <Paper shape={rect(0.22, 0.85, 0.1)} color={shirt} position={[0, -0.38, 0]} />
        <Paper shape={circle(0.12)} color={skin} position={[0, -0.82, 0.01]} />
        {hold ? <HoldItem item={hold} glow={phoneGlow} /> : null}
      </group>
      <PinDot x={0.42} y={0.45} z={0.08} />
      {/* kepala */}
      <group position={[0, 1.2, 0.02]} rotation={[0, 0, head]}>
        {look.hair === 'bob' ? <Paper shape={HAIR_BACK_BOB} color={hairC} position={[0, 0, -0.04]} /> : null}
        {look.hair === 'bun' ? (
          <>
            <Paper shape={circle(0.3)} color={hairC} position={[0, 0.72, -0.04]} />
            <Paper shape={HAIR_BACK_BOB} color={hairC} position={[0, 0, -0.04]} />
          </>
        ) : null}
        <Paper shape={circle(0.55)} color={skin} />
        {look.hair === 'bob' || look.hair === 'bun' ? <Paper shape={FRINGE} color={hairC} position={[0, 0, 0.03]} /> : null}
        {look.hair === 'short' || look.hair === 'grey' ? <Paper shape={SHORT_HAIR} color={hairC} position={[0, 0, 0.03]} /> : null}
        {look.hair === 'cap' ? (
          <>
            <Paper shape={SHORT_HAIR} color={look.hairColor ?? '#2f7d5b'} position={[0, 0.02, 0.03]} />
            <Paper shape={rect(0.9, 0.12, 0.05)} color={look.hairColor ?? '#2f7d5b'} position={[0.25, 0.42, 0.05]} />
          </>
        ) : null}
        {look.beard ? <Paper shape={BEARD} color={hairC} position={[0, -0.02, 0.05]} /> : null}
        {/* mata */}
        {eyes === 'closed' ? (
          <>
            <Paper shape={rect(0.16, 0.03, 0.01)} color={C.ink} depth={0.02} position={[-0.2, -0.02, 0.04]} />
            <Paper shape={rect(0.16, 0.03, 0.01)} color={C.ink} depth={0.02} position={[0.2, -0.02, 0.04]} />
          </>
        ) : (
          <>
            {eyes === 'wide' ? (
              <>
                <Paper shape={circle(0.13)} color="#ffffff" depth={0.015} position={[-0.2, -0.02, 0.035]} />
                <Paper shape={circle(0.13)} color="#ffffff" depth={0.015} position={[0.2, -0.02, 0.035]} />
              </>
            ) : null}
            <Paper shape={circle(eyeR)} color={C.ink} depth={0.02} position={[-0.2, -0.02, 0.045]} />
            <Paper shape={circle(eyeR)} color={C.ink} depth={0.02} position={[0.2, -0.02, 0.045]} />
            <Paper shape={circle(0.025)} color="#ffffff" depth={0.02} position={[-0.18, 0.01, 0.058]} />
            <Paper shape={circle(0.025)} color="#ffffff" depth={0.02} position={[0.22, 0.01, 0.058]} />
          </>
        )}
        {look.glasses ? (
          <>
            <mesh position={[-0.2, -0.02, 0.07]}><torusGeometry args={[0.15, 0.018, 8, 24]} /><meshStandardMaterial color="#3a2a20" /></mesh>
            <mesh position={[0.2, -0.02, 0.07]}><torusGeometry args={[0.15, 0.018, 8, 24]} /><meshStandardMaterial color="#3a2a20" /></mesh>
          </>
        ) : null}
        {look.beard ? null : (
          <>
            <Paper shape={ellipse(0.1, 0.06)} color="#ec9686" depth={0.015} position={[-0.34, -0.2, 0.04]} />
            <Paper shape={ellipse(0.1, 0.06)} color="#ec9686" depth={0.015} position={[0.34, -0.2, 0.04]} />
          </>
        )}
        {/* mulut: senyum tertutup → bujur terbuka */}
        {mouth > 0.15 ? (
          <Paper shape={ellipse(0.1, 0.04 + 0.08 * mouth)} color="#7a2a2a" depth={0.015} position={[0, -0.26, 0.06]} />
        ) : (
          <Paper shape={MOUTH_SMILE} color="#8a2f2f" depth={0.015} position={[0, look.beard ? -0.02 : 0, 0.055]} />
        )}
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- pentas

const curtainGeo = (side: 1 | -1) => {
  const g = new THREE.PlaneGeometry(3.2, 8, 90, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    p.setZ(i, Math.sin(x * 9) * 0.1 + Math.sin(x * 23) * 0.025);
  }
  g.computeVertexNormals();
  g.translate(-1.6 * side, 0, 0);
  return g;
};
const curtainMat = () => {
  const t = paperTexture().clone();
  t.repeat.set(3, 6);
  t.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ color: C.red, map: t, roughness: 0.75, side: THREE.DoubleSide });
};

const Curtain = ({ side, open }: { side: 1 | -1; open: number }) => {
  const geo = useMemo(() => curtainGeo(side), [side]);
  const mat = useMemo(curtainMat, []);
  const sx = interpolate(open, [0, 1], [1, 0.24]);
  return (
    <group position={[3.2 * side, 1.25, 0.55]} scale={[sx, 1, 1]}>
      <mesh geometry={geo} material={mat} receiveShadow />
    </group>
  );
};

const VALANCE = poly([[-2.8, 0.4], [2.8, 0.4], [2.8, -0.2], [2.1, -0.55], [1.4, -0.2], [0.7, -0.55], [0, -0.2], [-0.7, -0.55], [-1.4, -0.2], [-2.1, -0.55], [-2.8, -0.2]]);

export const Stage = ({ open }: { open: number }) => (
  <group>
    <mesh position={[0, 0, -4]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#1c0f12" roughness={1} />
    </mesh>
    <Paper cast={false} shape={rect(0.7, 8.6, 0.05)} color={C.gold} depth={0.25} position={[-3.05, 1.1, 0.9]} />
    <Paper cast={false} shape={rect(0.7, 8.6, 0.05)} color={C.gold} depth={0.25} position={[3.05, 1.1, 0.9]} />
    <Paper cast={false} shape={rect(6.8, 1.0, 0.05)} color={C.gold} depth={0.25} position={[0, 5.0, 0.9]} />
    <Paper cast={false} shape={VALANCE} color={C.redDark} depth={0.12} position={[0, 4.25, 0.75]} />
    <Curtain side={-1} open={open} />
    <Curtain side={1} open={open} />
    <Paper cast={false} shape={rect(7.4, 5.0, 0.06)} color={C.wood} depth={0.3} position={[0, -4.65, 1.25]} />
    <Paper cast={false} shape={rect(7.4, 0.22, 0.04)} color={C.gold} depth={0.36} position={[0, -2.17, 1.25]} />
    <Paper cast={false} shape={rect(5.6, 1.4, 0.3)} color={C.woodDark} depth={0.05} position={[0, -3.5, 1.42]} />
    {Array.from({ length: 9 }, (_, i) => -2.8 + i * 0.7).map((x) => (
      <mesh key={x} position={[x, -2.0, 1.32]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial color="#fff2c4" emissive="#ffd27a" emissiveIntensity={2.5} />
      </mesh>
    ))}
  </group>
);

// ---------------------------------------------------------------- prop biasa

export const Clock = ({ spin, r = 0.62 }: { spin: number; r?: number }) => (
  <group>
    <Paper shape={circle(r)} color={C.red} depth={0.06} />
    <Paper shape={circle(r * 0.84)} color={C.cream} depth={0.02} position={[0, 0, 0.04]} />
    {Array.from({ length: 12 }, (_, i) => (
      <Paper key={i} shape={rect(0.03, 0.08, 0)} color={C.ink} depth={0.01}
        position={[Math.sin((i / 12) * Math.PI * 2) * r * 0.72, Math.cos((i / 12) * Math.PI * 2) * r * 0.72, 0.055]}
        rotation={[0, 0, -(i / 12) * Math.PI * 2]} />
    ))}
    <group position={[0, 0, 0.07]} rotation={[0, 0, -spin]}>
      <Paper shape={rect(0.05, r * 0.68, 0.02)} color={C.ink} depth={0.015} position={[0, r * 0.3, 0]} />
    </group>
    <group position={[0, 0, 0.085]} rotation={[0, 0, -spin / 12]}>
      <Paper shape={rect(0.07, r * 0.48, 0.02)} color={C.ink} depth={0.015} position={[0, r * 0.2, 0]} />
    </group>
  </group>
);

const MONTHS = ['JAN', 'FEB', 'MAC', 'APR', 'MEI', 'JUN', 'JUL', 'OGO', 'SEP', 'OKT', 'NOV'];
export const Calendar = ({ month }: { month: number }) => {
  const idx = Math.min(MONTHS.length - 1, Math.max(0, Math.floor(month)));
  return (
    <group>
      <Paper shape={rect(1.7, 2.0, 0.04)} color={C.cream} />
      <Paper shape={rect(1.7, 0.5, 0.04)} color={C.red} position={[0, 0.75, 0.03]} />
      <TextPlane lines={[{ text: MONTHS[idx], color: '#fff8ea', size: 300 }]} w={1.5} h={0.6} position={[0, 0.75, 0.06]} pxW={1024} pxH={420} />
      {Array.from({ length: 12 }, (_, i) => (
        <Paper key={i} shape={rect(0.26, 0.26, 0.02)} color={i === 7 ? C.mustard : '#e2cfae'} depth={0.015}
          position={[-0.5 + (i % 4) * 0.34, 0.15 - Math.floor(i / 4) * 0.34, 0.03]} />
      ))}
    </group>
  );
};

// Papan tanda tergantung tali dari atas
export const Banner = ({ text, color = C.ink, w = 3.2 }: { text: string; color?: string; w?: number }) => (
  <group>
    <mesh position={[-w * 0.38, 1.6, -0.02]}>
      <cylinderGeometry args={[0.012, 0.012, 3, 6]} />
      <meshStandardMaterial color="#d8c8a8" />
    </mesh>
    <mesh position={[w * 0.38, 1.6, -0.02]}>
      <cylinderGeometry args={[0.012, 0.012, 3, 6]} />
      <meshStandardMaterial color="#d8c8a8" />
    </mesh>
    <Paper shape={rect(w, 0.8, 0.08)} color={C.card} depth={0.05} />
    <TextPlane lines={[{ text, color, size: 120 }]} w={w * 0.94} h={0.74} position={[0, 0, 0.035]} pxW={1400} pxH={340} />
  </group>
);
