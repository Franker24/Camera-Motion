import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MotionState } from '../../types/motion';
import { DeviceRole } from '../../types/socket';

interface LayoutProps {
  children: React.ReactNode;
  motionState: MotionState;
  isSocketConnected: boolean;
  isCameraActive: boolean;
  currentRole: DeviceRole;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  motionState,
  isSocketConnected,
  isCameraActive,
  currentRole,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Header
        currentRole={currentRole}
        isSocketConnected={isSocketConnected}
        isCameraActive={isCameraActive}
        handTrackingActive={motionState.hands.length > 0}
        faceTrackingActive={motionState.face.faceDetected}
        fps={motionState.fps}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
