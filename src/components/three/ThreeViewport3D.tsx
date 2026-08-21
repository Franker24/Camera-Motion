import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Float, MeshWobbleMaterial, Sparkles as ThreeSparkles } from '@react-three/drei';
import * as THREE from 'three';
import { MotionState } from '../../types/motion';
import { Box, Circle, Move, Zap, Layers, Sparkles } from 'lucide-react';

interface ThreeViewport3DProps {
  motionState: MotionState;
}

interface PhysicsBody {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: string;
  type: 'box' | 'sphere' | 'torus';
  isGrabbed: boolean;
}

// ================= MODE 1: STUDIO 3D =================
const InteractiveObjectsScene: React.FC<{
  motionState: MotionState;
  selectedObject: string;
}> = ({ motionState, selectedObject }) => {
  const cubeRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);

  const hands = motionState.hands;
  const primaryHand = hands[0];
  const secondaryHand = hands[1];

  useFrame(() => {
    if (!primaryHand) return;

    const px = (motionState.pointer.x - 0.5) * 6;
    const py = -(motionState.pointer.y - 0.5) * 4;
    const isPinching = primaryHand.isPinching;

    const headYaw = (motionState.face.headRotation.yaw * Math.PI) / 180;

    let targetMesh: THREE.Mesh | null = null;
    if (selectedObject === 'cube') targetMesh = cubeRef.current;
    if (selectedObject === 'sphere') targetMesh = sphereRef.current;
    if (selectedObject === 'torus') targetMesh = torusRef.current;

    if (targetMesh && isPinching) {
      targetMesh.position.lerp(new THREE.Vector3(px, py, targetMesh.position.z), 0.2);
      targetMesh.rotation.y += 0.05 + headYaw * 0.1;
      targetMesh.rotation.x += 0.03;
    }

    if (targetMesh && hands.length >= 2 && primaryHand && secondaryHand) {
      const dist = Math.hypot(
        primaryHand.pointer.x - secondaryHand.pointer.x,
        primaryHand.pointer.y - secondaryHand.pointer.y
      );
      const scaleVal = Math.max(0.5, Math.min(3, dist * 4));
      targetMesh.scale.lerp(new THREE.Vector3(scaleVal, scaleVal, scaleVal), 0.2);
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />

      <Grid args={[20, 20]} cellColor="#1e293b" sectionColor="#06b6d4" fadeDistance={30} />

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={cubeRef} position={[-2, 1, 0]}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial
            color={selectedObject === 'cube' ? '#06b6d4' : '#3b82f6'}
            wireframe={selectedObject === 'cube'}
          />
        </mesh>
      </Float>

      <Float speed={3} rotationIntensity={0.8} floatIntensity={0.8}>
        <mesh ref={sphereRef} position={[0, 1.5, 0]}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshWobbleMaterial
            color={selectedObject === 'sphere' ? '#ec4899' : '#a855f7'}
            factor={0.4}
            speed={2}
          />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={1} floatIntensity={0.6}>
        <mesh ref={torusRef} position={[2, 1, 0]}>
          <torusGeometry args={[1, 0.4, 16, 100]} />
          <meshStandardMaterial
            color={selectedObject === 'torus' ? '#10b981' : '#059669'}
            metalness={0.6}
            roughness={0.2}
          />
        </mesh>
      </Float>
    </>
  );
};

// ================= MODE 2: PHYSICS GRAVITY PLAYGROUND =================
const PhysicsGravityScene: React.FC<{ motionState: MotionState }> = ({ motionState }) => {
  const bodiesRef = useRef<PhysicsBody[]>([
    { id: 1, position: new THREE.Vector3(-2, 3, 0), velocity: new THREE.Vector3(0, 0, 0), color: '#06b6d4', type: 'box', isGrabbed: false },
    { id: 2, position: new THREE.Vector3(0, 4, 0), velocity: new THREE.Vector3(0, 0, 0), color: '#ec4899', type: 'sphere', isGrabbed: false },
    { id: 3, position: new THREE.Vector3(2, 3.5, 0), velocity: new THREE.Vector3(0, 0, 0), color: '#a855f7', type: 'torus', isGrabbed: false },
  ]);

  const meshRefs = useRef<{ [key: number]: THREE.Mesh | null }>({});
  const primaryHand = motionState.hands[0];

  useFrame((_, delta) => {
    const gravity = 9.8;
    const handX = (motionState.pointer.x - 0.5) * 6;
    const handY = -(motionState.pointer.y - 0.5) * 4;
    const isPinching = primaryHand ? primaryHand.isPinching : false;

    bodiesRef.current.forEach((body) => {
      const mesh = meshRefs.current[body.id];
      if (!mesh) return;

      const distToHand = Math.hypot(body.position.x - handX, body.position.y - handY);

      // Pinch Grab Magnetic Lock
      if (isPinching && distToHand < 1.8) {
        body.isGrabbed = true;
        body.velocity.set((handX - body.position.x) * 15, (handY - body.position.y) * 15, 0);
        body.position.lerp(new THREE.Vector3(handX, handY, 0), 0.3);
      } else {
        body.isGrabbed = false;
        // Gravity & Velocity physics update
        body.velocity.y -= gravity * delta;
        body.position.addScaledVector(body.velocity, delta);

        // Ground Floor Bounce Collision (Y = -2.2)
        if (body.position.y < -2.2) {
          body.position.y = -2.2;
          body.velocity.y *= -0.65; // Elastic bounce loss
          body.velocity.x *= 0.9;
        }

        // Side Wall Collisions (X = -3.5 to +3.5)
        if (Math.abs(body.position.x) > 3.5) {
          body.position.x = Math.sign(body.position.x) * 3.5;
          body.velocity.x *= -0.7;
        }
      }

      mesh.position.copy(body.position);
      if (!body.isGrabbed) {
        mesh.rotation.x += delta * 1.5;
        mesh.rotation.y += delta * 2;
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      <pointLight position={[0, 0, 3]} intensity={1} color="#38bdf8" />

      {bodiesRef.current.map((body) => (
        <mesh
          key={body.id}
          ref={(el) => (meshRefs.current[body.id] = el)}
          position={body.position.toArray()}
        >
          {body.type === 'box' && <boxGeometry args={[1.2, 1.2, 1.2]} />}
          {body.type === 'sphere' && <sphereGeometry args={[0.8, 32, 32]} />}
          {body.type === 'torus' && <torusGeometry args={[0.8, 0.3, 16, 80]} />}

          <meshStandardMaterial color={body.color} metalness={0.7} roughness={0.2} />
        </mesh>
      ))}

      <ThreeSparkles count={40} scale={8} size={3} speed={0.4} color="#06b6d4" />
    </>
  );
};

export const ThreeViewport3D: React.FC<ThreeViewport3DProps> = ({ motionState }) => {
  const [viewMode, setViewMode] = useState<'studio' | 'physics-ar'>('studio');
  const [selectedObject, setSelectedObject] = useState<'cube' | 'sphere' | 'torus'>('cube');

  return (
    <div className="relative w-full h-[600px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Top Controls Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-xl font-mono text-xs">
        <div className="flex items-center gap-3">
          <Box className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-slate-100">3D SPATIAL INTERACTIVE VIEWPORT</span>
        </div>

        {/* Viewport Mode Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('studio')}
            className={`px-3 py-1.5 rounded-lg border font-bold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'studio'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            🎨 3D STUDIO MODE
          </button>
          <button
            onClick={() => setViewMode('physics-ar')}
            className={`px-3 py-1.5 rounded-lg border font-bold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'physics-ar'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            🚀 PHYSICS GRAVITY PLAYGROUND
          </button>
        </div>

        {/* Object Selectors for Studio mode */}
        {viewMode === 'studio' && (
          <div className="flex items-center gap-1.5">
            {(['cube', 'sphere', 'torus'] as const).map((obj) => (
              <button
                key={obj}
                onClick={() => setSelectedObject(obj)}
                className={`px-2.5 py-1 rounded-md border text-[11px] capitalize transition cursor-pointer ${
                  selectedObject === obj
                    ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {obj}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Instructions HUD */}
      <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-xl text-xs font-mono text-slate-300 space-y-1">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Move className="w-4 h-4" /> {viewMode === 'studio' ? 'Studio Controls:' : 'Physics Gravity Controls:'}
        </div>
        {viewMode === 'studio' ? (
          <>
            <div>• Pinch Hand & Move: Drag selected 3D Object</div>
            <div>• Head Yaw (Turn Head): Rotates Object in 3D</div>
            <div>• Two Hands Pinch: Scale Object Uniformly</div>
          </>
        ) : (
          <>
            <div>• Simulated 3D Gravity & Elastic Bouncing Floor</div>
            <div>• Pinch Hand near 3D Mesh: Magnetic Tractor Beam Grab</div>
            <div>• Release Pinch: Launch & Throw 3D Mesh in Space!</div>
          </>
        )}
      </div>

      {/* 3D Canvas Rendering */}
      <div className="w-full h-full">
        <Canvas camera={{ position: [0, 1, 7], fov: 50 }}>
          {viewMode === 'studio' ? (
            <>
              <OrbitControls makeDefault />
              <InteractiveObjectsScene motionState={motionState} selectedObject={selectedObject} />
            </>
          ) : (
            <PhysicsGravityScene motionState={motionState} />
          )}
        </Canvas>
      </div>
    </div>
  );
};
