import React from 'react';
import { MotionState } from '../../types/motion';
import { Terminal, Crosshair, Compass, Smile, Hand } from 'lucide-react';

interface MotionTelemetryProps {
  motionState: MotionState;
  className?: string;
}

export const MotionTelemetry: React.FC<MotionTelemetryProps> = ({
  motionState,
  className = '',
}) => {
  const { hands, face, pointer, primaryGesture, fps } = motionState;
  const primaryHand = hands[0];

  return (
    <div className={`bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 shadow-xl ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold tracking-wider uppercase text-[11px]">
          <Terminal className="w-4 h-4" />
          Motion Telemetry HUD
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
          {fps} FPS
        </span>
      </div>

      <div className="space-y-3">
        {/* Pointer Coordinates */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Crosshair className="w-3.5 h-3.5" /> Pointer 3D (Index Tip)
            </span>
            <span className={pointer.active ? 'text-emerald-400' : 'text-slate-600'}>
              {pointer.active ? 'TRACKING' : 'IDLE'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-200">
            <div>X: <span className="text-cyan-400">{(pointer.x * 100).toFixed(1)}%</span></div>
            <div>Y: <span className="text-cyan-400">{(pointer.y * 100).toFixed(1)}%</span></div>
            <div>Z: <span className="text-purple-400">{(pointer.z * 100).toFixed(2)}</span></div>
          </div>
        </div>

        {/* Head Rotation Angles */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-purple-300">
              <Compass className="w-3.5 h-3.5" /> Head Orientation
            </span>
            <span className={face.faceDetected ? 'text-emerald-400' : 'text-slate-600'}>
              {face.faceDetected ? 'FACE OK' : 'NO FACE'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-200">
            <div>P: <span className="text-purple-400">{face.headRotation.pitch}°</span></div>
            <div>Y: <span className="text-purple-400">{face.headRotation.yaw}°</span></div>
            <div>R: <span className="text-purple-400">{face.headRotation.roll}°</span></div>
          </div>
        </div>

        {/* Hand Details */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <Hand className="w-3.5 h-3.5" /> Hand Gesture Engine
            </span>
            <span className="text-cyan-300 font-bold">{primaryGesture}</span>
          </div>
          {primaryHand ? (
            <div className="text-[10px] space-y-1 text-slate-400">
              <div>Hand: <span className="text-slate-200">{primaryHand.handedness}</span></div>
              <div>Pinch Dist: <span className="text-pink-400">{(primaryHand.pinchDistance * 100).toFixed(2)}cm</span> ({primaryHand.isPinching ? 'PINCHING' : 'RELEASED'})</div>
              <div>Fingers Up: <span className="text-emerald-400">{primaryHand.extendedFingers}</span></div>
            </div>
          ) : (
            <div className="text-[10px] text-slate-600">No active hand detected in frame</div>
          )}
        </div>

        {/* Face Expressions */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Smile className="w-3.5 h-3.5" /> Facial Metrics
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
            <div>Mouth Open: <span className={face.mouthOpen ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{face.mouthOpen ? 'YES' : 'NO'}</span></div>
            <div>Blink: <span className={face.blinking ? 'text-amber-400 font-bold' : 'text-slate-500'}>{face.blinking ? 'BLINK' : 'OPEN'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
