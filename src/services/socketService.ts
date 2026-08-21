import { io, Socket } from 'socket.io-client';
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  DeviceRole, 
  DeviceInfo 
} from '../types/socket';
import { MotionState, VoiceCommand } from '../types/motion';

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private isConnected = false;
  private currentDeviceId: string = '';
  private currentRole: DeviceRole = 'standalone';

  public connect(serverUrl?: string): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (this.socket) {
      return this.socket;
    }

    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const defaultUrl = `http://${host}:3001`;
    const url = serverUrl || import.meta.env.VITE_SOCKET_URL || defaultUrl;
    
    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('[SocketService] Connected to server:', url, 'ID:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('[SocketService] Disconnected from server');
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[SocketService] Connection error:', err.message);
    });

    return this.socket;
  }

  public joinRoom(roomId: string = 'motion_lab', role: DeviceRole = 'standalone', deviceId?: string) {
    if (!this.socket) {
      this.connect();
    }

    this.currentRole = role;
    this.currentDeviceId = deviceId || `device_${Math.random().toString(36).substring(2, 9)}`;

    this.socket?.emit('join_room', {
      roomId,
      role,
      deviceId: this.currentDeviceId,
    });
  }

  public sendMotionData(data: MotionState) {
    if (this.socket && this.isConnected) {
      this.socket.emit('motion_data', data);
    }
  }

  public sendVoiceCommand(data: VoiceCommand) {
    if (this.socket && this.isConnected) {
      this.socket.emit('voice_command', data);
    }
  }

  public onMotionData(callback: (data: MotionState) => void) {
    this.socket?.on('motion_data', callback);
  }

  public offMotionData(callback?: (data: MotionState) => void) {
    if (callback) {
      this.socket?.off('motion_data', callback);
    } else {
      this.socket?.off('motion_data');
    }
  }

  public onVoiceCommand(callback: (data: VoiceCommand) => void) {
    this.socket?.on('voice_command', callback);
  }

  public onDevicesUpdate(callback: (devices: DeviceInfo[]) => void) {
    this.socket?.on('room_devices', callback);
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public getDeviceId(): string {
    return this.currentDeviceId;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const socketService = new SocketService();
