// Dunia 3D low-poly gaya PS2: watak manusia beranimasi + set (pejabat, tapak binaan, bilik tidur, studio).
import { useMemo, type ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { interpolate, random, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

// ---------------------------------------------------------------- types

export type Action =
  | 'idle' | 'typing' | 'tired_desk' | 'head_on_desk' | 'stressed' | 'thinking'
  | 'lifting' | 'carrying' | 'walking' | 'wipe_sweat' | 'stretch' | 'lying_awake' | 'sleeping';
export type Outfit = 'office' | 'worker' | 'casual';
export type Expression = 'normal' | 'tired' | 'stressed' | 'happy';
export type SetName = 'office' | 'site' | 'bedroom' | 'studio';
export type CameraShot = 'wide' | 'medium' | 'close' | 'over_shoulder' | 'low';

export type Actor = {
  outfit?: Outfit;
  action?: Action;
  expression?: Expression;
  x?: number;
  z?: number;
  facing?: number; // darjah, 0 = hadap kamera
  skin?: string;
  energy?: number; // 0-1: bateri atas kepala (pilihan)
  energyTo?: number; // bateri berubah ke nilai ni sepanjang scene
};

export type Scene3d = {
  set?: SetName;
  actors?: Actor[];
  camera?: CameraShot;
  focusX?: number; // x yang kamera fokus
  angle?: number; // darjah kamera pusing keliling watak (default: pejabat 35, bilik 25)
  time?: 'day' | 'night';
  pixelation?: number;
};

type Pose = {
  rootY: number; rootRotX: number; rootRotZ: number; hipY: number | null;
  spineX: number; spineZ: number; headX: number; headY: number;
  lArmX: number; lArmZ: number; lElbow: number;
  rArmX: number; rArmZ: number; rElbow: number;
  lLeg: number; lKnee: number; rLeg: number; rKnee: number;
  holding: boolean; boxHeight: number;
};

const BASE: Pose = {
  rootY: 0, rootRotX: 0, rootRotZ: 0, hipY: null, spineX: 0, spineZ: 0, headX: 0, headY: 0,
  lArmX: 0, lArmZ: 0.08, lElbow: -0.1, rArmX: 0, rArmZ: 0.08, rElbow: -0.1,
  lLeg: 0, lKnee: 0, rLeg: 0, rKnee: 0, holding: false, boxHeight: 0,
};

// ---------------------------------------------------------------- body dimensions (meter)

const THIGH = 0.45, SHIN = 0.43, FOOT_H = 0.06, UPPER_ARM = 0.3, FOREARM = 0.27;
const SEAT_HIP_Y = 0.52;

const legHeight = (leg: number, knee: number) => THIGH * Math.cos(leg) + SHIN * Math.cos(leg + knee) + FOOT_H;

// ---------------------------------------------------------------- actions → pose

const SIT: Partial<Pose> = { hipY: SEAT_HIP_Y, lLeg: -1.5, lKnee: 1.45, rLeg: -1.5, rKnee: 1.45 };

const poseFor = (action: Action, t: number, seed: number, seated: boolean): Pose => {
  const s = Math.sin, breathe = s(t * 2.2 + seed) * 0.02;
  switch (action) {
    case 'typing': {
      const tap = (k: number) => s(t * 18 + k) * 0.05;
      return { ...BASE, ...SIT, spineX: 0.12 + breathe, headX: 0.18 + s(t * 0.7) * 0.03, headY: s(t * 0.5) * 0.08,
        lArmX: -0.75 + tap(0), lElbow: -0.9, lArmZ: 0.12, rArmX: -0.75 + tap(2), rElbow: -0.9, rArmZ: 0.12 };
    }
    case 'tired_desk': {
      const nod = Math.max(0, s(t * 1.1)) * 0.25;
      return { ...BASE, ...SIT, spineX: 0.35 + breathe, headX: 0.45 + nod, headY: 0.1,
        lArmX: -0.9, lElbow: -0.7, lArmZ: 0.15, rArmX: -1.35, rElbow: -2.3, rArmZ: 0.2 };
    }
    case 'head_on_desk':
      return { ...BASE, ...SIT, spineX: 0.95 + breathe, headX: 0.35, headY: 0.4,
        lArmX: -1.25, lElbow: -1.3, lArmZ: 0.35, rArmX: -1.25, rElbow: -1.3, rArmZ: 0.35 };
    case 'stressed': {
      const shake = s(t * 7) * 0.18;
      return { ...BASE, ...(seated ? SIT : {}), spineX: seated ? 0.25 : 0.15, headX: 0.25, headY: shake,
        lArmX: -2.75, lArmZ: 0.4, lElbow: -2.5, rArmX: -2.75, rArmZ: 0.4, rElbow: -2.5 };
    }
    case 'thinking':
      return { ...BASE, spineX: 0.05 + breathe, headX: -0.1, headY: 0.2 + s(t * 0.6) * 0.1,
        rArmX: -1.0, rElbow: -2.4, rArmZ: 0.1, lArmX: -0.6, lElbow: -1.4, lArmZ: 0.25 };
    case 'lifting': {
      // kitaran: tunduk ambil kotak → berdiri angkat → letak semula
      const phase = (s((t / 2.6) * Math.PI * 2 - Math.PI / 2) + 1) / 2; // 0 = berdiri, 1 = cangkung
      const leg = -1.25 * phase, knee = 2.1 * phase;
      return { ...BASE, spineX: 0.15 + 0.55 * phase, headX: -0.25 * phase + 0.05,
        lLeg: leg, lKnee: knee, rLeg: leg, rKnee: knee,
        lArmX: -0.55 - 0.45 * (1 - phase), lElbow: -1.1 * (1 - phase) - 0.1, lArmZ: 0.12,
        rArmX: -0.55 - 0.45 * (1 - phase), rElbow: -1.1 * (1 - phase) - 0.1, rArmZ: 0.12,
        holding: true, boxHeight: phase };
    }
    case 'carrying':
    case 'walking': {
      const w = t * 6 + seed, swing = s(w) * 0.5, carry = action === 'carrying';
      return { ...BASE, rootY: Math.abs(s(w)) * 0.03, spineX: carry ? 0.12 : 0.03,
        lLeg: swing, lKnee: Math.max(0, -s(w)) * 0.7 + 0.05, rLeg: -swing, rKnee: Math.max(0, s(w)) * 0.7 + 0.05,
        lArmX: carry ? -1.0 : -swing * 0.8, lElbow: carry ? -1.1 : -0.3, lArmZ: 0.1,
        rArmX: carry ? -1.0 : swing * 0.8, rElbow: carry ? -1.1 : -0.3, rArmZ: 0.1,
        holding: carry, boxHeight: 0 };
    }
    case 'wipe_sweat': {
      const wipe = Math.max(0, s(t * 1.6));
      return { ...BASE, spineX: 0.2 + s(t * 3.5) * 0.04, headX: 0.15 - wipe * 0.25,
        rArmX: -0.3 - 2.0 * wipe, rArmZ: 0.15 + 0.35 * wipe, rElbow: -0.3 - 1.9 * wipe,
        lArmX: -0.2, lElbow: -0.3, lArmZ: 0.15, lLeg: -0.08, lKnee: 0.15, rLeg: 0.05, rKnee: 0.1 };
    }
    case 'stretch': {
      const up = (s(t * 1.2) + 1) / 2;
      return { ...BASE, spineX: -0.12 * up, headX: -0.3 * up,
        lArmX: -2.9 * up - 0.1, lArmZ: 0.25, lElbow: -0.1, rArmX: -2.9 * up - 0.1, rArmZ: 0.25, rElbow: -0.1 };
    }
    case 'lying_awake':
    case 'sleeping': {
      const awake = action === 'lying_awake';
      return { ...BASE, rootRotZ: Math.PI / 2, rootY: 0.64, hipY: 0,
        headY: awake ? s(t * 0.4) * 0.35 : 0, headX: awake ? -0.1 : 0.05,
        lArmX: 0, lArmZ: 0.1, rArmX: awake ? -2.6 : 0, rElbow: awake ? -1.4 : 0, rArmZ: 0.2 };
    }
    case 'idle':
    default:
      return { ...BASE, spineX: breathe, headY: s(t * 0.5 + seed) * 0.12, lArmZ: 0.08 + breathe, rArmZ: 0.08 + breathe };
  }
};

// ---------------------------------------------------------------- primitive helpers

type V3 = [number, number, number];

const Box = ({ size, pos = [0, 0, 0], color, emissive, rot }: { size: V3; pos?: V3; color: string; emissive?: string; rot?: V3 }) => (
  <mesh position={pos} rotation={rot} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} flatShading emissive={emissive ?? '#000'} emissiveIntensity={emissive ? 1.2 : 0} roughness={0.8} />
  </mesh>
);

const Limb = ({ len, w, d, color }: { len: number; w: number; d: number; color: string }) => (
  <mesh position={[0, -len / 2, 0]} castShadow>
    <cylinderGeometry args={[w, d, len, 6]} />
    <meshStandardMaterial color={color} flatShading roughness={0.85} />
  </mesh>
);

// ---------------------------------------------------------------- outfit colours

const OUTFITS: Record<Outfit, { shirt: string; pants: string; shoes: string; accent: string }> = {
  office: { shirt: '#dfe6ee', pants: '#2b3242', shoes: '#151515', accent: '#7a1f2b' },
  worker: { shirt: '#3b5e8c', pants: '#4a4033', shoes: '#3a2716', accent: '#f2c500' },
  casual: { shirt: '#5a6b4a', pants: '#2f3a52', shoes: '#ddd', accent: '#ffffff' },
};

// ---------------------------------------------------------------- face

const Face = ({ expression, t, seed }: { expression: Expression; t: number; seed: number }) => {
  const blink = (t * 1000 + seed * 977) % 3400 < 120;
  const lid = blink ? 0.15 : expression === 'tired' ? 0.4 : expression === 'stressed' ? 1.15 : 1;
  const browTilt = expression === 'stressed' ? 0.35 : expression === 'tired' ? -0.15 : 0;
  const mouthW = expression === 'happy' ? 0.06 : 0.045;
  const mouthY = expression === 'happy' ? -0.055 : -0.06;
  return (
    <group position={[0, 0, 0.112]}>
      {[-1, 1].map((side) => (
        <group key={side}>
          <Box size={[0.026, 0.016 * lid, 0.01]} pos={[side * 0.04, 0.015, 0]} color="#111" />
          <Box size={[0.04, 0.009, 0.01]} pos={[side * 0.04, 0.045, 0]} rot={[0, 0, side * browTilt]} color="#2a1a10" />
        </group>
      ))}
      <Box size={[0.03, 0.03, 0.03]} pos={[0, -0.015, 0.012]} color="#c99a7a" />
      <Box size={[mouthW, 0.01, 0.01]} pos={[0, mouthY, 0]} color="#5a2a2a" />
    </group>
  );
};

// ---------------------------------------------------------------- energy battery

const Battery = ({ level }: { level: number }) => {
  const color = level > 0.6 ? '#3ddc5a' : level > 0.3 ? '#f2c500' : '#ff3344';
  return (
    <group position={[0, 2.15, 0]}>
      <Box size={[0.34, 0.16, 0.06]} color="#222" />
      <Box size={[0.03, 0.07, 0.05]} pos={[0.185, 0, 0]} color="#222" />
      <Box size={[0.3 * Math.max(0.03, level), 0.12, 0.07]} pos={[-0.15 + 0.15 * Math.max(0.03, level), 0, 0]} color={color} emissive={color} />
    </group>
  );
};

// ---------------------------------------------------------------- human

const Human = ({ actor, index, seated }: { actor: Actor; index: number; seated: boolean }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const seed = index * 1.7;
  const p = poseFor(actor.action ?? 'idle', t, seed, seated);
  const outfit = OUTFITS[actor.outfit ?? 'office'];
  const skin = actor.skin ?? ['#c68a5c', '#a86b45', '#e0b08a', '#8a5a3a'][index % 4];
  const expression = actor.expression ?? 'normal';
  const hipY = p.hipY ?? Math.min(legHeight(p.lLeg, p.lKnee), legHeight(p.rLeg, p.rKnee));
  const energy = actor.energy === undefined ? null
    : interpolate(frame, [0, durationInFrames], [actor.energy, actor.energyTo ?? actor.energy], { extrapolateRight: 'clamp' });

  const arm = (side: 1 | -1, armX: number, armZ: number, elbow: number) => (
    <group position={[side * 0.23, 0.46, 0]} rotation={[armX, 0, side * armZ]}>
      <Limb len={UPPER_ARM} w={0.055} d={0.048} color={outfit.shirt} />
      <group position={[0, -UPPER_ARM, 0]} rotation={[elbow, 0, 0]}>
        <Limb len={FOREARM} w={0.045} d={0.038} color={actor.outfit === 'worker' ? outfit.shirt : skin} />
        <Box size={[0.07, 0.09, 0.04]} pos={[0, -FOREARM - 0.04, 0]} color={actor.outfit === 'worker' ? '#7a5a2a' : skin} />
      </group>
    </group>
  );

  const leg = (side: 1 | -1, legX: number, knee: number) => (
    <group position={[side * 0.1, 0, 0]} rotation={[legX, 0, 0]}>
      <Limb len={THIGH} w={0.08} d={0.065} color={outfit.pants} />
      <group position={[0, -THIGH, 0]} rotation={[knee, 0, 0]}>
        <Limb len={SHIN} w={0.062} d={0.05} color={outfit.pants} />
        <Box size={[0.1, FOOT_H, 0.24]} pos={[0, -SHIN - FOOT_H / 2, 0.05]} rot={[-knee - legX, 0, 0]} color={outfit.shoes} />
      </group>
    </group>
  );

  return (
    <group position={[actor.x ?? 0, p.rootY, actor.z ?? 0]} rotation={[0, ((actor.facing ?? 0) * Math.PI) / 180, 0]}>
      <group rotation={[p.rootRotX, 0, p.rootRotZ]}>
        <group position={[0, hipY, 0]}>
          <Box size={[0.34, 0.16, 0.2]} color={outfit.pants} />
          {leg(1, p.lLeg, p.lKnee)}
          {leg(-1, p.rLeg, p.rKnee)}
          <group position={[0, 0.07, 0]} rotation={[p.spineX, 0, p.spineZ]}>
            <Box size={[0.4, 0.52, 0.23]} pos={[0, 0.27, 0]} color={outfit.shirt} />
            {actor.outfit === 'office' ? (
              <>
                <Box size={[0.06, 0.32, 0.01]} pos={[0, 0.33, 0.12]} color={outfit.accent} />
                <Box size={[0.42, 0.06, 0.24]} pos={[0, 0.03, 0]} color="#111" />
              </>
            ) : null}
            {actor.outfit === 'worker' ? (
              <>
                <Box size={[0.42, 0.44, 0.25]} pos={[0, 0.27, 0]} color="#ff7a00" />
                <Box size={[0.43, 0.04, 0.26]} pos={[0, 0.2, 0]} color="#e8e8e8" emissive="#777" />
                <Box size={[0.43, 0.04, 0.26]} pos={[0, 0.36, 0]} color="#e8e8e8" emissive="#777" />
              </>
            ) : null}
            {arm(1, p.lArmX, p.lArmZ, p.lElbow)}
            {arm(-1, p.rArmX, p.rArmZ, p.rElbow)}
            {p.holding ? (
              <Box size={[0.42, 0.32, 0.36]} pos={[0, 0.22 - p.boxHeight * 0.1, 0.38 + p.boxHeight * 0.05]} color="#b5884f" />
            ) : null}
            <group position={[0, 0.53, 0]}>
              <mesh position={[0, 0.05, 0]}>
                <cylinderGeometry args={[0.05, 0.055, 0.1, 6]} />
                <meshStandardMaterial color={skin} flatShading />
              </mesh>
              <group position={[0, 0.17, 0]} rotation={[p.headX, p.headY, 0]}>
                <mesh scale={[0.1, 0.125, 0.11]} castShadow>
                  <icosahedronGeometry args={[1, 1]} />
                  <meshStandardMaterial color={skin} flatShading roughness={0.7} />
                </mesh>
                <mesh scale={[0.106, 0.08, 0.115]} position={[0, 0.05, -0.008]}>
                  <icosahedronGeometry args={[1, 1]} />
                  <meshStandardMaterial color="#1c120c" flatShading />
                </mesh>
                {[-1, 1].map((side) => <Box key={side} size={[0.02, 0.04, 0.03]} pos={[side * 0.1, 0, 0]} color={skin} />)}
                <Face expression={expression} t={t} seed={seed} />
                {actor.outfit === 'worker' ? (
                  <group position={[0, 0.07, 0]}>
                    <mesh scale={[0.125, 0.09, 0.135]}>
                      <sphereGeometry args={[1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
                      <meshStandardMaterial color={outfit.accent} flatShading />
                    </mesh>
                    <mesh position={[0, 0, 0.03]}>
                      <cylinderGeometry args={[0.15, 0.15, 0.012, 8]} />
                      <meshStandardMaterial color={outfit.accent} flatShading />
                    </mesh>
                  </group>
                ) : null}
                {expression === 'stressed' || actor.action === 'wipe_sweat' || actor.action === 'lifting' ? (
                  <mesh position={[0.08, 0.06 - ((t * 0.6) % 0.2), 0.09]} scale={0.018}>
                    <tetrahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="#9fd8ff" emissive="#4aa8ff" emissiveIntensity={0.6} />
                  </mesh>
                ) : null}
              </group>
            </group>
          </group>
        </group>
      </group>
      {energy !== null && actor.action !== 'lying_awake' && actor.action !== 'sleeping' ? <Battery level={energy} /> : null}
    </group>
  );
};

// ---------------------------------------------------------------- sets

const Desk = ({ x }: { x: number }) => {
  const frame = useCurrentFrame();
  const flicker = 0.9 + random(`f${Math.floor(frame / 3)}`) * 0.2;
  return (
    <group position={[x, 0, 0.55]}>
      <Box size={[1.4, 0.05, 0.7]} pos={[0, 0.74, 0]} color="#6b4a32" />
      {[-0.65, 0.65].map((dx) => <Box key={dx} size={[0.05, 0.74, 0.65]} pos={[dx, 0.37, 0]} color="#3d2a1d" />)}
      <Box size={[0.6, 0.38, 0.04]} pos={[0, 1.1, 0.2]} color="#111" />
      <mesh position={[0, 1.1, 0.177]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.55, 0.33]} />
        <meshBasicMaterial color={new THREE.Color('#7fc4ff').multiplyScalar(flicker)} />
      </mesh>
      <pointLight position={[0, 1.1, -0.2]} intensity={1.6 * flicker} distance={2.5} color="#7fc4ff" />
      <Box size={[0.05, 0.18, 0.05]} pos={[0, 0.85, 0.2]} color="#222" />
      <Box size={[0.45, 0.02, 0.15]} pos={[0, 0.775, -0.12]} color="#2a2a2a" />
      <mesh position={[0.45, 0.82, -0.05]}>
        <cylinderGeometry args={[0.04, 0.035, 0.1, 7]} />
        <meshStandardMaterial color="#e8e2d0" flatShading />
      </mesh>
      {[0, 1, 2, 3].map((i) => <Box key={i} size={[0.22, 0.012, 0.3]} pos={[-0.48, 0.775 + i * 0.014, 0.02]} rot={[0, i * 0.1, 0]} color="#f2f2f2" />)}
    </group>
  );
};

const Chair = ({ x }: { x: number }) => (
  <group position={[x, 0, -0.05]}>
    <Box size={[0.5, 0.07, 0.48]} pos={[0, 0.47, 0]} color="#1e1e24" />
    <Box size={[0.48, 0.6, 0.06]} pos={[0, 0.82, -0.25]} color="#1e1e24" />
    <Box size={[0.05, 0.42, 0.05]} pos={[0, 0.23, 0]} color="#555" />
  </group>
);

const OfficeSet = ({ desks, night }: { desks: number[]; night: boolean }) => (
  <>
    <Box size={[14, 0.02, 12]} pos={[0, -0.01, 0]} color="#3d4452" />
    <Box size={[14, 4, 0.1]} pos={[0, 2, -2.2]} color={night ? '#2c3240' : '#8d97a6'} />
    <mesh position={[0, 2.1, -2.14]}>
      <planeGeometry args={[3.2, 1.4]} />
      <meshBasicMaterial color={night ? '#0d1a3a' : '#bfe3ff'} />
    </mesh>
    {night ? Array.from({ length: 18 }, (_, i) => (
      <Box key={i} size={[0.05, 0.08, 0.01]} pos={[-1.5 + random(`w${i}`) * 3, 1.5 + random(`h${i}`) * 1.1, -2.13]} color="#ffd27a" emissive="#ffb84a" />
    )) : null}
    {desks.map((x) => <group key={x}><Desk x={x} /><Chair x={x} /></group>)}
    <Box size={[1.2, 0.06, 0.25]} pos={[2.2, 3.4, 0]} color="#eee" emissive={night ? '#666' : '#ccc'} />
  </>
);

const SiteSet = () => {
  const crates = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    x: 1.6 + (i % 3) * 0.48, y: 0.2 + Math.floor(i / 3) * 0.4, z: -0.8 + random(`c${i}`) * 0.1,
  })), []);
  return (
    <>
      <Box size={[16, 0.02, 14]} pos={[0, -0.01, 0]} color="#a07a4a" />
      {Array.from({ length: 30 }, (_, i) => (
        <mesh key={i} position={[(random(`rx${i}`) - 0.5) * 10, 0.03, (random(`rz${i}`) - 0.5) * 6]} scale={0.05 + random(`rs${i}`) * 0.08}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#7a6a55" flatShading />
        </mesh>
      ))}
      {crates.map((c, i) => <Box key={i} size={[0.42, 0.38, 0.4]} pos={[c.x, c.y, c.z]} color={i % 2 ? '#b5884f' : '#a0763f'} />)}
      {[-1.8, -2.4].map((x) => (
        <mesh key={x} position={[x, 0.25, 0.6]}>
          <coneGeometry args={[0.13, 0.5, 6]} />
          <meshStandardMaterial color="#ff6a00" flatShading />
        </mesh>
      ))}
      <group position={[-1.2, 0, -2]}>
        {[-1, 0, 1].map((x) => <Box key={x} size={[0.06, 3.2, 0.06]} pos={[x, 1.6, 0]} color="#8a8f96" />)}
        {[0.9, 1.9, 2.9].map((y) => <Box key={y} size={[2.2, 0.06, 0.06]} pos={[0, y, 0]} color="#8a8f96" />)}
        {[0.9, 1.9, 2.9].map((y) => <Box key={y} size={[2.1, 0.04, 0.4]} pos={[0, y + 0.04, 0.2]} color="#7a5a32" />)}
      </group>
      <mesh position={[6, 7, -12]}>
        <icosahedronGeometry args={[1.3, 0]} />
        <meshBasicMaterial color="#fff2b0" />
      </mesh>
    </>
  );
};

