// Set ringkas gaya voxel (kiub MagicaVoxel, satu InstancedMesh) atau paper (kadbod/kertas, toon + outline).
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Edges } from '@react-three/drei';
import { random } from 'remotion';
import * as THREE from 'three';

export type SetStyle = 'voxel' | 'paper';
export type StyledSet = 'room' | 'office' | 'street' | 'studio';

type V3 = [number, number, number];
type Block = { pos: V3; size: V3; color: string }; // pos = tengah bawah blok

const B = (x: number, y: number, z: number, w: number, h: number, d: number, color: string): Block => ({ pos: [x, y, z], size: [w, h, d], color });

const desk = (x: number, z: number): Block[] => [
  B(x, 0.7, z, 1.4, 0.06, 0.7, '#8a5a3a'),
  B(x - 0.62, 0, z, 0.08, 0.7, 0.6, '#5a3a24'), B(x + 0.62, 0, z, 0.08, 0.7, 0.6, '#5a3a24'),
  B(x, 0.76, z - 0.15, 0.6, 0.4, 0.05, '#222831'), B(x, 0.76, z - 0.12, 0.52, 0.32, 0.02, '#7fd4ff'),
  B(x, 0, z + 0.65, 0.5, 0.45, 0.5, '#2f3640'), B(x, 0.45, z + 0.88, 0.5, 0.55, 0.06, '#2f3640'),
];

const tree = (x: number, z: number): Block[] => [B(x, 0, z, 0.2, 1.0, 0.2, '#6b4a2a'), B(x, 1.0, z, 0.9, 0.9, 0.9, '#4caf50'), B(x, 1.6, z, 0.5, 0.4, 0.5, '#66c35a')];

const LAYOUTS: Record<StyledSet, { blocks: Block[]; sky: string }> = {
  room: {
    sky: '#f6d7b0',
    blocks: [
      B(0, -0.1, 0, 8, 0.1, 8, '#c89b6d'), B(0, 0, -2.6, 8, 3, 0.2, '#f2e6d0'), B(-3.2, 0, 0, 0.2, 3, 8, '#e8d6b8'),
      B(1.6, 0, -1.9, 2, 0.4, 1.2, '#7a5236'), B(1.6, 0.4, -1.9, 1.9, 0.18, 1.1, '#f5f5f5'), B(1.6, 0.58, -1.9, 1.2, 0.1, 1.05, '#5b8def'),
      B(1.0, 0.58, -2.3, 0.5, 0.12, 0.3, '#ffffff'),
      B(-1.8, 0, -2.2, 1.2, 1.8, 0.5, '#9a6b47'), B(-1.8, 0.9, -1.95, 1.1, 0.04, 0.02, '#5a3a24'),
      B(0, 1.2, -2.48, 1.2, 0.9, 0.05, '#9fd8ff'), B(-0.8, 0, 1.2, 1.6, 0.02, 1.0, '#e57373'),
      B(2.9, 0, -2.2, 0.4, 0.5, 0.4, '#7a5236'), B(2.9, 0.5, -2.2, 0.15, 0.25, 0.15, '#ffd54f'),
    ],
  },
  office: {
    sky: '#cfe3f2',
    blocks: [
      B(0, -0.1, 0, 10, 0.1, 10, '#6d7a8c'), B(0, 0, -2.6, 10, 3, 0.2, '#e3e8ee'),
      B(-1.2, 1.1, -2.48, 1.6, 1.0, 0.05, '#bfe3ff'), B(1.2, 1.1, -2.48, 1.6, 1.0, 0.05, '#bfe3ff'),
      ...desk(-1.6, -1.2), ...desk(1.6, -1.2),
      B(3.6, 0, -2.0, 0.5, 0.4, 0.5, '#8d6e63'), B(3.6, 0.4, -2.0, 0.7, 0.9, 0.7, '#43a047'),
      B(-3.8, 0, -2.0, 0.8, 1.9, 0.6, '#90a4ae'),
    ],
  },
  street: {
    sky: '#9fd3ff',
    blocks: [
      B(0, -0.1, 0, 30, 0.1, 14, '#7cb342'), B(0, -0.05, 0, 30, 0.06, 3, '#444a52'),
      ...Array.from({ length: 8 }, (_, i) => B(-10.5 + i * 3, 0.01, 0, 1.2, 0.01, 0.15, '#f5f5f5')),
      B(0, 0, -2.2, 30, 0.12, 1.4, '#bdbdbd'),
      B(-6, 0, -5, 3.5, 4, 3, '#ef9a9a'), B(-1.5, 0, -5, 3.5, 3, 3, '#fff59d'), B(3, 0, -5, 3.5, 5, 3, '#90caf9'), B(7.5, 0, -5, 3.5, 3.5, 3, '#ce93d8'),
      ...[-6, -1.5, 3, 7.5].flatMap((x) => [B(x - 0.8, 1.2, -3.48, 0.8, 0.8, 0.05, '#e3f2fd'), B(x + 0.8, 1.2, -3.48, 0.8, 0.8, 0.05, '#e3f2fd')]),
      ...tree(-8.2, -2.5), ...tree(0.8, -2.6), ...tree(5.3, -2.5),
      B(2.2, 0, -1.8, 0.1, 2.4, 0.1, '#616161'), B(2.2, 2.4, -1.6, 0.25, 0.12, 0.5, '#fff8e1'),
    ],
  },
  studio: {
    sky: '#1b1630',
    blocks: [B(0, -0.15, 0, 5, 0.15, 5, '#3a2f5c'), B(0, 0, -2.5, 5, 3, 0.15, '#2a2244')],
  },
};

