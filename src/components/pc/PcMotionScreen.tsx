import React, { useState } from 'react';
import { useMotionSocket } from '../../hooks/useMotionSocket';
import { MotionTelemetry } from '../motion/MotionTelemetry';
import { GestureIndicator } from '../motion/GestureIndicator';
import { AirCanvas3D } from '../air-canvas/AirCanvas3D';
import { ThreeViewport3D } from '../three/ThreeViewport3D';
import { HandsFreeWebShowcase } from '../hands-free/HandsFreeWebShowcase';
import { AirThereminAudio } from '../theremin/AirThereminAudio';
import { MotionArcade } from '../arcade/MotionArcade';
import { FaceMotionTracker } from '../motion/FaceMotionTracker';
import { ThreeHandRig3D } from '../three/ThreeHandRig3D';
import { Monitor, Smartphone, Wifi, Radio, Cpu, RefreshCw } from 'lucide-react';
import { MotionState } from '../../types/motion';

export const PcMotionScreen: React.FC = () => {
  const { isConnected, deviceId, connectedDevices, remoteMotionState } = useMotionSocket('receiver');
  const [activeTab, setActiveTab] = useState<'telemetry' | 'face-matrix' | 'hand-rig' | 'canvas' | '3d' | 'handsfree' | 'theremin' | 'arcade'>('telemetry');

  // Fallback empty MotionState if no remote data has arrived yet
  const defaultState: MotionState = remoteMotionState || {
    timestamp: Date.now(),
    deviceId: 'remote_sensor',
    role: 'sensor',
    fps: 0,
    hands: [],
    face: {
      faceDetected: false,
      headRotation: { pitch: 0, yaw: 0, roll: 0 },
      mouthOpen: false,
      mouthRatio: 0,
      blinking: false,
      leftEyeBlink: false,
      rightEyeBlink: false,
      smiling: false,
      smileRatio: 0,
      browRaised: false,
      headNod: false,
      headShake: false,
      facialGesture: 'NEUTRAL',
    },
    pointer: { x: 0.5, y: 0.5, z: 0, active: false },
    primaryGesture: 'NONE',
    camera: {
      active: true,
      deviceId: 'remote',
      facingMode: 'user',
      resolution: { width: 1280, height: 720 },
      fps: 30,
      label: 'Remote Smartphone Camera',
    },
  };

  const sensorDevice = connectedDevices.find((d) => d.role === 'sensor');

  return (
    <div className="space-y-6">
      {/* PC Receiver Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
            <Monitor className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              PC Motion Receiver Node
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Operating camera-free. Receiving live telemetry from remote Smartphone sensor over Socket.io
            </p>
          </div>
        </div>

        {/* Remote Connection Status Badge */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg">
            <Smartphone className={`w-4 h-4 ${sensorDevice ? 'text-emerald-400' : 'text-slate-600'}`} />
            <span className="text-slate-400">Sensor:</span>
            <span className={sensorDevice ? 'text-emerald-300 font-bold' : 'text-slate-500'}>
              {sensorDevice ? `CONNECTED (${sensorDevice.deviceId})` : 'WAITING FOR PHONE...'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg">
            <Wifi className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-rose-500'}`} />
            <span className={isConnected ? 'text-emerald-300 font-bold' : 'text-rose-400'}>
              {isConnected ? 'SOCKET OK' : 'DISCONNECTED'}
            </span>
          </div>
        </div>
      </div>

      {/* Experience Tab Selector */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800 font-mono text-xs">
        {[
          { id: 'telemetry', label: 'Telemetry & HUD' },
          { id: 'face-matrix', label: '👤 Face Matrix (Orange ➔ Green)' },
          { id: 'hand-rig', label: '🤖 3D Cyber Hand Rig' },
          { id: 'canvas', label: 'Air Canvas 3D' },
          { id: '3d', label: '3D Viewport' },
          { id: 'handsfree', label: 'Hands-Free Web' },
          { id: 'theremin', label: 'Air Theremin' },
          { id: 'arcade', label: 'Motion Arcade' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-bold transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500 shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Experience Display Area driven strictly by remote MotionState */}
      <div className="space-y-4">
        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            <GestureIndicator
              gesture={defaultState.primaryGesture as any}
              isPinching={defaultState.hands[0]?.isPinching}
              pinchDistance={defaultState.hands[0]?.pinchDistance}
              extendedFingers={defaultState.hands[0]?.extendedFingers}
            />
            <MotionTelemetry motionState={defaultState} />
          </div>
        )}

        {activeTab === 'face-matrix' && <FaceMotionTracker face={defaultState.face} />}
        {activeTab === 'hand-rig' && <ThreeHandRig3D hand={defaultState.hands[0]} />}
        {activeTab === 'canvas' && <AirCanvas3D motionState={defaultState} />}
        {activeTab === '3d' && <ThreeViewport3D motionState={defaultState} />}
        {activeTab === 'handsfree' && <HandsFreeWebShowcase motionState={defaultState} />}
        {activeTab === 'theremin' && <AirThereminAudio motionState={defaultState} />}
        {activeTab === 'arcade' && <MotionArcade motionState={defaultState} />}
      </div>
    </div>
  );
};
