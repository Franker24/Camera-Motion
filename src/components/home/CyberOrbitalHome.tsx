import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles as ThreeSparkles, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Link } from 'react-router-dom';
import { Sparkles, Smartphone, Monitor, Shield, Cpu, Activity, ArrowRight, Zap, Play } from 'lucide-react';

interface OrbitalNodeData {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  angle: number;
  radius: number;
}

const NODES_DATA: OrbitalNodeData[] = [
  { id: 'hand-rig', title: '3D HAND RIG', subtitle: 'Three.js 21-Joint Rigging', icon: '🤖', color: '#06b6d4', angle: 0, radius: 3.2 },
  { id: 'face-matrix', title: 'FACE MATRIX', subtitle: '468 3D Point Matrix', icon: '👤', color: '#22c55e', angle: (Math.PI * 2) / 5, radius: 3.2 },
  { id: 'handsfree', title: 'HANDS-FREE WEB', subtitle: 'Cyberpunk Web Navigation', icon: '🌐', color: '#a855f7', angle: ((Math.PI * 2) / 5) * 2, radius: 3.2 },
  { id: 'air-canvas', title: 'AIR CANVAS 3D', subtitle: 'Spatial Painting Studio', icon: '🎨', color: '#ec4899', angle: ((Math.PI * 2) / 5) * 3, radius: 3.2 },
  { id: 'arcade', title: 'MOTION ARCADE', subtitle: 'Dual Motion Minigames', icon: '🎮', color: '#f59e0b', angle: ((Math.PI * 2) / 5) * 4, radius: 3.2 },
];

const CyberOrbitalScene: React.FC<{ onNodeHover: (node: OrbitalNodeData | null) => void }> = ({ onNodeHover }) => {
  const coreRef = useRef<THREE.Mesh | null>(null);
  const ring1Ref = useRef<THREE.Group | null>(null);
  const ring2Ref = useRef<THREE.Group | null>(null);
  const ring3Ref = useRef<THREE.Group | null>(null);

  useFrame((_, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.4;
      coreRef.current.rotation.x += delta * 0.2;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.3;
    if (ring2Ref.current) ring2Ref.current.rotation.y -= delta * 0.25;
    if (ring3Ref.current) ring3Ref.current.rotation.x += delta * 0.2;
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[10, 10, 10]} intensity={2} color="#38bdf8" />
      <pointLight position={[0, 0, 0]} intensity={3} color="#06b6d4" />

      {/* Central Glowing Energy Core */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <group>
          <mesh ref={coreRef}>
            <icosahedronGeometry args={[1.1, 2]} />
            <meshStandardMaterial color="#06b6d4" wireframe roughness={0.1} metalness={0.9} />
          </mesh>

          <mesh>
            <sphereGeometry args={[0.75, 32, 32]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
          </mesh>
        </group>
      </Float>

      {/* Concentric Rotating Orbital Rings */}
      <group ref={ring1Ref}>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[3.2, 0.02, 16, 100]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.6} />
        </mesh>
      </group>

      <group ref={ring2Ref}>
        <mesh rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
          <torusGeometry args={[4.2, 0.02, 16, 100]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.5} />
        </mesh>
      </group>

      <group ref={ring3Ref}>
        <mesh rotation={[0, Math.PI / 3, Math.PI / 4]}>
          <torusGeometry args={[5.2, 0.015, 16, 100]} />
          <meshBasicMaterial color="#ec4899" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* 5 Floating Feature Orbital Nodes */}
      {NODES_DATA.map((node) => {
        const x = Math.cos(node.angle) * node.radius;
        const z = Math.sin(node.angle) * node.radius;

        return (
          <Float key={node.id} speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
            <group
              position={[x, 0, z]}
              onPointerOver={() => onNodeHover(node)}
              onPointerOut={() => onNodeHover(null)}
            >
              <mesh>
                <sphereGeometry args={[0.35, 24, 24]} />
                <meshStandardMaterial color={node.color} metalness={0.8} roughness={0.2} />
              </mesh>

              <mesh scale={1.3}>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshBasicMaterial color={node.color} wireframe transparent opacity={0.4} />
              </mesh>
            </group>
          </Float>
        );
      })}

      <ThreeSparkles count={120} scale={12} size={4} speed={0.4} color="#38bdf8" />
    </>
  );
};

