import React from 'react';
import { MotionState } from '../../types/motion';
import { Hand, Smile, Activity, Sparkles, CheckCircle2, Zap } from 'lucide-react';

interface GestureCheatSheetProps {
  motionState: MotionState;
}

interface GestureCapability {
  id: string;
  category: 'HAND' | 'FACE';
  icon: string;
  name: string;
  howToPerform: string;
  webAction: string;
  isActive: boolean;
}

export const GestureCheatSheet: React.FC<GestureCheatSheetProps> = ({ motionState }) => {
  const primaryHand = motionState.hands[0];
  const face = motionState.face;

  const currentHandGesture = primaryHand ? primaryHand.gesture : 'NONE';
  const isPinching = primaryHand ? primaryHand.isPinching : false;

  // List of all Hand & Face Gestures & Possibilities
  const capabilities: GestureCapability[] = [
    // HAND GESTURES
    {
      id: 'pinch',
      category: 'HAND',
      icon: '🤏',
      name: 'PINCH / GRAB',
      howToPerform: 'Touch Thumb Tip to Index Tip',
      webAction: 'Virtual Mouse Click, Drag Cards, Grab & Throw 3D Gravity Meshes, Air Canvas Stroke',
      isActive: isPinching || currentHandGesture === 'PINCH',
    },
    {
      id: 'pointing',
      category: 'HAND',
      icon: '👉',
      name: 'POINTING FINGER',
      howToPerform: 'Extend Index Finger Only',
      webAction: 'Target Pointer, Move Cursor across Mini-Web App & 3D Viewport',
      isActive: currentHandGesture === 'POINTING',
    },
    {
      id: 'open_palm',
      category: 'HAND',
      icon: '🖐️',
      name: 'OPEN PALM',
      howToPerform: 'Extend All 5 Fingers Open',
      webAction: 'Clear Air Canvas, Pause Arcade Minigame, Reset 3D Spatial Viewport',
      isActive: currentHandGesture === 'OPEN_PALM',
    },
    {
      id: 'closed_fist',
      category: 'HAND',
      icon: '✊',
      name: 'CLOSED FIST',
      howToPerform: 'Curl All 5 Fingers Closed',
      webAction: 'Lock Object Position, Stop Theremin Audio Synth, Pause Telemetry',
      isActive: currentHandGesture === 'CLOSED_FIST',
    },
    {
      id: 'peace',
      category: 'HAND',
      icon: '✌️',
      name: 'PEACE / VICTORY',
      howToPerform: 'Extend Index & Middle Fingers',
      webAction: 'Toggle Color Palette in 3D Canvas, Switch Arcade Game Mode',
      isActive: currentHandGesture === 'PEACE_VICTORY',
    },
    {
      id: 'rock_on',
      category: 'HAND',
      icon: '🤟',
      name: 'ROCK ON / SPIDER-MAN',
      howToPerform: 'Extend Index & Pinky Fingers',
      webAction: 'Trigger Special Visual Effect Burst, Particle Explosion in Arcade',
      isActive: currentHandGesture === 'ROCK_ON',
    },
    {
      id: 'ok_sign',
      category: 'HAND',
      icon: '👌',
      name: 'OK SIGN',
      howToPerform: 'Circle Thumb + Index, Extend Middle, Ring & Pinky',
      webAction: 'Confirm Action, Select Highlighted Card, Save Air Canvas 3D Model',
      isActive: currentHandGesture === 'OK_SIGN',
    },
    {
      id: 'thumbs_up',
      category: 'HAND',
      icon: '👍',
      name: 'THUMBS UP',
      howToPerform: 'Point Thumb Upwards',
      webAction: 'Upvote / Like Product, Increase Theremin Audio Pitch',
      isActive: currentHandGesture === 'THUMBS_UP',
    },
    {
      id: 'thumbs_down',
      category: 'HAND',
      icon: '👎',
      name: 'THUMBS DOWN',
      howToPerform: 'Point Thumb Downwards',
      webAction: 'Decrease Audio Volume, Cancel Selected Modal',
      isActive: currentHandGesture === 'THUMBS_DOWN',
    },

    // FACIAL GESTURES
    {
      id: 'smile',
      category: 'FACE',
      icon: '😃',
      name: 'SMILE / BIG SMILE',
      howToPerform: 'Elevate Lip Corners Openly',
      webAction: 'Turns Face Matrix Green 🟢, Triggers Happy Visual Particles',
      isActive: face.smiling || face.facialGesture === 'SMILE',
    },
    {
      id: 'mouth_open',
      category: 'FACE',
      icon: '😮',
      name: 'OPEN MOUTH / SURPRISE',
      howToPerform: 'Open Mouth Vertically',
      webAction: 'Hands-Free Head Pointer Click Action, Boost Theremin Synth Volume',
      isActive: face.mouthOpen || face.facialGesture === 'SURPRISE',
    },
    {
      id: 'eye_wink',
      category: 'FACE',
      icon: '😉',
      name: 'SINGLE EYE WINK',
      howToPerform: 'Blink Left or Right Eye Independently',
      webAction: 'Toggle Dark / Light Mode, Trigger Quick Snapshot',
      isActive: (face.leftEyeBlink && !face.rightEyeBlink) || (!face.leftEyeBlink && face.rightEyeBlink) || face.facialGesture === 'WINK',
    },
    {
      id: 'head_nod',
      category: 'FACE',
      icon: '👤',
      name: 'HEAD NOD (YES)',
      howToPerform: 'Incline Head Pitch Up & Down (>12°)',
      webAction: 'Confirm Selection, Move Cyber Head Pong Paddle Vertically',
      isActive: face.headNod || face.facialGesture === 'NOD',
    },
    {
      id: 'head_shake',
      category: 'FACE',
      icon: '👤',
      name: 'HEAD SHAKE (NO)',
      howToPerform: 'Turn Head Yaw Left & Right (>14°)',
      webAction: 'Move Cyber Head Pong Paddle Horizontally, Rotate 3D Mesh in Studio',
      isActive: face.headShake || face.facialGesture === 'SHAKE',
    },
  ];

  const activeCount = capabilities.filter((c) => c.isActive).length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-950 border border-cyan-800 rounded-xl text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              MASTER HAND & FACE GESTURE CAPABILITIES MATRIX
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Live tracking matrix: perform gestures in front of camera to see active real-time triggers!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs">
          <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>ACTIVE DETECTED: <strong className="text-cyan-300">{activeCount} GESTURE(S)</strong></span>
        </div>
      </div>

      {/* Master Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <th className="py-3 px-4">Gesture / Sign</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">How to Perform</th>
              <th className="py-3 px-4">Triggered Web Action</th>
              <th className="py-3 px-4 text-center">Live Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {capabilities.map((item) => (
              <tr
                key={item.id}
                className={`transition-colors ${
                  item.isActive
                    ? 'bg-cyan-500/15 text-slate-100 font-semibold'
                    : 'hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                {/* Name & Icon */}
                <td className="py-3 px-4 flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className={item.isActive ? 'text-cyan-300 font-bold' : 'text-slate-200'}>
                    {item.name}
                  </span>
                </td>

                {/* Category */}
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      item.category === 'HAND'
                        ? 'bg-cyan-950 border border-cyan-800 text-cyan-400'
                        : 'bg-purple-950 border border-purple-800 text-purple-400'
                    }`}
                  >
                    {item.category}
                  </span>
                </td>

                {/* How to Perform */}
                <td className="py-3 px-4 text-slate-400">{item.howToPerform}</td>

                {/* Web Action */}
                <td className="py-3 px-4 text-slate-300 font-sans text-xs">{item.webAction}</td>

                {/* Live Status Badge */}
                <td className="py-3 px-4 text-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] ${
                      item.isActive
                        ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50 animate-pulse'
                        : 'bg-slate-950 border border-slate-800 text-slate-500'
                    }`}
                  >
                    {item.isActive ? '🟢 ACTIVE' : '⚪ IDLE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
