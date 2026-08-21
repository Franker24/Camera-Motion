export interface CameraOptions {
  deviceId?: string;
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
  frameRate?: number;
}

export class CameraService {
  private currentStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private options: CameraOptions = {
    facingMode: 'user',
    width: 1280,
    height: 720,
    frameRate: 30,
  };

  public async getDevices(): Promise<MediaDeviceInfo[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error('MediaDevices API not available on this browser.');
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((device) => device.kind === 'videoinput');
  }

  public async startCamera(
    videoElement: HTMLVideoElement,
    options?: CameraOptions
  ): Promise<MediaStream> {
    if (this.currentStream) {
      this.stopCamera();
      // Allow OS camera hardware 150ms to release device lock before requesting userMedia again
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    this.videoElement = videoElement;
    if (options) {
      this.options = { ...this.options, ...options };
    }

    const videoConstraints: MediaTrackConstraints = {};

    if (this.options.deviceId && this.options.deviceId.trim() !== '') {
      videoConstraints.deviceId = { ideal: this.options.deviceId };
    } else if (this.options.facingMode) {
      videoConstraints.facingMode = { ideal: this.options.facingMode };
    }

    if (this.options.width) videoConstraints.width = { ideal: this.options.width };
    if (this.options.height) videoConstraints.height = { ideal: this.options.height };
    if (this.options.frameRate) videoConstraints.frameRate = { ideal: this.options.frameRate };

    const tryGetUserMedia = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.currentStream = stream;

      const el = this.videoElement;
      if (el) {
        try {
          el.srcObject = stream;
          const playPromise = el.play();
          if (playPromise !== undefined) {
            playPromise.catch((pErr) => {
              console.warn('[CameraService] video.play() deferred:', pErr);
            });
          }
        } catch (e) {
          console.warn('[CameraService] srcObject assign error:', e);
        }
      }
      return stream;
    };

    // Stage 1: Try with requested constraints
    try {
      return await tryGetUserMedia({
        video: Object.keys(videoConstraints).length > 0 ? videoConstraints : true,
        audio: false,
      });
    } catch (err: any) {
      console.warn('[CameraService] Primary constraints failed, trying facingMode fallback:', err);
      // Stage 2: Fallback with facingMode
      try {
        return await tryGetUserMedia({
          video: { facingMode: { ideal: this.options.facingMode || 'user' } },
          audio: false,
        });
      } catch (fallbackErr: any) {
        console.warn('[CameraService] FacingMode fallback failed, trying basic video:', fallbackErr);
        // Stage 3: Basic default video
        try {
          return await tryGetUserMedia({ video: true, audio: false });
        } catch (finalErr: any) {
          console.error('[CameraService] Fatal camera access error:', finalErr);
          throw new Error(finalErr.message || 'Could not access any camera on this device.');
        }
      }
    }
  }

  public stopCamera() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      this.currentStream = null;
    }
    if (this.videoElement) {
      try {
        this.videoElement.pause();
        this.videoElement.srcObject = null;
      } catch (e) {}
      this.videoElement = null;
    }
  }

  public getActiveStream(): MediaStream | null {
    return this.currentStream;
  }

  public isFrontFacing(): boolean {
    return this.options.facingMode === 'user';
  }
}

export const cameraService = new CameraService();
