import { MotionState, CameraState } from '../types/motion';
import { HandData, FaceData } from '../types/gestures';
import { handLandmarkerService } from './handLandmarker';
import { faceLandmarkerService } from './faceLandmarker';
import { socketService } from './socketService';

export type MotionStateCallback = (state: MotionState) => void;

class MotionService {
  private isProcessing = false;
  private animFrameId: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private currentFps = 0;
  private fpsTimer = 0;

  private listeners: Set<MotionStateCallback> = new Set();
  
  private currentMotionState: MotionState = {
    timestamp: Date.now(),
    deviceId: 'local',
    role: 'standalone',
    fps: 0,
    hands: [],
    face: {
      faceDetected: false,
      headRotation: { pitch: 0, yaw: 0, roll: 0 },
      mouthOpen: false,
      mouthRatio: 0,
      blinking: false,
      leftEyeBlink: false,
      rightEyeBlink: false,
      smiling: false,
      smileRatio: 0,
      browRaised: false,
      headNod: false,
      headShake: false,
      facialGesture: 'NEUTRAL',
    },
    pointer: { x: 0.5, y: 0.5, z: 0, active: false },
    primaryGesture: 'NONE',
    camera: {
      active: false,
      deviceId: '',
      facingMode: 'user',
      resolution: { width: 1280, height: 720 },
      fps: 30,
      label: 'Default Camera',
    },
  };

  public subscribe(callback: MotionStateCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public getLatestState(): MotionState {
    return this.currentMotionState;
  }

  public updateCameraState(cameraState: Partial<CameraState>) {
    this.currentMotionState.camera = { ...this.currentMotionState.camera, ...cameraState };
  }

  public setRoleAndDeviceId(role: 'sensor' | 'receiver' | 'standalone', deviceId: string) {
    this.currentMotionState.role = role;
    this.currentMotionState.deviceId = deviceId;
  }

  public startProcessing(
    video: HTMLVideoElement,
    options: { trackHands?: boolean; trackFace?: boolean; sendSocket?: boolean } = {}
  ) {
    if (this.isProcessing) this.stopProcessing();

    this.isProcessing = true;
    const { trackHands = true, trackFace = true, sendSocket = false } = options;

    // Asynchronously initialize MediaPipe Vision Landmarkers
    if (trackHands) {
      handLandmarkerService.initialize().catch((err) => {
        console.error('[MotionService] Hand landmarker init error:', err);
      });
    }

    if (trackFace) {
      faceLandmarkerService.initialize().catch((err) => {
        console.error('[MotionService] Face landmarker init error:', err);
      });
    }

    let lastVideoTime = -1;
    let lastSocketTime = 0;

    const processFrame = (now: number) => {
      if (!this.isProcessing || !video || video.paused || video.ended || video.readyState < 2) {
        if (this.isProcessing) {
          this.animFrameId = requestAnimationFrame(processFrame);
        }
        return;
      }

      // Calculate FPS
      if (now - this.fpsTimer >= 1000) {
        this.currentFps = this.frameCount;
        this.frameCount = 0;
        this.fpsTimer = now;
      }

      // Skip detection if camera video frame hasn't updated yet (prevents CPU/GPU bottleneck and lag)
      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        this.frameCount++;

        const videoTimestampMs = performance.now();

        let hands: HandData[] = [];
        let face: FaceData = this.currentMotionState.face;

        if (trackHands) {
          hands = handLandmarkerService.detectHands(video, videoTimestampMs);
        }

        if (trackFace) {
          face = faceLandmarkerService.detectFace(video, videoTimestampMs);
        }

        // Pointer active if hand detected with smooth Exponential Lerp
        const primaryHand = hands[0];
        let pointer = { ...this.currentMotionState.pointer, active: false };

        if (primaryHand) {
          const targetX = primaryHand.pointer.x;
          const targetY = primaryHand.pointer.y;
          const currentX = this.currentMotionState.pointer.x || targetX;
          const currentY = this.currentMotionState.pointer.y || targetY;
          
          // Smooth Lerp Factor 0.45
          const lerpX = currentX + (targetX - currentX) * 0.45;
          const lerpY = currentY + (targetY - currentY) * 0.45;

          pointer = {
            x: Math.round(lerpX * 10000) / 10000,
            y: Math.round(lerpY * 10000) / 10000,
            z: primaryHand.pointer.z,
            active: true,
          };
        }

        const primaryGesture = primaryHand ? primaryHand.gesture : 'NONE';

        // Update Centralized MotionState
        this.currentMotionState = {
          ...this.currentMotionState,
          timestamp: Date.now(),
          fps: this.currentFps,
          hands,
          face,
          pointer,
          primaryGesture,
        };

        // Broadcast to React subscribers
        this.listeners.forEach((callback) => callback(this.currentMotionState));

        // If in Mobile Sensor mode, emit over Socket.io with network payload compression (~33 Hz)
        if (sendSocket && now - lastSocketTime >= 30) {
          lastSocketTime = now;

          const compressedState: MotionState = {
            ...this.currentMotionState,
            hands: this.currentMotionState.hands.map((h) => ({
              ...h,
              landmarks: h.landmarks.map((l) => ({
                x: Math.round(l.x * 1000) / 1000,
                y: Math.round(l.y * 1000) / 1000,
                z: Math.round(l.z * 1000) / 1000,
              })),
            })),
            face: {
              ...this.currentMotionState.face,
              landmarks: this.currentMotionState.face.landmarks
                ? this.currentMotionState.face.landmarks.map((l) => ({
                    x: Math.round(l.x * 1000) / 1000,
                    y: Math.round(l.y * 1000) / 1000,
                    z: Math.round(l.z * 1000) / 1000,
                  }))
                : undefined,
            },
          };

          socketService.sendMotionData(compressedState);
        }
      }

      this.animFrameId = requestAnimationFrame(processFrame);
    };

    this.fpsTimer = performance.now();
    this.frameCount = 0;
    this.animFrameId = requestAnimationFrame(processFrame);
  }

  public stopProcessing() {
    this.isProcessing = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public updateFromRemoteState(remoteState: MotionState) {
    this.currentMotionState = remoteState;
    this.listeners.forEach((callback) => callback(this.currentMotionState));
  }
}

export const motionService = new MotionService();
