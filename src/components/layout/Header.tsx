import React from 'react';
import { Activity, Camera, Hand, Smile, Wifi, Volume2, Cpu, Sparkles } from 'lucide-react';
import { DeviceRole } from '../../types/socket';
import { Link } from 'react-router-dom';

interface HeaderProps {
  currentRole: DeviceRole;
  isSocketConnected: boolean;
  isCameraActive: boolean;
  handTrackingActive: boolean;
  faceTrackingActive: boolean;
  fps: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  isSocketConnected,
  isCameraActive,
  handTrackingActive,
  faceTrackingActive,
  fps,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-900/40 px-4 py-3 text-slate-100 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-950/80 group-hover:scale-105 transition-all glow-cyan">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-gradient-cyan uppercase">
              CAMERA MOTION LAB
            </h1>
            <p className="text-[10px] font-mono text-cyan-400/80 tracking-wide">
              CYBERNETIC VISION & 3D TELEMETRY ENGINE
            </p>
          </div>
        </Link>

        {/* Real-time System Status Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          {/* FPS Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800">
            <Activity className={`w-3.5 h-3.5 ${fps > 20 ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-slate-400">FPS:</span>
            <span className="font-bold text-cyan-300">{fps}</span>
          </div>

          {/* Camera Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800">
            <Camera className={`w-3.5 h-3.5 ${isCameraActive ? 'text-cyan-400' : 'text-slate-600'}`} />
            <span className="text-slate-400">CAM:</span>
            <span className={isCameraActive ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
              {isCameraActive ? 'ACTIVE' : 'OFF'}
            </span>
          </div>

          {/* Hand Tracking Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800">
            <Hand className={`w-3.5 h-3.5 ${handTrackingActive ? 'text-cyan-400' : 'text-slate-600'}`} />
            <span className="text-slate-400">HANDS:</span>
            <span className={handTrackingActive ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
              {handTrackingActive ? 'OK' : 'OFF'}
            </span>
          </div>

          {/* Face Tracking Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800">
            <Smile className={`w-3.5 h-3.5 ${faceTrackingActive ? 'text-cyan-400' : 'text-slate-600'}`} />
            <span className="text-slate-400">FACE:</span>
            <span className={faceTrackingActive ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
              {faceTrackingActive ? 'OK' : 'OFF'}
            </span>
          </div>

          {/* Socket Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800">
            <Wifi className={`w-3.5 h-3.5 ${isSocketConnected ? 'text-emerald-400' : 'text-rose-500'}`} />
            <span className="text-slate-400">SOCKET:</span>
            <span className={isSocketConnected ? 'text-emerald-300 font-bold' : 'text-rose-400'}>
              {isSocketConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          {/* Role Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-950/80 border border-purple-700/60 text-purple-300 font-bold shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="uppercase text-[10px] tracking-wider">{currentRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
