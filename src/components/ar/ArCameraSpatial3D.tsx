import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles as ThreeSparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { MotionState } from '../../types/motion';
import { CameraView } from '../camera/CameraView';
import { Eye, Layers, Sparkles } from 'lucide-react';

interface ArCameraSpatial3DProps {
  motionState: MotionState;
  videoRef: React.RefObject<HTMLVideoElement>;
  isFrontFacing?: boolean;
}

const AR3DLayer: React.FC<{ motionState: MotionState }> = ({ motionState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const primaryHand = motionState.hands[0];
  const face = motionState.face;

  useFrame(() => {
    // Map hand pointer or face head rotation to 3D object positioning
    const px = (motionState.pointer.x - 0.5) * 5;
    const py = -(motionState.pointer.y - 0.5) * 3.5;

    if (meshRef.current) {
      if (motionState.pointer.active) {
        meshRef.current.position.lerp(new THREE.Vector3(px, py, 0), 0.15);
      } else {
        meshRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.05);
      }

      // Head pitch/yaw rotation reaction
      const radYaw = (face.headRotation.yaw * Math.PI) / 180;
      const radPitch = (face.headRotation.pitch * Math.PI) / 180;

      meshRef.current.rotation.y = radYaw;
      meshRef.current.rotation.x = radPitch;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += 0.02;
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[0, 0, 2]} intensity={2} color="#06b6d4" />

      {/* Futuristic Holographic Sphere attached to user hands/face */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <MeshDistortMaterial
          color={primaryHand?.isPinching ? '#f43f5e' : '#06b6d4'}
          distort={0.4}
          speed={3}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Orbiting Ring */}
      <mesh ref={ringRef} position={[0, 0, 0]}>
        <torusGeometry args={[1.4, 0.05, 16, 100]} />
        <meshBasicMaterial color="#a855f7" wireframe />
      </mesh>

      <ThreeSparkles count={50} scale={6} size={3} speed={0.4} color="#38bdf8" />
    </>
  );
};

export const ArCameraSpatial3D: React.FC<ArCameraSpatial3DProps> = ({
  motionState,
  videoRef,
  isFrontFacing = true,
}) => {
  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Live Video Feed Background */}
      <div className="absolute inset-0">
        <CameraView
          videoRef={videoRef}
          isFrontFacing={isFrontFacing}
          hands={motionState.hands}
          face={motionState.face}
          showHandsOverlay={true}
          showFaceOverlay={true}
          className="w-full h-full rounded-none"
        />
      </div>

      {/* Three.js AR 3D Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <AR3DLayer motionState={motionState} />
        </Canvas>
      </div>

      {/* AR HUD Badge */}
      <div className="absolute top-4 left-4 z-30 bg-slate-900/90 backdrop-blur border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-slate-200 flex items-center gap-2">
        <Eye className="w-4 h-4 text-cyan-400" />
        <span className="font-bold text-cyan-300">Spatial AR Viewport</span>
        <span className="text-slate-500">| Live Video + 3D Mesh Overlay</span>
      </div>
    </div>
  );
};