const BedroomSet = () => (
  <>
    <Box size={[12, 0.02, 10]} pos={[0, -0.01, 0]} color="#3a2e2a" />
    <Box size={[12, 4, 0.1]} pos={[0, 2, -1.6]} color="#1d2238" />
    <Box size={[2.1, 0.35, 1.2]} pos={[0, 0.2, -0.5]} color="#4a3626" />
    <Box size={[2.0, 0.15, 1.15]} pos={[0, 0.44, -0.5]} color="#d9dde8" />
    <Box size={[0.4, 0.1, 0.7]} pos={[-0.8, 0.56, -0.5]} color="#f2f2f2" />
    <Box size={[1.2, 0.1, 1.18]} pos={[0.35, 0.56, -0.5]} color="#5c6fa8" />
    <Box size={[0.4, 0.5, 0.4]} pos={[1.4, 0.25, -0.9]} color="#4a3626" />
    <Box size={[0.07, 0.12, 0.13]} pos={[1.4, 0.56, -0.85]} color="#111" emissive="#2244ff" />
    <pointLight position={[1.4, 0.9, -0.6]} intensity={1.2} distance={3} color="#5577ff" />
  </>
);

const StudioSet = () => (
  <>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[3.2, 10]} />
      <meshStandardMaterial color="#2a2340" flatShading />
    </mesh>
  </>
);