export const styledSky = (set: StyledSet) => LAYOUTS[set].sky;

// ---------------------------------------------------------------- voxel

const VOXEL = 0.2;

const VoxelSet = ({ blocks }: { blocks: Block[] }) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const cells = useMemo(() => blocks.flatMap((b, bi) => {
    const n = b.size.map((s) => Math.max(1, Math.round(s / VOXEL))) as V3;
    const cell = b.size.map((s, i) => s / n[i]) as V3;
    const out: { p: V3; s: V3; c: THREE.Color }[] = [];
    const base = new THREE.Color(b.color);
    for (let i = 0; i < n[0]; i++) for (let j = 0; j < n[1]; j++) for (let k = 0; k < n[2]; k++) {
      // isi sahaja kulit luar blok (dalam tak nampak) supaya bilangan instance kecil
      if (i && j && k && i < n[0] - 1 && j < n[1] - 1 && k < n[2] - 1) continue;
      const jitter = 0.9 + random(`v${bi}-${i}-${j}-${k}`) * 0.16;
      out.push({
        p: [b.pos[0] - b.size[0] / 2 + cell[0] * (i + 0.5), b.pos[1] + cell[1] * (j + 0.5), b.pos[2] - b.size[2] / 2 + cell[2] * (k + 0.5)],
        s: cell, c: base.clone().multiplyScalar(jitter),
      });
    }
    return out;
  }), [blocks]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    cells.forEach((c, i) => {
      m.compose(new THREE.Vector3(...c.p), new THREE.Quaternion(), new THREE.Vector3(c.s[0], c.s[1], c.s[2]));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.c);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [cells]);

  return (
    <instancedMesh key={cells.length} ref={ref} args={[undefined, undefined, cells.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.9} />
    </instancedMesh>
  );
};

// ---------------------------------------------------------------- paper

const usePaperTexture = () => useMemo(() => {
  const size = 128, data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const v = 225 + random(`p${i}`) * 30;
    data.set([v, v, v * 0.97, 255], i * 4);
  }
  const tex = new THREE.DataTexture(data, size, size);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}, []);

const PaperSet = ({ blocks }: { blocks: Block[] }) => {
  const tex = usePaperTexture();
  return (
    <>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.pos[0], b.pos[1] + b.size[1] / 2, b.pos[2]]} rotation={[0, (random(`r${i}`) - 0.5) * 0.04, 0]} castShadow receiveShadow>
          <boxGeometry args={b.size} />
          <meshToonMaterial color={b.color} map={tex} />
          <Edges threshold={15} color="#2b2118" />
        </mesh>
      ))}
    </>
  );
};

export const StyledSetView = ({ set, style }: { set: StyledSet; style: SetStyle }) => {
  const { blocks } = LAYOUTS[set] ?? LAYOUTS.studio;
  return style === 'voxel' ? <VoxelSet blocks={blocks} /> : <PaperSet blocks={blocks} />;
};
