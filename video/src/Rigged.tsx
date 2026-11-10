// Watak 3D rigged (KayKit Mannequin, CC0) + klip animasi KayKit. Masa animasi di-seek ikut frame Remotion
// (mixer.setTime) supaya render deterministik.
import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';

export const MODELS = { mannequin: 'models/mannequin.glb' } as const;
export type ModelName = keyof typeof MODELS;

const ANIM_FILES = ['General', 'MovementBasic', 'MovementAdvanced', 'Simulation', 'Tools'].map((f) => `models/anim/${f}.glb`);

// Nama ringkas → nama klip KayKit. Nama klip asal juga diterima terus (cth "Sit_Chair_Idle").
export const CLIP_ALIASES: Record<string, string> = {
  idle: 'Idle_A', idle2: 'Idle_B', walk: 'Walking_A', walk_tired: 'Walking_C', run: 'Running_A', sneak: 'Sneaking',
  crouch: 'Crouching', jump: 'Jump_Full_Short', wave: 'Waving', cheer: 'Cheering', sit: 'Sit_Chair_Idle',
  sit_down: 'Sit_Chair_Down', stand_up: 'Sit_Chair_StandUp', sit_floor: 'Sit_Floor_Idle', lie: 'Lie_Idle',
  lie_down: 'Lie_Down', pushups: 'Push_Ups', situps: 'Sit_Ups', pickup: 'PickUp', interact: 'Interact',
  use: 'Use_Item', throw: 'Throw', hit: 'Hit_A', fall: 'Death_A', hold: 'Holding_A', work: 'Working_A',
  type: 'Working_C', hammer: 'Hammering', dig: 'Digging', saw: 'Sawing', chop: 'Chopping', fish: 'Fishing_Idle',
};

export type Vec2 = [number, number]; // [x, z]

export type RiggedActor = {
  model: ModelName;
  clip?: string; // nama alias atau klip KayKit (default: walk kalau ada path, kalau tidak idle)
  x?: number;
  z?: number;
  facing?: number; // darjah, 0 = hadap kamera. Diabaikan semasa bergerak ikut path (auto hadap arah jalan)
  path?: Vec2[]; // titik [x, z]; watak bergerak sepanjang path dari mula ke hujung scene
  pathStart?: number; // 0-1, bahagian scene bila mula bergerak (default 0)
  pathEnd?: number; // 0-1 (default 1)
  endClip?: string; // klip selepas sampai hujung path (default idle)
  color?: string; // tint warna badan
  height?: number; // tinggi watak dalam meter (default 1.6)
  speed?: number; // kelajuan klip (default 1)
  offset?: number; // anjak masa klip (saat) supaya ramai watak tak serentak
};

const resolveClip = (name: string | undefined, clips: THREE.AnimationClip[], fallback: string) => {
  const want = CLIP_ALIASES[name ?? ''] ?? name ?? fallback;
  return clips.find((c) => c.name === want) ?? clips.find((c) => c.name === CLIP_ALIASES[fallback])!;
};

// Kedudukan + arah sepanjang polyline ikut pecahan jarak (0-1)
const alongPath = (path: Vec2[], u: number) => {
  const segs = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  const total = segs.reduce((a, b) => a + b, 0) || 1;
  let d = Math.min(Math.max(u, 0), 1) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) {
      const k = segs[i] ? Math.min(d / segs[i], 1) : 0;
      const [a, b] = [path[i], path[i + 1]];
      return { x: a[0] + (b[0] - a[0]) * k, z: a[1] + (b[1] - a[1]) * k, heading: Math.atan2(b[0] - a[0], b[1] - a[1]) };
    }
    d -= segs[i];
  }
  return { x: path[0][0], z: path[0][1], heading: 0 };
};

// Kedudukan watak pada frame semasa (dikongsi dengan kamera untuk "follow")
export const actorPosition = (a: RiggedActor, progress: number) => {
  if (!a.path || a.path.length < 2) return { x: a.x ?? 0, z: a.z ?? 0, moving: false, heading: ((a.facing ?? 0) * Math.PI) / 180 };
  const start = a.pathStart ?? 0, end = a.pathEnd ?? 1;
  const u = interpolate(progress, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const p = alongPath(a.path, u);
  return { x: p.x, z: p.z, moving: progress >= start && progress < end, heading: p.heading };
};

const useClips = () => {
  const gltfs = useGLTF(ANIM_FILES.map((f) => staticFile(f)));
  return useMemo(() => {
    const seen = new Set<string>();
    return gltfs.flatMap((g) => g.animations).filter((c) => !seen.has(c.name) && seen.add(c.name));
  }, [gltfs]);
};

export const Rigged = ({ actor, index }: { actor: RiggedActor; index: number }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const gltf = useGLTF(staticFile(MODELS[actor.model] ?? MODELS.mannequin));
  const clips = useClips();

  const { root, mixer, baseHeight } = useMemo(() => {
    const obj = cloneSkinned(gltf.scene);
    obj.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      o.castShadow = true;
      o.receiveShadow = true;
      o.frustumCulled = false; // skinned mesh boleh keluar bounding box asal semasa animasi
      if (actor.color) {
        const m = (o.material as THREE.MeshStandardMaterial).clone();
        m.color = new THREE.Color(actor.color).lerp(new THREE.Color('#fff'), 0.3); // tint (darab tekstur)
        o.material = m;
      }
    });
    const size = new THREE.Box3().setFromObject(gltf.scene).getSize(new THREE.Vector3());
    return { root: obj, mixer: new THREE.AnimationMixer(obj), baseHeight: size.y || 1 };
  }, [gltf, actor.color]);

  const progress = frame / durationInFrames;
  const pos = actorPosition(actor, progress);
  const hasPath = !!actor.path && actor.path.length > 1;
  const arrived = hasPath && progress >= (actor.pathEnd ?? 1);
  const clipName = arrived ? actor.endClip ?? 'idle' : actor.clip ?? (hasPath ? 'walk' : 'idle');
  const clip = resolveClip(clipName, clips, 'idle');

  // Seek deterministik: satu action aktif, masa = frame/fps (dalam render, bukan useFrame)
  mixer.stopAllAction();
  const action = mixer.clipAction(clip);
  action.reset().play();
  const startFrame = arrived ? Math.round((actor.pathEnd ?? 1) * durationInFrames) : 0;
  mixer.setTime(((frame - startFrame) / fps) * (actor.speed ?? 1) + (actor.offset ?? index * 0.37));
  root.updateMatrixWorld(true);

  return (
    <group position={[pos.x, 0, pos.z]} rotation={[0, pos.heading, 0]} scale={(actor.height ?? 1.6) / baseHeight}>
      <primitive object={root} />
    </group>
  );
};

[MODELS.mannequin, ...ANIM_FILES].forEach((f) => useGLTF.preload(staticFile(f)));
