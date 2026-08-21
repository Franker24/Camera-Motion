import React from 'react';
import { GestureType } from '../../types/gestures';
import { Hand, Pointer, Eye, Mic } from 'lucide-react';

interface GestureIndicatorProps {
  gesture: GestureType;
  isPinching?: boolean;
  pinchDistance?: number;
  extendedFingers?: number;
}

export const GestureIndicator: React.FC<GestureIndicatorProps> = ({
  gesture,
  isPinching = false,
  pinchDistance = 0,
  extendedFingers = 0,
}) => {
  const getBadgeColor = () => {
    switch (gesture) {
      case 'PINCH':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/40';
      case 'POINTING':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'OPEN_PALM':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'CLOSED_FIST':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'PEACE_VICTORY':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'THUMBS_UP':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'THUMBS_DOWN':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'ROCK_ON':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
      case 'OK_SIGN':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl font-mono text-xs">
      <div className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-2 ${getBadgeColor()}`}>
        <Hand className="w-4 h-4" />
        {gesture}
      </div>

      <div className="flex items-center gap-2 text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
        <span className="text-slate-500">Pinch:</span>
        <span className={isPinching ? 'text-pink-400 font-bold' : 'text-slate-400'}>
          {isPinching ? 'ACTIVE' : 'OFF'}
        </span>
        <span className="text-slate-600 text-[10px]">({(pinchDistance * 100).toFixed(1)}cm)</span>
      </div>

      <div className="flex items-center gap-2 text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
        <span className="text-slate-500">Fingers:</span>
        <span className="font-bold text-cyan-300">{extendedFingers}</span>
      </div>
    </div>
  );
};
