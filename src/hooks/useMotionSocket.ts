import { useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { DeviceRole, DeviceInfo } from '../types/socket';
import { MotionState, VoiceCommand } from '../types/motion';
import { motionService } from '../services/motionService';

export function useMotionSocket(role: DeviceRole = 'standalone', roomId: string = 'motion_lab') {
  const [isConnected, setIsConnected] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [connectedDevices, setConnectedDevices] = useState<DeviceInfo[]>([]);
  const [remoteMotionState, setRemoteMotionState] = useState<MotionState | null>(null);

  useEffect(() => {
    socketService.connect();
    socketService.joinRoom(roomId, role);

    setIsConnected(socketService.getIsConnected());
    setDeviceId(socketService.getDeviceId());

    const handleDevicesUpdate = (devices: DeviceInfo[]) => {
      setConnectedDevices(devices);
    };

    const handleMotionData = (data: MotionState) => {
      setRemoteMotionState(data);
      motionService.updateFromRemoteState(data);
    };

    socketService.onDevicesUpdate(handleDevicesUpdate);
    socketService.onMotionData(handleMotionData);

    const interval = setInterval(() => {
      setIsConnected(socketService.getIsConnected());
    }, 1000);

    return () => {
      clearInterval(interval);
      socketService.offMotionData(handleMotionData);
    };
  }, [role, roomId]);

  const sendMotionData = useCallback((state: MotionState) => {
    socketService.sendMotionData(state);
  }, []);

  const sendVoiceCommand = useCallback((command: VoiceCommand) => {
    socketService.sendVoiceCommand(command);
  }, []);

  return {
    isConnected,
    deviceId,
    connectedDevices,
    remoteMotionState,
    sendMotionData,
    sendVoiceCommand,
  };
}
