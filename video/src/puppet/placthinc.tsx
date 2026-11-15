// Watak & prop rasmi PLACTHINC (dipotong dari master asset sheet owner -> video/public/placthinc/*.png).
// Dua pengacara SENTIASA sama: host (lelaki, cermin mata, blazer coklat) & cohost (tudung pink, blazer kelabu gelap).
import { useMemo } from 'react';
import * as THREE from 'three';
import { staticFile } from 'remotion';
import { Puppeteer } from './kit';

type V3 = [number, number, number];

// ---------------------------------------------------------------- tekstur

const texCache = new Map<string, THREE.Texture>();
const pending = new Map<string, Promise<void>>();
const loadTex = (name: string) => {
  const hit = texCache.get(name);
  if (hit) return hit;
  let done: () => void = () => undefined;
  pending.set(name, new Promise<void>((r) => { done = r; }));
  const tex = new THREE.TextureLoader().load(staticFile(`placthinc/${name}.png`), () => done(), undefined, () => done());
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  texCache.set(name, tex);
  return tex;
};
const aspect = (t: THREE.Texture) => {
  const img = t.image as HTMLImageElement | undefined;
  return img && img.width ? img.height / img.width : 1;
};

export const SPRITES = [
  'host_body', 'cohost_body', 'logo', 'desk', 'mic', 'lantern', 'books', 'skull', 'bell', 'key', 'mirror', 'photos', 'house', 'stage_bg',
  ...Array.from({ length: 7 }, (_, i) => `hexpr${i}`),
  ...Array.from({ length: 6 }, (_, i) => `cexpr${i}`),
  ...Array.from({ length: 9 }, (_, i) => `hand${i}`),
];
// Muat semua imej dulu; kanvas hanya dilukis bila promise ni selesai
export const loadPlacthinc = () => {
  SPRITES.forEach(loadTex);
  return Promise.all(SPRITES.map((n) => pending.get(n))).then(() => undefined);
};