// ---------------------------------------------------------------- camera

const SHOTS: Record<CameraShot, { pos: V3; look: V3 }> = {
  wide: { pos: [0, 2.0, 5.2], look: [0, 0.9, 0] },
  medium: { pos: [0, 1.5, 3.0], look: [0, 1.0, 0] },
  close: { pos: [0, 1.35, 1.55], look: [0, 1.2, 0] },
  over_shoulder: { pos: [0.7, 1.55, -1.1], look: [0, 1.0, 0.9] },
  low: { pos: [0, 0.5, 2.6], look: [0, 1.2, 0] },
};

const SEATED_ACTIONS: Action[] = ['typing', 'tired_desk', 'head_on_desk'];

// Laras ketinggian fokus kamera ikut posisi watak (duduk / berdiri / baring)
const headroom = (set: SetName, action: Action, shot: CameraShot) => {
  if (action === 'lying_awake' || action === 'sleeping') return -0.45;
  const seated = SEATED_ACTIONS.includes(action) || (set === 'office' && action === 'stressed');
  if (shot === 'close') return seated ? 0 : 0.35;
  if (shot === 'medium') return seated ? -0.05 : 0.15;
  return 0;
};

const Rig = ({ shot, focusX, angle, lookY }: { shot: CameraShot; focusX: number; angle: number; lookY: number }) => {
  const camera = useThree((s) => s.camera);
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { pos, look } = SHOTS[shot];
  const push = interpolate(frame, [0, durationInFrames], [1, 0.88]); // dolly-in perlahan
  // Set terus semasa render (bukan useEffect) supaya frame yang dirakam guna kedudukan kamera betul.
  const a = (angle * Math.PI) / 180;
  const ly = look[1] + lookY;
  const px = pos[0] * push, pz = pos[2] * push;
  camera.position.set(focusX + px * Math.cos(a) + pz * Math.sin(a), ly + (pos[1] - look[1]) * push, -px * Math.sin(a) + pz * Math.cos(a));
  camera.lookAt(focusX + look[0], ly, look[2]);
  camera.updateMatrixWorld();
  return null;
};