export const CyberOrbitalHome: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<OrbitalNodeData | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden bg-cyber-grid">
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Hero Content Overlay */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4 w-full z-20 space-y-8">
        {/* Top Hero Headline */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 font-mono text-xs text-cyan-300 shadow-lg shadow-cyan-950/50 glow-cyan">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>ANTIGRAVITY CYBERNETIC VISION 2.0 ENGINE</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gradient-cyan uppercase">
            TOUCHLESS COMPUTER VISION MATRIX
          </h1>

          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Experience next-generation hands-free computer vision, 3D hand skeleton rigging, 468-point facial telemetry, and spatial WebGL control directly in your browser.
          </p>
        </div>

        {/* 3D Orbital Viewport Showcase */}
        <div className="relative w-full h-[450px] rounded-3xl overflow-hidden glass-panel border border-cyan-900/50 shadow-2xl flex items-center justify-center">
          <Canvas camera={{ position: [0, 2, 7.5], fov: 45 }}>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
            <CyberOrbitalScene onNodeHover={setHoveredNode} />
          </Canvas>

          {/* Floating Hover Node Info Card */}
          {hoveredNode && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-slate-950/90 backdrop-blur-xl border border-cyan-500/60 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-fade-in font-mono">
              <div className="text-3xl">{hoveredNode.icon}</div>
              <div>
                <h4 className="text-sm font-bold text-cyan-300">{hoveredNode.title}</h4>
                <p className="text-xs text-slate-400">{hoveredNode.subtitle}</p>
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 z-20 font-mono text-[11px] text-cyan-400/80 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span>[ 🔮 INTERACTIVE 3D ORBITAL MATRIX // DRAG TO ROTATE ]</span>
          </div>
        </div>

        {/* Call to Action Mode Switchers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Card 1: Enter Motion Lab */}
          <Link
            to="/lab"
            className="group glass-panel p-6 rounded-2xl border border-cyan-900/40 hover:border-cyan-500/60 transition-all flex flex-col justify-between space-y-4 glow-cyan"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-cyan-950/80 border border-cyan-700/50 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">FULL DASHBOARD</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition">
                Motion Control Lab
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Access full standalone motion dashboard with hands, face point cloud, theremin, & 3D viewport.
              </p>
            </div>
            <div className="flex items-center text-xs font-mono font-bold text-cyan-400 gap-2">
              <span>LAUNCH DASHBOARD</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Smartphone Sensor */}
          <Link
            to="/sensor"
            className="group glass-panel p-6 rounded-2xl border border-emerald-900/40 hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-4 glow-emerald"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-950/80 border border-emerald-700/50 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">MOBILE TRANSMITTER</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition">
                Mobile Camera Sensor
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Turn your smartphone camera into a wireless spatial telemetry transmitter streaming to PC over WebSockets.
              </p>
            </div>
            <div className="flex items-center text-xs font-mono font-bold text-emerald-400 gap-2">
              <span>OPEN MOBILE SENSOR</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: PC Motion Receiver */}
          <Link
            to="/pc-receiver"
            className="group glass-panel p-6 rounded-2xl border border-purple-900/40 hover:border-purple-500/60 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-950/80 border border-purple-700/50 rounded-xl text-purple-400 group-hover:scale-110 transition-transform">
                <Monitor className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-purple-400 font-bold">CAMERA-FREE RECEIVER</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-purple-300 transition">
                PC Motion Receiver
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Operate camera-free on PC. Receive live phone telemetry and control 3D hand skeleton & face matrix remotely.
              </p>
            </div>
            <div className="flex items-center text-xs font-mono font-bold text-purple-400 gap-2">
              <span>OPEN RECEIVER NODE</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
