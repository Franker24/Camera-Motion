import { HandData, FaceData } from './gestures';

export interface CameraState {
  active: boolean;
  deviceId: string;
  facingMode: 'user' | 'environment';
  resolution: { width: number; height: number };
  fps: number;
  label: string;
}

export interface VoiceCommand {
  command: string;
  action: 'navigate' | 'control' | 'clear' | 'reset' | 'stop' | 'unknown';
  target?: string;
  timestamp: number;
  confidence: number;
}

export interface MotionState {
  timestamp: number;
  deviceId: string;
  role: 'sensor' | 'receiver' | 'standalone';
  fps: number;
  hands: HandData[];
  face: FaceData;
  pointer: {
    x: number;
    y: number;
    z: number;
    active: boolean;
  };
  primaryGesture: string;
  camera: CameraState;
  voice?: VoiceCommand;
}

export interface ActiveModuleInfo {
  id: string;
  name: string;
  description: string;
  iconName: string;
  path: string;
}