// ---------------------------------------------------------------- world

export const World3D = ({ scene, accent }: { scene: Scene3d; accent: string }) => {
  const { width, height } = useVideoConfig();
  const set = scene.set ?? 'studio';
  const night = (scene.time ?? (set === 'office' || set === 'bedroom' ? 'night' : 'day')) === 'night';
  const actors = scene.actors ?? [{}];
  const sky = set === 'site' ? '#f2b27a' : set === 'studio' ? '#141022' : night ? '#0b0f1e' : '#9fc4e8';
  const deskXs = set === 'office'
    ? actors.filter((a) => ['typing', 'tired_desk', 'head_on_desk', 'stressed'].includes(a.action ?? '')).map((a) => a.x ?? 0)
    : [];

  let content: ReactNode = <StudioSet />;
  if (set === 'office') content = <OfficeSet desks={deskXs.length ? deskXs : [0]} night={night} />;
  if (set === 'site') content = <SiteSet />;
  if (set === 'bedroom') content = <BedroomSet />;

  return (
    <ThreeCanvas
      width={width}
      height={height}
      dpr={scene.pixelation ?? 0.38}
      gl={{ antialias: false }}
      shadows
      style={{ position: 'absolute', inset: 0, imageRendering: 'pixelated' }}
      camera={{ fov: 50, near: 0.05, far: 60 }}
    >
      <Rig shot={scene.camera ?? 'medium'} focusX={scene.focusX ?? 0}
        angle={scene.angle ?? (set === 'office' ? 35 : set === 'bedroom' ? 20 : 0)}
        lookY={headroom(set, actors[0]?.action ?? 'idle', scene.camera ?? 'medium')} />
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, 5, set === 'site' ? 22 : 12]} />
      <hemisphereLight args={[night ? '#7080c0' : '#fff4e0', '#3a2a20', night ? 0.7 : 0.8]} />
      <directionalLight
        position={set === 'site' ? [4, 7, 4] : [2, 4, 3]}
        intensity={set === 'site' ? 2.6 : night ? 0.9 : 1.3}
        color={set === 'site' ? '#ffe2b0' : '#ffffff'}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      {set === 'studio' ? <spotLight position={[0, 5, 2]} angle={0.6} intensity={30} color={accent} castShadow /> : null}
      {content}
      {actors.map((a, i) => <Human key={i} actor={a} index={i} seated={set === 'office'} />)}
    </ThreeCanvas>
  );
};
