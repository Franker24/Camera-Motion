import React, { useState, useEffect, useRef } from 'react';
import { MotionState } from '../../types/motion';
import { Music, Volume2, VolumeX, Activity, Radio, Play, Square } from 'lucide-react';

interface AirThereminAudioProps {
  motionState: MotionState;
}

export const AirThereminAudio: React.FC<AirThereminAudioProps> = ({ motionState }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState(440);
  const [volume, setVolume] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const primaryHand = motionState.hands[0];

  // Start / Stop Web Audio
  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();

      gainRef.current = audioCtxRef.current.createGain();
      gainRef.current.gain.value = 0; // muted initially
      gainRef.current.connect(audioCtxRef.current.destination);

      oscRef.current = audioCtxRef.current.createOscillator();
      oscRef.current.type = 'sine';
      oscRef.current.frequency.value = 440;
      oscRef.current.connect(gainRef.current);
      oscRef.current.start();

      setIsPlaying(true);
    } catch (e) {
      console.error('[AirThereminAudio] Web Audio initialization error:', e);
    }
  };

  const stopAudio = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
      oscRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // Update pitch & volume based on hand coordinates
  useEffect(() => {
    if (!isPlaying || !primaryHand || !audioCtxRef.current) return;

    // Y controls Pitch (invert Y so moving hand UP = higher pitch)
    const normalizedY = 1 - Math.max(0, Math.min(1, primaryHand.pointer.y));
    const targetFreq = 150 + Math.pow(normalizedY, 2) * 2000; // 150Hz to 2150Hz exponential curve

    // X controls Volume / Gain
    const normalizedX = Math.max(0, Math.min(1, primaryHand.pointer.x));
    const targetVol = Math.pow(normalizedX, 1.5) * 0.8;

    setFrequency(Math.round(targetFreq));
    setVolume(Math.round(targetVol * 100));

    if (oscRef.current && gainRef.current) {
      oscRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.05);
      gainRef.current.gain.setTargetAtTime(targetVol, audioCtxRef.current.currentTime, 0.05);
    }
  }, [isPlaying, primaryHand, motionState.pointer.x, motionState.pointer.y]);

  // Audio Waveform Canvas Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isPlaying && primaryHand) {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#06b6d4';

        const amp = (volume / 100) * (canvas.height / 3);
        const freqFactor = (frequency / 200) * 0.05;

        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 + Math.sin(x * freqFactor + phase) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        phase += 0.15;
      } else {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animId = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, frequency, volume, primaryHand]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Air Theremin Audio Synthesizer</h3>
            <p className="text-xs text-slate-400 font-mono">
              Web Audio API controlled by 2D Hand Position (Y=Pitch, X=Volume)
            </p>
          </div>
        </div>

        <button
          onClick={toggleAudio}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition shadow-lg cursor-pointer ${
            isPlaying
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-cyan-950/50'
          }`}
        >
          {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'STOP THEREMIN' : 'START THEREMIN AUDIO'}
        </button>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-slate-500 text-[10px]">PITCH FREQUENCY (Y Axis)</div>
              <div className="text-lg font-bold text-cyan-300">{frequency} Hz</div>
            </div>
          </div>
          <span className="text-slate-600 text-[10px]">Moving hand up increases pitch</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-slate-500 text-[10px]">GAIN VOLUME (X Axis)</div>
              <div className="text-lg font-bold text-emerald-300">{volume}%</div>
            </div>
          </div>
          <span className="text-slate-600 text-[10px]">Moving hand right increases gain</span>
        </div>
      </div>

      {/* Waveform Visualizer Canvas */}
      <div className="relative bg-slate-950 rounded-xl overflow-hidden border border-slate-800 h-48 flex items-center justify-center">
        <canvas ref={canvasRef} width={800} height={192} className="w-full h-full" />

        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center text-slate-500 font-mono text-xs">
            Click "START THEREMIN AUDIO" to initialize audio context
          </div>
        )}
      </div>
    </div>
  );
};