// Potongan kertas: imej + lapisan kadbod gelap di belakang (rasa tebal)
export const Sprite = ({ name, w, position = [0, 0, 0], rotation = [0, 0, 0], flip = false, glow = 0, opacity = 1 }: {
  name: string; w: number; position?: V3; rotation?: V3; flip?: boolean; glow?: number; opacity?: number;
}) => {
  const tex = loadTex(name);
  const h = w * aspect(tex);
  const front = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.35, roughness: 0.85, side: THREE.DoubleSide }), [tex]);
  const back = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, color: '#1a1210', transparent: true, alphaTest: 0.35, roughness: 1 }), [tex]);
  front.emissive.set(glow > 0 ? '#ffb85c' : '#000000');
  front.emissiveMap = glow > 0 ? tex : null;
  front.emissiveIntensity = glow;
  front.opacity = opacity;
  back.opacity = opacity;
  return (
    <group position={position} rotation={rotation} scale={[flip ? -1 : 1, 1, 1]}>
      <mesh material={back} position={[0.025, -0.03, -0.03]} scale={1.015}>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh material={front} castShadow>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- pengacara

export type Who = 'host' | 'cohost';
export type Mood = 'idle' | 'talk' | 'happy' | 'shock' | 'scared' | 'sad' | 'angry';
const FACES: Record<Who, Record<'idle' | 'open' | 'happy' | 'shock' | 'scared' | 'sad' | 'angry', string>> = {
  host: { idle: 'hexpr0', open: 'hexpr3', happy: 'hexpr1', shock: 'hexpr2', scared: 'hexpr6', sad: 'hexpr4', angry: 'hexpr6' },
  cohost: { idle: 'cexpr0', open: 'cexpr1', happy: 'cexpr3', shock: 'cexpr2', scared: 'cexpr4', sad: 'cexpr4', angry: 'cexpr5' },
};
// hand0 tapak terbuka, hand1 ibu jari, hand2 tunjuk, hand4 genggam, hand5 lambai, hand7 doa
const GESTURE: Record<Mood, string> = { idle: 'hand0', talk: 'hand0', happy: 'hand1', shock: 'hand5', scared: 'hand7', sad: 'hand4', angry: 'hand2' };

const BODY_W = 1.45;

// Boneka pengacara: badan + kepala ekspresi (tukar ikut mulut/mood) + tangan bergagang
export const Host = ({ who, lf, talking, mood = 'idle', gesture }: { who: Who; lf: number; talking: boolean; mood?: Mood; gesture?: string }) => {
  const f = FACES[who];
  const mouthOpen = talking && Math.sin(lf * 1.25) > -0.2;
  const face = talking
    ? (mouthOpen ? (mood === 'shock' || mood === 'scared' ? f.shock : f.open) : (mood === 'scared' ? f.scared : f.idle))
    : mood === 'talk' ? f.idle : f[mood];
  const shake = mood === 'scared' ? Math.sin(lf * 2.3) * 0.04 : 0;
  const nod = talking ? Math.sin(lf * 0.6) * 0.06 : Math.sin(lf * 0.15) * 0.025;
  const handSwing = talking ? Math.sin(lf * 0.35) * 0.35 : mood === 'shock' ? Math.sin(lf * 0.9) * 0.25 : 0.05;
  const handLift = talking || mood === 'shock' || mood === 'scared' ? 0 : -0.35;
  const side = who === 'host' ? 1 : -1; // tangan di sebelah dalam (ke tengah pentas)
  const bodyH = BODY_W * (who === 'host' ? 621 / 333 : 636 / 321);
  return (
    <group position={[shake, 0, 0]}>
      <Sprite name={`${who}_body`} w={BODY_W} position={[0, 0, 0]} />
      <group position={[who === 'host' ? 0.0 : 0.0, bodyH * 0.31, 0.05]} rotation={[0, 0, nod]}>
        <Sprite name={face} w={who === 'host' ? 1.22 : 1.18} />
      </group>
      <group position={[side * 0.95, -0.2 + handLift, 0.12]} rotation={[0, 0, -side * 0.25 + handSwing * side]}>
        <Sprite name={gesture ?? GESTURE[mood]} w={0.75} flip={side < 0} position={[0, 0.25, 0]} />
      </group>
    </group>
  );
};

// Pengacara atas batang dalang (tangan kertas dari bawah pentas)
export const HostOnRod = ({ who, x, y, z = 0.9, scale = 1, lf, talking, mood, gesture }: {
  who: Who; x: number; y: number; z?: number; scale?: number; lf: number; talking: boolean; mood?: Mood; gesture?: string;
}) => {
  const bounce = talking ? Math.abs(Math.sin(lf * 0.3)) * 0.1 : 0;
  return (
    <Puppeteer rod={1.9 * scale} x={x} y={y + bounce} z={z} scale={scale} tilt={(who === 'host' ? 1 : -1) * bounce * 0.3}>
      <Host who={who} lf={lf} talking={talking} mood={mood} gesture={gesture} />
    </Puppeteer>
  );
};

// ---------------------------------------------------------------- set & prop

// Lampu gantung kecil (kertas + mentol menyala)
export const HangLamp = ({ x, y, flicker = 1 }: { x: number; y: number; flicker?: number }) => (
  <group position={[x, y, 0.2]}>
    <mesh position={[0, 0.9, 0]}><cylinderGeometry args={[0.008, 0.008, 1.8, 4]} /><meshStandardMaterial color="#111" /></mesh>
    <mesh position={[0, 0, 0]}><coneGeometry args={[0.32, 0.3, 18, 1, true]} /><meshStandardMaterial color="#1b1b1b" side={THREE.DoubleSide} /></mesh>
    <mesh position={[0, -0.12, 0]}><sphereGeometry args={[0.1, 12, 10]} /><meshStandardMaterial color="#fff2c4" emissive="#ffc46a" emissiveIntensity={3 * flicker} /></mesh>
    <pointLight position={[0, -0.3, 0.3]} intensity={5 * flicker} distance={4.5} color="#ffb862" />
  </group>
);

// Kelip lampu seram (deterministik ikut frame)
export const flickerAt = (lf: number) => {
  const n = Math.sin(lf * 12.9898) * 43758.5453;
  const r = n - Math.floor(n);
  return r > 0.93 ? 0.25 : 0.85 + r * 0.15;
};

// Meja podcast: meja, 2 mikrofon, tanglung, buku, tengkorak
export const PodcastDesk = ({ lf, y = -1.55, z = 1.35 }: { lf: number; y?: number; z?: number }) => {
  const fl = flickerAt(lf);
  return (
    <group position={[0, y, z]}>
      <Sprite name="desk" w={4.6} position={[0, -0.35, 0]} />
      <Sprite name="mic" w={0.42} position={[-1.05, 0.62, 0.08]} rotation={[0, 0, -0.12]} />
      <Sprite name="mic" w={0.42} position={[1.05, 0.62, 0.08]} rotation={[0, 0, 0.12]} flip />
      <Sprite name="books" w={0.62} position={[-1.75, 0.55, 0.06]} />
      <Sprite name="lantern" w={0.55} position={[0, 0.62, 0.1]} glow={0.6 * fl} />
      <Sprite name="skull" w={0.6} position={[1.75, 0.55, 0.06]} />
      <pointLight position={[0, 0.7, 0.6]} intensity={7 * fl} distance={5} color="#ffa64a" />
    </group>
  );
};

// Papan latar rumah berhantu
export const HauntedBackdrop = ({ dim = 1 }: { dim?: number }) => (
  <group position={[0, 1.2, -2.0]}>
    <mesh position={[0, 0, -0.06]}><planeGeometry args={[6.4, 6.6]} /><meshStandardMaterial color="#0d0b14" /></mesh>
    <Sprite name="house" w={5.6 * dim} position={[0, 0.3, 0]} />
  </group>
);
