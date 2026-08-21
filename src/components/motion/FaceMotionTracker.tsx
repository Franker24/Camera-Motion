import React, { useRef, useEffect } from 'react';
import { FaceData } from '../../types/gestures';
import { FaceCanvasOverlay } from '../overlays/FaceCanvasOverlay';
import { Smile, Eye, Activity, Sparkles, RefreshCw } from 'lucide-react';

interface FaceMotionTrackerProps {
  face: FaceData;
}

export const FaceMotionTracker: React.FC<FaceMotionTrackerProps> = ({ face }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevRotationRef = useRef<{ pitch: number; yaw: number }>({ pitch: 0, yaw: 0 });

  // Calculate rotation delta for motion detection
  const deltaYaw = Math.abs(face.headRotation.yaw - prevRotationRef.current.yaw);
  const deltaPitch = Math.abs(face.headRotation.pitch - prevRotationRef.current.pitch);

  const isMoving =
    deltaYaw > 0.8 ||
    deltaPitch > 0.8 ||
    face.mouthOpen ||
    face.blinking ||
    Math.abs(face.headRotation.yaw) > 6 ||
    Math.abs(face.headRotation.pitch) > 6;

  useEffect(() => {
    prevRotationRef.current = { pitch: face.headRotation.pitch, yaw: face.headRotation.yaw };
  }, [face.headRotation]);

  // Draw 2D Face Matrix Preview Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background Grid Pattern
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0); ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y); ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (!face.faceDetected || !face.landmarks || face.landmarks.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NO FACE DETECTED // SHOW FACE TO CAMERA', width / 2, height / 2);
      return;
    }

    const lm = face.landmarks;
    const pointColor = isMoving ? '#22c55e' : '#f97316';
    const accentColor = isMoving ? '#4ade80' : '#fb923c';

    // Render 468 Point Matrix
    lm.forEach((pt, idx) => {
      const x = pt.x * width;
      const y = pt.y * height;

      let r = 1.8;
      let col = pointColor;

      if (idx === 1) {
        col = accentColor;
        r = 4;
      } else if (idx % 4 === 0) {
        col = accentColor;
      }

      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = col;
      ctx.fill();
    });

    // Draw Nose Pointer Line
    if (lm[1]) {
      const nx = lm[1].x * width;
      const ny = lm[1].y * height;
      const vx = nx + (face.headRotation.yaw / 45) * 35;
      const vy = ny + (face.headRotation.pitch / 45) * 35;

      ctx.beginPath();
      ctx.moveTo(nx, ny);
      ctx.lineTo(vx, vy);
      ctx.strokeStyle = pointColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(vx, vy, 4, 0, 2 * Math.PI);
      ctx.fillStyle = accentColor;
      ctx.fill();
    }
  }, [face, isMoving]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-950/60 border border-orange-700/50 rounded-xl text-orange-400">
            <Smile className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              FACE MOTION MATRIX TRACKER
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Dynamic 468 3D Point Matrix: 🟠 ORANGE (Idle) ➔ 🟢 GREEN (On Motion)
            </p>
          </div>
        </div>

        {/* Dynamic Motion Status Badge */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-xs font-bold transition-all ${
            isMoving
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/50 animate-pulse'
              : 'bg-orange-950/60 border-orange-600/60 text-orange-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{isMoving ? '🟢 MOTION DETECTED (GREEN MATRIX)' : '🟠 IDLE (ORANGE MATRIX)'}</span>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Left: Interactive 2D Point Cloud Matrix Preview using FaceCanvasOverlay */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Live Face 3D Point Matrix Viewport (Matches Camera Feed)</span>
            <span>468 Landmarks</span>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
            <FaceCanvasOverlay face={face} width={480} height={270} />
          </div>
        </div>

        {/* Right: Facial Telemetry Metrics */}
        <div className="space-y-4 font-mono text-xs">
          {/* Head Yaw / Pitch Gauges */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-slate-400 font-bold flex items-center justify-between">
              <span>HEAD ORIENTATION (SPATIAL ROTATION)</span>
              <span className={isMoving ? 'text-emerald-400' : 'text-orange-400'}>
                {Math.abs(face.headRotation.yaw) > 5 ? 'ROTATING' : 'STATIONARY'}
              </span>
            </div>

            {/* Yaw Progress */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">YAW (Left/Right Turn):</span>
                <span className="text-slate-200 font-bold">{Math.round(face.headRotation.yaw)}°</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 ${isMoving ? 'bg-emerald-400' : 'bg-orange-400'}`}
                  style={{ width: `${Math.min(100, Math.max(0, ((face.headRotation.yaw + 45) / 90) * 100))}%` }}
                />
              </div>
            </div>

            {/* Pitch Progress */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-400">PITCH (Up/Down Tilt):</span>
                <span className="text-slate-200 font-bold">{Math.round(face.headRotation.pitch)}°</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 ${isMoving ? 'bg-emerald-400' : 'bg-orange-400'}`}
                  style={{ width: `${Math.min(100, Math.max(0, ((face.headRotation.pitch + 45) / 90) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mouth & Blink Sensors */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-slate-400">MOUTH APERTURE</span>
              <div className={`text-base font-bold ${face.mouthOpen ? 'text-emerald-400' : 'text-slate-400'}`}>
                {face.mouthOpen ? '😮 OPEN' : '😶 CLOSED'}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[10px] text-slate-400">BLINK DETECTOR</span>
              <div className={`text-base font-bold ${face.blinking ? 'text-amber-400' : 'text-slate-400'}`}>
                {face.blinking ? '👁️ BLINKING' : '👁️ EYES OPEN'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
