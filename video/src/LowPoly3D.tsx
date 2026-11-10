import { useEffect, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { random, useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

export type Shape = 'icosahedron' | 'octahedron' | 'torusKnot' | 'crystal' | 'cube' | 'coin' | 'none';

export type Bg3d = {
  shape?: Shape;
  color?: string;
  floorColor?: string;
  gridColor?: string;
  sky?: string;
  pixelation?: number; // 0.15 (sangat pixel) - 1 (licin). PS2 ≈ 0.3
  speed?: number;
};

const geometryFor = (shape: Shape): THREE.BufferGeometry | null => {
  switch (shape) {
    case 'icosahedron': return new THREE.IcosahedronGeometry(1.4, 0);
    case 'octahedron': return new THREE.OctahedronGeometry(1.5, 0);
    case 'torusKnot': return new THREE.TorusKnotGeometry(1, 0.35, 32, 5);
    case 'crystal': return new THREE.ConeGeometry(1, 2.6, 5);
    case 'cube': return new THREE.BoxGeometry(1.8, 1.8, 1.8);
    case 'coin': return new THREE.CylinderGeometry(1.3, 1.3, 0.3, 10);
    case 'none': return null;
  }
};

// Bukit low-poly: plane dengan ketinggian rawak (seeded supaya setiap frame sama)
const useTerrain = () =>
  useMemo(() => {
    const geo = new THREE.PlaneGeometry(60, 60, 22, 22);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const distFromCenter = Math.abs(x);
      pos.setZ(i, random(`t${i}`) * (distFromCenter > 4 ? 3.2 : 0.4));
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

const Hero = ({ shape, color, speed }: { shape: Shape; color: string; speed: number }) => {
  const frame = useCurrentFrame();
  const geometry = useMemo(() => geometryFor(shape), [shape]);
  if (!geometry) return null;
  const t = (frame / 30) * speed;
  return (
    <mesh geometry={geometry} position={[0, -0.6 + Math.sin(t * 2) * 0.25, 0]} scale={0.8} rotation={[t * 0.6, t, t * 0.3]}>
      <meshStandardMaterial color={color} flatShading roughness={0.6} metalness={0.2} />
    </mesh>
  );
};

const Debris = ({ color }: { color: string }) => {
  const frame = useCurrentFrame();
  const items = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({
      x: (random(`x${i}`) - 0.5) * 12,
      y: random(`y${i}`) * 6 - 1,
      z: -random(`z${i}`) * 10 - 2,
      s: 0.15 + random(`s${i}`) * 0.3,
    })),
    [],
  );
  return (
    <>
      {items.map((it, i) => (
        <mesh key={i} position={[it.x, it.y + Math.sin(frame / 20 + i) * 0.3, it.z]} rotation={[frame / 25 + i, frame / 30, 0]}>
          <tetrahedronGeometry args={[it.s, 0]} />
          <meshStandardMaterial color={color} flatShading />
        </mesh>
      ))}
    </>
  );
};

const LookAtCenter = () => {
  const camera = useThree((state) => state.camera);
  useEffect(() => camera.lookAt(0, -0.8, 0), [camera]);
  return null;
};

export const LowPoly3D = ({ bg, accent }: { bg: Bg3d; accent: string }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const terrain = useTerrain();
  const sky = bg.sky ?? '#1a1030';
  const speed = bg.speed ?? 1;

  return (
    <ThreeCanvas
      width={width}
      height={height}
      dpr={bg.pixelation ?? 0.3}
      gl={{ antialias: false }}
      style={{ position: 'absolute', inset: 0, imageRendering: 'pixelated' }}
      camera={{ fov: 60, position: [0, 3, 8] }}
    >
      <LookAtCenter />
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, 6, 28]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]} intensity={1.6} />
      <pointLight position={[0, 3, 2]} intensity={8} color={accent} />
      <mesh geometry={terrain} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, -10 + ((frame * 0.05 * speed) % 2.7)]}>
        <meshStandardMaterial color={bg.floorColor ?? '#4a3590'} flatShading />
      </mesh>
      <mesh geometry={terrain} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.18, -10 + ((frame * 0.05 * speed) % 2.7)]}>
        <meshBasicMaterial color={bg.gridColor ?? '#25f4ee'} wireframe transparent opacity={0.35} />
      </mesh>
      <Hero shape={bg.shape ?? 'icosahedron'} color={bg.color ?? accent} speed={speed} />
      <Debris color={bg.color ?? accent} />
    </ThreeCanvas>
  );
};
