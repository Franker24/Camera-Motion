import React from 'react';
import { Activity, Wifi, Hand, Smile, Cpu } from 'lucide-react';
import { MotionState } from '../../types/motion';

interface CameraStatusProps {
  motionState: MotionState;
  isSocketConnected?: boolean;
}

export const CameraStatus: React.FC<CameraStatusProps> = ({
  motionState,
  isSocketConnected = false,
}) => {
  const { fps, hands, face, role, camera } = motionState;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl font-mono text-xs text-slate-300">
      {/* FPS & Processing Status */}
      <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-950/60 rounded-lg border border-slate-800/80">
        <Activity className={`w-4 h-4 ${fps > 20 ? 'text-emerald-400' : 'text-amber-400'}`} />
        <div>
          <div className="text-[10px] text-slate-500 uppercase">Engine FPS</div>
          <div className="font-bold text-slate-100">{fps} FPS</div>
        </div>
      </div>

      {/* Hand Tracking Status */}
      <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-950/60 rounded-lg border border-slate-800/80">
        <Hand className={`w-4 h-4 ${hands.length > 0 ? 'text-cyan-400' : 'text-slate-600'}`} />
        <div>
          <div className="text-[10px] text-slate-500 uppercase">Hands</div>
          <div className="font-bold text-slate-100">
            {hands.length > 0 ? `${hands.length} Detected` : 'None'}
          </div>
        </div>
      </div>

      {/* Face Tracking Status */}
      <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-950/60 rounded-lg border border-slate-800/80">
        <Smile className={`w-4 h-4 ${face.faceDetected ? 'text-cyan-400' : 'text-slate-600'}`} />
        <div>
          <div className="text-[10px] text-slate-500 uppercase">Face</div>
          <div className="font-bold text-slate-100">
            {face.faceDetected ? 'Tracked' : 'Searching'}
          </div>
        </div>
      </div>

      {/* Socket Connection */}
      <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-950/60 rounded-lg border border-slate-800/80">
        <Wifi className={`w-4 h-4 ${isSocketConnected ? 'text-emerald-400' : 'text-rose-500'}`} />
        <div>
          <div className="text-[10px] text-slate-500 uppercase">Socket.io</div>
          <div className="font-bold text-slate-100">
            {isSocketConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </div>
        </div>
      </div>

      {/* Device Role */}
      <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-950/60 rounded-lg border border-slate-800/80 col-span-2 sm:col-span-1">
        <Cpu className="w-4 h-4 text-purple-400" />
        <div>
          <div className="text-[10px] text-slate-500 uppercase">Role</div>
          <div className="font-bold uppercase text-purple-300">{role}</div>
        </div>
      </div>
    </div>
  );
};
