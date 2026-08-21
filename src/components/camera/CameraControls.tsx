import React from 'react';
import { Camera, CameraOff, RefreshCw, Settings, Sliders } from 'lucide-react';

interface CameraControlsProps {
  isActive: boolean;
  isLoading?: boolean;
  error?: string | null;
  devices: MediaDeviceInfo[];
  selectedDeviceId: string;
  onSelectDevice: (deviceId: string) => void;
  onToggleFacingMode: () => void;
  onStart: () => void;
  onStop: () => void;
  resolution: { width: number; height: number };
  onResolutionChange: (res: { width: number; height: number }) => void;
  fps: number;
  onFpsChange: (fps: number) => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  isActive,
  isLoading = false,
  error = null,
  devices,
  selectedDeviceId,
  onSelectDevice,
  onToggleFacingMode,
  onStart,
  onStop,
  resolution,
  onResolutionChange,
  fps,
  onFpsChange,
}) => {
  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs font-mono">
          ⚠️ Camera Error: {error}
        </div>
      )}

      <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-4 text-slate-200 flex flex-wrap items-center justify-between gap-4">
        {/* Start / Stop Toggle & Camera Flip Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {!isActive ? (
            <button
              onClick={onStart}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold transition-all shadow-lg shadow-cyan-950/50 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
              Start Camera
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-600/20 border border-rose-500/40 hover:bg-rose-600/30 text-rose-300 font-semibold transition-all cursor-pointer"
            >
              <CameraOff className="w-5 h-5" />
              Stop Camera
            </button>
          )}

          <button
            onClick={onToggleFacingMode}
            title="Switch Front/Rear Camera"
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Device Selector & Resolution */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {devices.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <Settings className="w-4 h-4 text-slate-400" />
              <select
                value={selectedDeviceId}
                onChange={(e) => onSelectDevice(e.target.value)}
                className="bg-transparent text-slate-200 border-none outline-none cursor-pointer"
              >
                {devices.map((dev, idx) => (
                  <option key={dev.deviceId || idx} value={dev.deviceId} className="bg-slate-900">
                    {dev.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Resolution Picker */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Sliders className="w-4 h-4 text-slate-400" />
            <select
              value={`${resolution.width}x${resolution.height}`}
              onChange={(e) => {
                const [w, h] = e.target.value.split('x').map(Number);
                onResolutionChange({ width: w, height: h });
              }}
              className="bg-transparent text-slate-200 border-none outline-none cursor-pointer"
            >
              <option value="640x480" className="bg-slate-900">640 x 480 (SD)</option>
              <option value="1280x720" className="bg-slate-900">1280 x 720 (HD)</option>
              <option value="1920x1080" className="bg-slate-900">1920 x 1080 (FHD)</option>
            </select>
          </div>

          {/* FPS Picker */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <span className="text-slate-400 font-mono">FPS:</span>
            <select
              value={fps}
              onChange={(e) => onFpsChange(Number(e.target.value))}
              className="bg-transparent text-slate-200 border-none outline-none cursor-pointer"
            >
              <option value={30} className="bg-slate-900">30 FPS</option>
              <option value={60} className="bg-slate-900">60 FPS</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
