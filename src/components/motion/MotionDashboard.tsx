import React, { useState } from 'react';
import { CameraStatus } from '../camera/CameraStatus';
import { MotionTelemetry } from './MotionTelemetry';
import { GestureIndicator } from './GestureIndicator';
import { GestureCheatSheet } from './GestureCheatSheet';
import { ThreeHandRig3D } from '../three/ThreeHandRig3D';
import { FaceMotionTracker } from './FaceMotionTracker';
import { HandsFreeWebShowcase } from '../hands-free/HandsFreeWebShowcase';
import { MotionState } from '../../types/motion';
import { Sparkles, Layers, ShieldCheck, Cpu, LayoutGrid, Monitor, Hand, Smile } from 'lucide-react';

interface MotionDashboardProps {
  motionState: MotionState;
  isSocketConnected?: boolean;
}

export const MotionDashboard: React.FC<MotionDashboardProps> = ({
  motionState,
  isSocketConnected = false,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'hand-rig' | 'face-matrix' | 'handsfree'>('overview');
  const primaryHand = motionState.hands[0];

  return (
    <div className="space-y-6">
      {/* Sci-Fi Dashboard Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-900/40 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-slate-950 shadow-lg shadow-cyan-950/60 glow-cyan">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-wider text-gradient-cyan uppercase flex items-center gap-2">
              CYBERNETIC MOTION CONTROL DASHBOARD
            </h2>
            <p className="text-xs text-cyan-400/80 font-mono tracking-wide">
              Real-time MediaPipe Vision Telemetry & 3D Spatial Processing Node
            </p>
          </div>
        </div>

        {/* Live System Metrics Badges */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">STATUS:</span>
            <span className="text-emerald-400 font-bold">ONLINE (60 FPS)</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="text-slate-400">TELEMETRY:</span>
            <span className="text-purple-300 font-bold">{motionState.hands.length} HANDS</span>
          </div>
        </div>
      </div>

      {/* Cyberpunk Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 font-mono text-xs">
        {[
          { id: 'overview', label: '📊 Telemetry & Gesture HUD', icon: LayoutGrid },
          { id: 'hand-rig', label: '🤖 3D Cyber Hand Rig', icon: Hand },
          { id: 'face-matrix', label: '👤 Face Matrix 468', icon: Smile },
          { id: 'handsfree', label: '🌐 Hands-Free Web', icon: Monitor },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500 shadow-md shadow-cyan-950/50 glow-cyan'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dashboard Viewport Display */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <CameraStatus motionState={motionState} isSocketConnected={isSocketConnected} />

            <GestureIndicator
              gesture={motionState.primaryGesture as any}
              isPinching={primaryHand?.isPinching}
              pinchDistance={primaryHand?.pinchDistance}
              extendedFingers={primaryHand?.extendedFingers}
            />

            <MotionTelemetry motionState={motionState} />

            <GestureCheatSheet motionState={motionState} />
          </div>
        )}

        {activeTab === 'hand-rig' && (
          <div className="space-y-4">
            <ThreeHandRig3D hand={primaryHand} />
            <GestureCheatSheet motionState={motionState} />
          </div>
        )}

        {activeTab === 'face-matrix' && (
          <div className="space-y-4">
            <FaceMotionTracker face={motionState.face} />
          </div>
        )}

        {activeTab === 'handsfree' && (
          <div className="space-y-4">
            <HandsFreeWebShowcase motionState={motionState} />
          </div>
        )}
      </div>
    </div>
  );
};
