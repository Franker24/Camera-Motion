import React, { useState, useEffect, useRef } from 'react';
import { MotionState } from '../../types/motion';
import { MousePointer, CheckCircle, ShoppingBag, Eye, X, Move, Sparkles, Layers, Zap, Smartphone, ArrowRight } from 'lucide-react';

interface HandsFreeWebShowcaseProps {
  motionState: MotionState;
}

interface MiniWebCard {
  id: string;
  title: string;
  category: string;
  price: string;
  rating: string;
  badge: string;
  icon: string;
  color: string;
  description: string;
  specs: string[];
  x: number;
  y: number;
}

export const HandsFreeWebShowcase: React.FC<HandsFreeWebShowcaseProps> = ({ motionState }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Control Mode: Hand Pointer vs Head Motion Pointer
  const [pointerMode, setPointerMode] = useState<'hand' | 'head'>('hand');

  // Smoothed pointer position
  const [smoothedPointer, setSmoothedPointer] = useState<{ x: number; y: number }>({ x: 300, y: 200 });

  // Selected card for detail modal
  const [selectedCard, setSelectedCard] = useState<MiniWebCard | null>(null);

  // Cart count & last log
  const [cartCount, setCartCount] = useState(0);
  const [lastActionLog, setLastActionLog] = useState('Move hand or head to control cursor. Pinch to click or drag cards.');

  // Draggable Cards State
  const [cards, setCards] = useState<MiniWebCard[]>([
    {
      id: 'gadget-1',
      title: 'Holographic Neural Visor X9',
      category: 'AR HARDWARE',
      price: '$1,299',
      rating: '4.9 ★',
      badge: 'PRO AR',
      icon: '👓',
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40',
      description: 'Retinal spatial projection visor with eye-tracking gesture navigation.',
      specs: ['60 FPS MediaPipe Tasks', '4K Micro-OLED Dual Displays', 'Bluetooth 5.3 & WebSockets'],
      x: 0,
      y: 0,
    },
    {
      id: 'gadget-2',
      title: 'Quantum Air Theremin Synthesizer',
      category: 'WEB AUDIO',
      price: '$499',
      rating: '4.8 ★',
      badge: 'WEB AUDIO API',
      icon: '🎵',
      color: 'from-pink-500/20 to-rose-500/20 border-pink-500/40',
      description: 'Spatial Web Audio oscillator controlled by hand height pitch & horizontal gain.',
      specs: ['Polyphonic Sine/Saw Synthesizer', 'Low-pass Filter Envelope', 'Reverb Spatialization'],
      x: 0,
      y: 0,
    },
    {
      id: 'gadget-3',
      title: '3D Air Canvas Spatial Stylus',
      category: 'WEBGL 3D',
      price: '$799',
      rating: '5.0 ★',
      badge: 'THREE.JS 3D',
      icon: '🎨',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40',
      description: 'Draw 3D geometry strokes in spatial WebGL environment with shape recognition.',
      specs: ['Circle/Square Shape Recognizer', 'Tube Geometry Extruder', 'Real-time 60 FPS Export'],
      x: 0,
      y: 0,
    },
    {
      id: 'gadget-4',
      title: 'Cyber Head Motion Pong Arcade',
      category: 'ARCADE GAME',
      price: 'FREE',
      rating: '4.7 ★',
      badge: 'HEAD POINTER',
      icon: '🎮',
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40',
      description: 'Retro table tennis game controlled by head pitch & yaw rotation against AI.',
      specs: ['Dynamic AI Difficulty', 'Particle Collision Sparks', 'Head Gesture Telemetry'],
      x: 0,
      y: 0,
    },
  ]);

  const primaryHand = motionState.hands[0];
  const isPinching = primaryHand ? primaryHand.isPinching : false;

  // Pointer position calculation (Hand vs Head Pointer)
  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    let targetX = rect.width / 2;
    let targetY = rect.height / 2;

    if (pointerMode === 'hand' && motionState.pointer.active) {
      targetX = motionState.pointer.x * rect.width;
      targetY = motionState.pointer.y * rect.height;
    } else if (pointerMode === 'head' && motionState.face.faceDetected) {
      // Map head yaw (-25 to +25) to X and pitch (-20 to +20) to Y
      const yawNorm = (motionState.face.headRotation.yaw + 25) / 50;
      const pitchNorm = (motionState.face.headRotation.pitch + 20) / 40;

      targetX = Math.max(0, Math.min(rect.width, (1 - yawNorm) * rect.width));
      targetY = Math.max(0, Math.min(rect.height, pitchNorm * rect.height));
    }

    setSmoothedPointer((prev) => ({
      x: prev.x + (targetX - prev.x) * 0.3,
      y: prev.y + (targetY - prev.y) * 0.3,
    }));
  }, [motionState.pointer.x, motionState.pointer.y, motionState.pointer.active, motionState.face.headRotation, pointerMode]);

  // Click Trigger when pinching or head mouth opening
  const prevClickTriggerRef = useRef(false);
  const clickTrigger = isPinching || (pointerMode === 'head' && motionState.face.mouthOpen);

  useEffect(() => {
    if (clickTrigger && !prevClickTriggerRef.current) {
      // Find element under virtual cursor position
      const elementAtPoint = document.elementFromPoint(smoothedPointer.x, smoothedPointer.y);
      if (elementAtPoint) {
        (elementAtPoint as HTMLElement).click();
        setLastActionLog(`Triggered Click on <${elementAtPoint.tagName.toLowerCase()}> ${elementAtPoint.textContent?.slice(0, 18)}`);
      }
    }
    prevClickTriggerRef.current = clickTrigger;
  }, [clickTrigger, smoothedPointer]);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[650px] rounded-2xl border border-slate-800 bg-slate-950 p-6 overflow-hidden shadow-2xl text-slate-100 space-y-6"
    >
      {/* Virtual Cursor Overlay */}
      <div
        style={{ left: `${smoothedPointer.x}px`, top: `${smoothedPointer.y}px` }}
        className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
      >
        <div
          className={`relative flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all ${
            clickTrigger
              ? 'bg-rose-500/40 border-rose-500 scale-125 shadow-lg shadow-rose-500/60'
              : pointerMode === 'head'
              ? 'bg-purple-500/40 border-purple-400 scale-100 shadow-md shadow-purple-500/40'
              : 'bg-cyan-500/40 border-cyan-400 scale-100 shadow-md shadow-cyan-500/40'
          }`}
        >
          <MousePointer className={`w-4 h-4 ${clickTrigger ? 'text-rose-300' : 'text-cyan-300'}`} />
          {clickTrigger && (
            <span className="absolute -top-6 text-[10px] font-mono bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold shadow">
              CLICK!
            </span>
          )}
        </div>
      </div>

      {/* Top Cyber Store Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              CYBERPUNK HANDS-FREE MINI-WEB APP
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Interactive Web App driven by Hand Index Pointer or Head Motion Cursor
            </p>
          </div>
        </div>

        {/* Mode Selector & Cart Counter */}
        <div className="flex items-center gap-3 font-mono text-xs">
          {/* Pointer Input Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setPointerMode('hand')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                pointerMode === 'hand'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🖐️ HAND POINTER
            </button>
            <button
              onClick={() => setPointerMode('head')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                pointerMode === 'head'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👤 HEAD MOTION POINTER
            </button>
          </div>

          {/* Cart Badge */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl">
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-bold">CART ({cartCount})</span>
          </div>
        </div>
      </div>

      {/* Action Log HUD */}
      <div className="bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl font-mono text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>HUD STATUS: <span className="text-cyan-300 font-semibold">{lastActionLog}</span></span>
        </div>
        <span className="text-[10px] text-slate-500">
          {pointerMode === 'hand' ? 'Pinch to Click' : 'Open Mouth to Click'}
        </span>
      </div>

      {/* Grid of Interactive Web Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => setSelectedCard(card)}
            className={`group relative rounded-2xl bg-gradient-to-b ${card.color} p-5 border transition-all hover:scale-[1.03] shadow-xl flex flex-col justify-between space-y-4 cursor-pointer`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{card.icon}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-mono font-bold text-slate-300">
                  {card.badge}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">{card.category}</span>
                <h4 className="text-base font-bold text-slate-100 mt-0.5 group-hover:text-cyan-300 transition-colors">
                  {card.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {card.description}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold font-mono text-emerald-400">{card.price}</span>
                <span className="text-[10px] text-slate-400 ml-2 font-mono">{card.rating}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCard(card);
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition shadow"
              >
                OPEN DETAILS
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail View when card is selected */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/50 rounded-2xl p-6 space-y-6 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCard(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-100 border border-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4">
              <span className="text-5xl">{selectedCard.icon}</span>
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">{selectedCard.category}</span>
                <h3 className="text-xl font-extrabold text-slate-100">{selectedCard.title}</h3>
                <span className="text-sm font-mono font-bold text-emerald-400">{selectedCard.price}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {selectedCard.description}
            </p>

            {/* Specifications */}
            <div className="space-y-2 font-mono text-xs">
              <span className="text-slate-400 font-bold">HARDWARE & WEB SPECS:</span>
              <ul className="space-y-1 text-slate-300">
                {selectedCard.specs.map((spec, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center gap-3 pt-2 font-mono text-xs">
              <button
                onClick={() => {
                  setCartCount((c) => c + 1);
                  setLastActionLog(`Added ${selectedCard.title} to Cyber Cart!`);
                  setSelectedCard(null);
                }}
                className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow-lg shadow-cyan-950/60 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> ADD TO CYBER CART
              </button>
              <button
                onClick={() => setSelectedCard(null)}
                className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold transition cursor-pointer"
              >
                CLOSE MODAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
