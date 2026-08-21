import { MotionState, VoiceCommand } from './motion';

export type DeviceRole = 'sensor' | 'receiver' | 'standalone';

export interface RoomConnectionPayload {
  roomId: string;
  role: DeviceRole;
  deviceId: string;
  deviceName?: string;
}

export interface DeviceInfo {
  socketId: string;
  deviceId: string;
  role: DeviceRole;
  joinedAt: number;
}

export interface ServerToClientEvents {
  motion_data: (data: MotionState) => void;
  voice_command: (data: VoiceCommand) => void;
  device_connected: (device: DeviceInfo) => void;
  device_disconnected: (device: DeviceInfo) => void;
  room_devices: (devices: DeviceInfo[]) => void;
  error: (msg: { message: string }) => void;
}

export interface ClientToServerEvents {
  join_room: (payload: RoomConnectionPayload) => void;
  motion_data: (data: MotionState) => void;
  voice_command: (data: VoiceCommand) => void;
}
