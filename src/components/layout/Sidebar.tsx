import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Smartphone,
  Monitor,
  Paintbrush,
  Box,
  MousePointer,
  Music,
  Gamepad2,
  Eye,
  Mic,
  TestTube2,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/sensor', label: 'Mobile Sensor', icon: Smartphone },
    { path: '/pc-receiver', label: 'PC Receiver', icon: Monitor },
    { path: '/lab/air-canvas', label: 'Air Canvas 3D', icon: Paintbrush },
    { path: '/lab/three', label: '3D Viewport', icon: Box },
    { path: '/lab/hands-free', label: 'Hands-Free Web', icon: MousePointer },
    { path: '/lab/theremin', label: 'Air Theremin', icon: Music },
    { path: '/lab/arcade', label: 'Motion Arcade', icon: Gamepad2 },
    { path: '/lab/ar', label: 'Spatial AR Camera', icon: Eye },
    { path: '/lab/voice', label: 'Voice Control', icon: Mic },
    { path: '/lab/all', label: 'Full Interactive Lab', icon: TestTube2 },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 p-4 hidden md:flex flex-col justify-between shrink-0 font-mono text-xs text-slate-300">
      <div className="space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Laboratory Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* System Footer info */}
      <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
        <div>MediaPipe Tasks Vision v0.10</div>
        <div>Socket.io WebSocket Port 3001</div>
        <div>Three.js WebGL Engine</div>
      </div>
    </aside>
  );
};
