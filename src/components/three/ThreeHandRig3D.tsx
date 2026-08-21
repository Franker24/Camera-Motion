import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles as ThreeSparkles } from '@react-three/drei';
import * as THREE from 'three';
import { HandData } from '../../types/gestures';

const FINGER_BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4],         // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],         // Index
  [0, 9], [9, 10], [10, 11], [11, 12],    // Middle
  [0, 13], [13, 14], [14, 15], [15, 16],  // Ring
  [0, 17], [17, 18], [18, 19], [19, 20],  // Pinky
];

interface ThreeHandRig3DProps {
  hand?: HandData;
}

const CyberneticHandMesh: React.FC<{ hand?: HandData }> = ({ hand }) => {
  const jointRefs = useRef<{ [key: number]: THREE.Mesh | null }>({});
  const boneRefs = useRef<{ [key: string]: THREE.Mesh | null }>({});
  const arcReactorRef = useRef<THREE.Mesh | null>(null);

  useFrame((_, delta) => {
    if (!hand || !hand.landmarks || hand.landmarks.length < 21) return;

    const lm = hand.landmarks;
    const isPinching = hand.isPinching;
    const themeColor = isPinching ? '#f43f5e' : '#06b6d4';

    // Map 2D/3D landmarks to Three.js coordinates
    const getPos = (idx: number) => {
      const p = lm[idx];
      return new THREE.Vector3((0.5 - p.x) * 6, (0.5 - p.y) * 4, -p.z * 5);
    };

    // Update 21 Joint Spheres
    lm.forEach((_, idx) => {
      const mesh = jointRefs.current[idx];
      if (mesh) {
        mesh.position.lerp(getPos(idx), 0.3);
      }
    });

    // Update Bone Cylinders connecting joints
    FINGER_BONES.forEach(([i1, i2]) => {
      const key = `${i1}-${i2}`;
      const boneMesh = boneRefs.current[key];
      if (!boneMesh) return;

      const p1 = getPos(i1);
      const p2 = getPos(i2);

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);

      boneMesh.position.copy(mid);
      boneMesh.scale.set(1, dist, 1);
      boneMesh.lookAt(p2);
      boneMesh.rotateX(Math.PI / 2);
    });

    // Update ARC Reactor Palm Node (Landmark 9)
    if (arcReactorRef.current && lm[9]) {
      arcReactorRef.current.position.copy(getPos(9));
      arcReactorRef.current.rotation.z += delta * 2;
    }
  });

  if (!hand || !hand.landmarks || hand.landmarks.length < 21) {
    return null;
  }

  const isPinching = hand.isPinching;
  const themeColor = isPinching ? '#f43f5e' : '#06b6d4';

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.8} />
      <pointLight position={[0, 0, 3]} intensity={2} color={themeColor} />

      {/* 21 Joint Spheres */}
      {hand.landmarks.map((_, idx) => (
        <mesh
          key={idx}
          ref={(el) => (jointRefs.current[idx] = el)}
        >
          <sphereGeometry args={[idx === 8 || idx === 4 ? 0.18 : 0.12, 16, 16]} />
          <meshStandardMaterial
            color={idx === 8 ? (isPinching ? '#f43f5e' : '#38bdf8') : '#06b6d4'}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Bone Cylinders */}
      {FINGER_BONES.map(([i1, i2]) => {
        const key = `${i1}-${i2}`;
        return (
          <mesh
            key={key}
            ref={(el) => (boneRefs.current[key] = el)}
          >
            <cylinderGeometry args={[0.05, 0.05, 1, 12]} />
            <meshStandardMaterial color={themeColor} metalness={0.9} roughness={0.1} />
          </mesh>
        );
      })}

      {/* Stark ARC Reactor Palm Core */}
      <mesh ref={arcReactorRef}>
        <torusGeometry args={[0.35, 0.08, 16, 32]} />
        <meshBasicMaterial color={themeColor} wireframe />
      </mesh>

      <ThreeSparkles count={40} scale={6} size={3} speed={0.4} color={themeColor} />
    </>
  );
};

export const ThreeHandRig3D: React.FC<ThreeHandRig3DProps> = ({ hand }) => {
  return (
    <div className="relative w-full h-[400px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Top Banner */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-xl font-mono text-xs text-slate-200">
        <div className="flex items-center gap-2 font-bold text-cyan-300">
          <span>🤖 3D CYBERNETIC HAND RIG (THREE-MEDIAPIPE-RIG)</span>
        </div>
        <span className="text-slate-400">
          {hand ? `Hand Active: ${hand.handedness} (${hand.gesture})` : 'Waiting for Hand...'}
        </span>
      </div>

      <div className="w-full h-full">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <OrbitControls makeDefault />
          <CyberneticHandMesh hand={hand} />
        </Canvas>
      </div>
    </div>
  );
};
