import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  RoomConnectionPayload, 
  DeviceInfo 
} from '../src/types/socket';
import { MotionState, VoiceCommand } from '../src/types/motion';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const DEFAULT_ROOM = 'motion_lab';

// Store connected devices per socket ID
const connectedDevices = new Map<string, DeviceInfo & { roomId: string }>();

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    connectedDevicesCount: connectedDevices.size,
  });
});

app.get('/api/devices', (_req, res) => {
  const devices = Array.from(connectedDevices.values());
  res.json(devices);
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('join_room', (payload: RoomConnectionPayload) => {
    const roomId = payload.roomId || DEFAULT_ROOM;
    socket.join(roomId);

    const deviceInfo: DeviceInfo & { roomId: string } = {
      socketId: socket.id,
      deviceId: payload.deviceId || socket.id,
      role: payload.role || 'standalone',
      joinedAt: Date.now(),
      roomId,
    };

    connectedDevices.set(socket.id, deviceInfo);

    console.log(`[Socket.io] Device ${deviceInfo.deviceId} (${deviceInfo.role}) joined room ${roomId}`);

    // Notify caller with room device list
    const roomDevices = Array.from(connectedDevices.values()).filter(d => d.roomId === roomId);
    socket.emit('room_devices', roomDevices);

    // Notify room of new device connection
    socket.to(roomId).emit('device_connected', deviceInfo);
  });

  socket.on('motion_data', (data: MotionState) => {
    const sender = connectedDevices.get(socket.id);
    const roomId = sender?.roomId || DEFAULT_ROOM;
    // Broadcast motion data to all other devices in the room (e.g. PC Receivers)
    socket.to(roomId).emit('motion_data', data);
  });

  socket.on('voice_command', (data: VoiceCommand) => {
    const sender = connectedDevices.get(socket.id);
    const roomId = sender?.roomId || DEFAULT_ROOM;
    socket.to(roomId).emit('voice_command', data);
  });

  socket.on('disconnect', () => {
    const device = connectedDevices.get(socket.id);
    if (device) {
      console.log(`[Socket.io] Device disconnected: ${device.deviceId}`);
      connectedDevices.delete(socket.id);
      io.to(device.roomId).emit('device_disconnected', device);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`⚡ Camera Motion Lab Socket Server running on port ${PORT}`);
  console.log(`🌐 WebSocket Room: ${DEFAULT_ROOM}`);
  console.log(`=================================================`);
});
