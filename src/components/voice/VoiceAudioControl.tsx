import React, { useState } from 'react';
import { useVoiceControl } from '../../hooks/useVoiceControl';
import { VoiceCommand } from '../../types/motion';
import { Mic, MicOff, Volume2, Sparkles, Navigation, AlertCircle } from 'lucide-react';

interface VoiceAudioControlProps {
  onNavigate?: (modulePath: string) => void;
}

export const VoiceAudioControl: React.FC<VoiceAudioControlProps> = ({ onNavigate }) => {
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);

  const handleCommand = (cmd: VoiceCommand) => {
    setCommandHistory((prev) => [cmd, ...prev.slice(0, 9)]);

    if (cmd.action === 'navigate' && cmd.target && onNavigate) {
      onNavigate(cmd.target);
    }
  };

  const { isSupported, isListening, lastCommand, toggleListening } = useVoiceControl(handleCommand);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-950/80 border border-purple-800 rounded-xl text-purple-400">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Web Speech Voice Controller</h3>
            <p className="text-xs text-slate-400 font-mono">
              Speech-to-text NLP parser & Socket.io broadcast engine
            </p>
          </div>
        </div>

        {/* Toggle Listening Button */}
        {isSupported ? (
          <button
            onClick={toggleListening}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition shadow-lg cursor-pointer ${
              isListening
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-950/50'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening ? 'STOP LISTENING' : 'START VOICE CONTROL'}
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/40 border border-amber-800 text-amber-300 rounded-lg text-xs font-mono">
            <AlertCircle className="w-4 h-4" />
            Speech API not available on this browser
          </div>
        )}
      </div>

      {/* Voice Command Cheat Sheet */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Recognized Voice Commands
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-300">
          <div className="p-2 bg-slate-900 rounded border border-slate-800">"open canvas" / "draw"</div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800">"open arcade" / "game"</div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800">"open theremin"</div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800">"open 3D" / "clear"</div>
        </div>
      </div>

      {/* Latest Transcript HUD */}
      {lastCommand && (
        <div className="bg-purple-950/30 border border-purple-800/60 p-4 rounded-xl space-y-1">
          <div className="text-[10px] font-mono uppercase text-purple-400">Latest Recognized Phrase</div>
          <div className="text-base font-mono font-bold text-purple-200">"{lastCommand.command}"</div>
          <div className="text-xs font-mono text-purple-400 flex items-center gap-2">
            <span>Action: <strong>{lastCommand.action}</strong></span>
            {lastCommand.target && <span>Target: <strong>{lastCommand.target}</strong></span>}
            <span>Confidence: <strong>{Math.round(lastCommand.confidence * 100)}%</strong></span>
          </div>
        </div>
      )}

      {/* Command History Log */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-400 uppercase">Command History Stream</div>
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 h-48 overflow-y-auto font-mono text-xs space-y-1">
          {commandHistory.length === 0 ? (
            <div className="text-slate-600 text-center py-12">No voice commands recorded yet</div>
          ) : (
            commandHistory.map((cmd, idx) => (
              <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-900 text-slate-300">
                <span className="text-purple-300">"{cmd.command}"</span>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="text-cyan-400">{cmd.action}</span>
                  <span>{new Date(cmd.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
