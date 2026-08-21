import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCamera } from '../hooks/useCamera';
import { motionService } from '../services/motionService';
import { CameraView } from '../components/camera/CameraView';
import { CameraControls } from '../components/camera/CameraControls';
import { MotionDashboard } from '../components/motion/MotionDashboard';
import { AirCanvas3D } from '../components/air-canvas/AirCanvas3D';
import { ThreeViewport3D } from '../components/three/ThreeViewport3D';
import { HandsFreeWebShowcase } from '../components/hands-free/HandsFreeWebShowcase';
import { AirThereminAudio } from '../components/theremin/AirThereminAudio';
import { MotionArcade } from '../components/arcade/MotionArcade';
import { ArCameraSpatial3D } from '../components/ar/ArCameraSpatial3D';
import { VoiceAudioControl } from '../components/voice/VoiceAudioControl';
import { MotionState } from '../types/motion';

interface LabProps {
  isSocketConnected?: boolean;
}

export const Lab: React.FC<LabProps> = ({ isSocketConnected = false }) => {
  const { module } = useParams<{ module: string }>();
  const navigate = useNavigate();
  const camera = useCamera({ facingMode: 'user', width: 640, height: 480, frameRate: 30 });
  const [motionState, setMotionState] = useState<MotionState>(motionService.getLatestState());

  useEffect(() => {
    motionService.setRoleAndDeviceId('standalone', 'local_pc');

    const unsubscribe = motionService.subscribe((state) => {
      setMotionState(state);
    });

    return () => unsubscribe();
  }, []);

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

  const activeModule = module || 'air-canvas';

  return (
    <div className="space-y-6">
      {/* Top Camera Controls & Live Feed Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <CameraView
            videoRef={camera.videoRef}
            hands={motionState.hands}
            face={motionState.face}
            className="h-64"
          />

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
        </div>

        <div className="lg:col-span-2">
          <MotionDashboard motionState={motionState} isSocketConnected={isSocketConnected} />
        </div>
      </div>

      {/* Selected Experience Viewport */}
      <div className="space-y-4 border-t border-slate-800 pt-6">
        {activeModule === 'air-canvas' && <AirCanvas3D motionState={motionState} />}
        {activeModule === 'three' && <ThreeViewport3D motionState={motionState} />}
        {activeModule === 'hands-free' && <HandsFreeWebShowcase motionState={motionState} />}
        {activeModule === 'theremin' && <AirThereminAudio motionState={motionState} />}
        {activeModule === 'arcade' && <MotionArcade motionState={motionState} />}
        {activeModule === 'ar' && (
          <ArCameraSpatial3D
            motionState={motionState}
            videoRef={camera.videoRef}
            isFrontFacing={camera.isFrontFacing}
          />
        )}
        {activeModule === 'voice' && (
          <VoiceAudioControl onNavigate={(target) => navigate(`/lab/${target}`)} />
        )}

        {activeModule === 'all' && (
          <div className="space-y-8">
            <AirCanvas3D motionState={motionState} />
            <ThreeViewport3D motionState={motionState} />
            <HandsFreeWebShowcase motionState={motionState} />
            <AirThereminAudio motionState={motionState} />
            <MotionArcade motionState={motionState} />
            <VoiceAudioControl onNavigate={(target) => navigate(`/lab/${target}`)} />
          </div>
        )}
      </div>
    </div>
  );
};
