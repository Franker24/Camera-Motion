import React, { useEffect, useState } from 'react';
import { useCamera } from '../hooks/useCamera';
import { useMotionSocket } from '../hooks/useMotionSocket';
import { motionService } from '../services/motionService';
import { CameraView } from '../components/camera/CameraView';
import { CameraControls } from '../components/camera/CameraControls';
import { CameraStatus } from '../components/camera/CameraStatus';
import { AirCanvas3D } from '../components/air-canvas/AirCanvas3D';
import { ThreeViewport3D } from '../components/three/ThreeViewport3D';
import { HandsFreeWebShowcase } from '../components/hands-free/HandsFreeWebShowcase';
import { AirThereminAudio } from '../components/theremin/AirThereminAudio';
import { MotionArcade } from '../components/arcade/MotionArcade';
import { FaceMotionTracker } from '../components/motion/FaceMotionTracker';
import { Smartphone, Wifi, Zap, Layers } from 'lucide-react';
import { MotionState } from '../types/motion';

export const SensorMode: React.FC = () => {
  const camera = useCamera({ facingMode: 'user', width: 640, height: 480, frameRate: 30 });
  const { isConnected, deviceId, sendMotionData } = useMotionSocket('sensor');
  const [motionState, setMotionState] = useState<MotionState>(motionService.getLatestState());
  const [activeMobileTab, setActiveMobileTab] = useState<'canvas' | '3d' | 'theremin' | 'arcade' | 'handsfree' | 'status'>('canvas');

  useEffect(() => {
    motionService.setRoleAndDeviceId('sensor', deviceId);

    const unsubscribe = motionService.subscribe((state) => {
      setMotionState(state);
    });

    return () => unsubscribe();
  }, [deviceId]);

  useEffect(() => {
    if (camera.isActive && camera.videoRef.current) {
      motionService.startProcessing(camera.videoRef.current, {
        trackHands: true,
        trackFace: true,
        sendSocket: true,
      });
    } else {
      motionService.stopProcessing();
    }
  }, [camera.isActive]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Smartphone Sensor Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Smartphone Motion Sensor Node</h2>
            <p className="text-xs text-slate-400 font-mono">
              Camera tracking active: rendering local virtual hand/face & streaming telemetry to PC over Socket.io
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs">
          <Wifi className={`w-4 h-4 ${isConnected ? 'text-emerald-400' : 'text-rose-500'}`} />
          <span className={isConnected ? 'text-emerald-300 font-bold' : 'text-rose-400'}>
            {isConnected ? `STREAMING TO PC (${deviceId})` : 'CONNECTING SERVER...'}
          </span>
        </div>
      </div>

      {/* Live Camera Viewport with Prominent Virtual Hand & Face Recognition Overlay */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" /> LIVE CAMERA FEED + VIRTUAL HAND & FACE MASK
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {motionState.hands.length > 0 ? `🖐️ HAND DETECTED` : `🖐️ NO HAND`} |{' '}
            {motionState.face.faceDetected ? `👤 FACE DETECTED` : `👤 NO FACE`}
          </span>
        </div>

        <CameraView
          videoRef={camera.videoRef}
          hands={motionState.hands}
          face={motionState.face}
          showHandsOverlay={true}
          showFaceOverlay={true}
          className="h-[420px]"
        />
      </div>

      {/* Camera Controls */}
      <CameraControls
        isActive={camera.isActive}
        isLoading={camera.isLoading}
        error={camera.error}
        devices={camera.devices}
        selectedDeviceId={camera.selectedDeviceId}
        onSelectDevice={camera.setSelectedDeviceId}
        onToggleFacingMode={camera.toggleFacingMode}
        onStart={camera.start}
        onStop={camera.stop}
        resolution={camera.resolution}
        onResolutionChange={camera.setResolution}
        fps={camera.fps}
        onFpsChange={camera.setFps}
      />

      {/* Dedicated Face Motion Recognition Template Panel (Orange ➔ Green Matrix) */}
      <FaceMotionTracker face={motionState.face} />

      {/* Mobile Interactive Lab Selector (Move things with camera directly on mobile) */}
      <div className="space-y-4 border-t border-slate-800 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> TEST / MOVE WEB OBJECTS DIRECTLY ON MOBILE
          </h3>
          <span className="text-xs font-mono text-slate-500">Interactive Phone Experiences</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800 font-mono text-xs">
          {[
            { id: 'canvas', label: '🎨 Air Canvas 3D' },
            { id: '3d', label: '📦 3D Viewport' },
            { id: 'theremin', label: '🎵 Air Theremin' },
            { id: 'arcade', label: '🎮 Motion Arcade' },
            { id: 'handsfree', label: '🖱️ Hands-Free Web' },
            { id: 'status', label: '📊 Status & Telemetry' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMobileTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
                activeMobileTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500 shadow-md'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Selected Mobile Module Viewport */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 min-h-[350px]">
          {activeMobileTab === 'canvas' && <AirCanvas3D motionState={motionState} />}
          {activeMobileTab === '3d' && <ThreeViewport3D motionState={motionState} />}
          {activeMobileTab === 'theremin' && <AirThereminAudio motionState={motionState} />}
          {activeMobileTab === 'arcade' && <MotionArcade motionState={motionState} />}
          {activeMobileTab === 'handsfree' && <HandsFreeWebShowcase motionState={motionState} />}
          {activeMobileTab === 'status' && (
            <CameraStatus motionState={motionState} isSocketConnected={isConnected} />
          )}
        </div>
      </div>
    </div>
  );
};
