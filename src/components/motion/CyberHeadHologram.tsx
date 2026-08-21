import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles as ThreeSparkles } from '@react-three/drei';
import * as THREE from 'three';
import { FaceData } from '../../types/gestures';

interface CyberHeadHologramProps {
  face: FaceData;
}

const CyberHead3DMesh: React.FC<{ face: FaceData }> = ({ face }) => {
  const headGroupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (headGroupRef.current) {
      const targetYaw = -(face.headRotation.yaw * Math.PI) / 180;
      const targetPitch = (face.headRotation.pitch * Math.PI) / 180;
      const targetRoll = (face.headRotation.roll * Math.PI) / 180;

      headGroupRef.current.rotation.y = THREE.MathUtils.lerp(headGroupRef.current.rotation.y, targetYaw, 0.2);
      headGroupRef.current.rotation.x = THREE.MathUtils.lerp(headGroupRef.current.rotation.x, targetPitch, 0.2);
      headGroupRef.current.rotation.z = THREE.MathUtils.lerp(headGroupRef.current.rotation.z, targetRoll, 0.2);
    }

    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.5;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 0.4;
  });

  const isMoving = Math.abs(face.headRotation.yaw) > 5 || Math.abs(face.headRotation.pitch) > 5 || face.mouthOpen;
  const themeColor = isMoving ? '#22c55e' : '#f97316';

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      <pointLight position={[0, 0, 3]} intensity={2} color={themeColor} />

      {/* 3D Holographic Head Group */}
      <group ref={headGroupRef} position={[0, 0, 0]}>
        {/* Main Cranium Hologram */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[1.2, 24, 24]} />
          <meshStandardMaterial color={themeColor} wireframe transparent opacity={0.6} />
        </mesh>

        {/* Visor Eye Band */}
        <mesh position={[0, 0.35, 0.9]}>
          <boxGeometry args={[1.6, 0.4, 0.5]} />
          <meshStandardMaterial color={isMoving ? '#4ade80' : '#fb923c'} metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Nose Tip Beacon */}
        <mesh position={[0, 0.05, 1.25]}>
          <coneGeometry args={[0.2, 0.5, 16]} />
          <meshStandardMaterial color={themeColor} />
        </mesh>

        {/* Jaw Structure */}
        <mesh position={[0, -0.7, 0.2]}>
          <boxGeometry args={[1.1, 0.7, 1.1]} />
          <meshStandardMaterial color={themeColor} wireframe transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Orbiting Orbital Target Rings */}
      <mesh ref={ring1Ref} position={[0, 0, 0]}>
        <torusGeometry args={[2.2, 0.03, 16, 100]} />
        <meshBasicMaterial color={themeColor} wireframe />
      </mesh>

      <mesh ref={ring2Ref} position={[0, 0, 0]}>
        <torusGeometry args={[2.6, 0.02, 16, 100]} />
        <meshBasicMaterial color="#38bdf8" wireframe />
      </mesh>

      <ThreeSparkles count={50} scale={6} size={3} speed={0.4} color={themeColor} />
    </>
  );
};

export const CyberHeadHologram: React.FC<CyberHeadHologramProps> = ({ face }) => {
  return (
    <div className="relative w-full h-[350px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col items-center justify-center">
      {/* Overlay Banner */}
      <div className="absolute top-3 left-4 z-20 font-mono text-xs flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="font-bold text-slate-200">PRO 3D HOLOGRAPHIC HEAD RECON MATRIX</span>
        <span className="text-slate-500">| Real-time 3D Telemetry</span>
      </div>

      <div className="w-full h-full">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <CyberHead3DMesh face={face} />
        </Canvas>
      </div>

      {/* Bottom Telemetry Metrics */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex justify-between font-mono text-[11px] bg-slate-900/80 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
        <span>PITCH: <strong className="text-cyan-400">{Math.round(face.headRotation.pitch)}°</strong></span>
        <span>YAW: <strong className="text-cyan-400">{Math.round(face.headRotation.yaw)}°</strong></span>
        <span>ROLL: <strong className="text-cyan-400">{Math.round(face.headRotation.roll)}°</strong></span>
        <span>MOUTH: <strong className={face.mouthOpen ? 'text-emerald-400' : 'text-slate-400'}>{face.mouthOpen ? 'OPEN' : 'CLOSED'}</strong></span>
      </div>
    </div>
  );
};
