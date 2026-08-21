import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Float } from '@react-three/drei';
import * as THREE from 'three';
import { MotionState } from '../../types/motion';
import { ShapeRecognizer } from '../../services/shapeRecognizer';
import { Paintbrush, Eraser, Sparkles, RefreshCw, Palette, Layers } from 'lucide-react';

interface StrokePoint {
  x: number;
  y: number;
  z: number;
}

interface Stroke {
  id: string;
  points: THREE.Vector3[];
  color: string;
  size: number;
}

interface AirCanvas3DProps {
  motionState: MotionState;
}

const Canvas3DScene: React.FC<{
  strokes: Stroke[];
  currentStroke: THREE.Vector3[];
  currentColor: string;
  currentSize: number;
  pointerPos: THREE.Vector3;
  isPinching: boolean;
}> = ({ strokes, currentStroke, currentColor, currentSize, pointerPos, isPinching }) => {
  const pointerMeshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (pointerMeshRef.current) {
      pointerMeshRef.current.position.lerp(pointerPos, 0.3);
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[pointerPos.x, pointerPos.y, pointerPos.z]} intensity={2} color={currentColor} />

      {/* Render Finished Strokes */}
      {strokes.map((stroke) => (
        <Line
          key={stroke.id}
          points={stroke.points}
          color={stroke.color}
          lineWidth={stroke.size * 5}
        />
      ))}

      {/* Render Active Stroke */}
      {currentStroke.length > 1 && (
        <Line points={currentStroke} color={currentColor} lineWidth={currentSize * 6} />
      )}

      {/* 3D Pointer Cursor */}
      <mesh ref={pointerMeshRef} position={pointerPos}>
        <sphereGeometry args={[isPinching ? 0.15 : 0.08, 16, 16]} />
        <meshStandardMaterial
          color={isPinching ? '#f43f5e' : currentColor}
          emissive={isPinching ? '#f43f5e' : currentColor}
          emissiveIntensity={0.8}
        />
      </mesh>
    </>
  );
};

export const AirCanvas3D: React.FC<AirCanvas3DProps> = ({ motionState }) => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<THREE.Vector3[]>([]);
  const [currentColor, setCurrentColor] = useState<string>('#06b6d4');
  const [currentSize, setCurrentSize] = useState<number>(0.05);
  const [recognizedShape, setRecognizedShape] = useState<string>('Draw in air...');

  const primaryHand = motionState.hands[0];
  const isPinching = primaryHand ? primaryHand.isPinching : false;

  // Map 2D pointer (0 to 1) into 3D world coordinates
  const pointer3D = new THREE.Vector3(
    (motionState.pointer.x - 0.5) * 8,
    -(motionState.pointer.y - 0.5) * 6,
    (motionState.pointer.z || 0) * 4
  );

  const raw2DPointsRef = useRef<{ x: number; y: number }[]>([]);

  // Update stroke drawing
  useEffect(() => {
    if (motionState.pointer.active && isPinching) {
      setCurrentStroke((prev) => [...prev, pointer3D.clone()]);
      raw2DPointsRef.current.push({ x: motionState.pointer.x, y: motionState.pointer.y });
    } else if (!isPinching && currentStroke.length > 0) {
      // Stroke ended -> save
      const newStroke: Stroke = {
        id: `stroke_${Date.now()}`,
        points: [...currentStroke],
        color: currentColor,
        size: currentSize,
      };

      setStrokes((prev) => [...prev, newStroke]);
      setCurrentStroke([]);

      // Attempt shape recognition
      if (raw2DPointsRef.current.length > 10) {
        const result = ShapeRecognizer.recognize(raw2DPointsRef.current);
        if (result.shape !== 'unknown') {
          setRecognizedShape(`Recognized: ${result.shape.toUpperCase()} (${Math.round(result.confidence * 100)}%)`);
        }
      }
      raw2DPointsRef.current = [];
    }
  }, [isPinching, motionState.pointer.active, motionState.pointer.x, motionState.pointer.y]);

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setRecognizedShape('Canvas Cleared');
  };

  return (
    <div className="relative w-full h-[600px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* HUD Header */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3">
        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-slate-200 flex items-center gap-2">
          <Paintbrush className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-cyan-300">3D Air Canvas</span>
          <span className="text-slate-500">| Pinch thumb & index to draw</span>
        </div>

        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono text-purple-300">
          <Sparkles className="w-4 h-4 inline mr-1 text-purple-400" />
          {recognizedShape}
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-xl">
        {/* Colors */}
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-slate-400" />
          {['#06b6d4', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ffffff'].map((color) => (
            <button
              key={color}
              onClick={() => setCurrentColor(color)}
              style={{ backgroundColor: color }}
              className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                currentColor === color ? 'border-white scale-125 shadow-lg' : 'border-transparent hover:scale-110'
              }`}
            />
          ))}
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
          <span>Brush:</span>
          {[0.02, 0.05, 0.09].map((sz, idx) => (
            <button
              key={sz}
              onClick={() => setCurrentSize(sz)}
              className={`px-2 py-1 rounded border transition cursor-pointer ${
                currentSize === sz ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {['Small', 'Med', 'Large'][idx]}
            </button>
          ))}
        </div>

        {/* Clear Action */}
        <button
          onClick={clearCanvas}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-semibold hover:bg-rose-500/30 transition cursor-pointer"
        >
          <Eraser className="w-4 h-4" />
          Clear Air Canvas
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <div className="w-full h-full">
        <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
          <OrbitControls enableZoom enableRotate />
          <Canvas3DScene
            strokes={strokes}
            currentStroke={currentStroke}
            currentColor={currentColor}
            currentSize={currentSize}
            pointerPos={pointer3D}
            isPinching={isPinching}
          />
        </Canvas>
      </div>
    </div>
  );
};
