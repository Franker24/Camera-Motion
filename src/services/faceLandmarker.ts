import { FilesetResolver, FaceLandmarker as MPFaceLandmarker } from '@mediapipe/tasks-vision';
import { FaceData, HandLandmark } from '../types/gestures';

class FaceLandmarkerService {
  private landmarker: MPFaceLandmarker | null = null;
  private isLoading = false;
  private isInitialized = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized || this.isLoading) return;
    this.isLoading = true;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.landmarker = await MPFaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });

      this.isInitialized = true;
      console.log('[FaceLandmarkerService] Initialized successfully with GPU delegate');
    } catch (error) {
      console.warn('[FaceLandmarkerService] GPU initialization failed, falling back to CPU:', error);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        this.landmarker = await MPFaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });
        this.isInitialized = true;
      } catch (fallbackErr) {
        console.error('[FaceLandmarkerService] Fatal initialization error:', fallbackErr);
        throw fallbackErr;
      }
    } finally {
      this.isLoading = false;
    }
  }

  public detectFace(video: HTMLVideoElement, timestampMs: number): FaceData {
    const defaultFace: FaceData = {
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
    };

    if (!this.landmarker || !this.isInitialized || video.readyState < 2) {
      return defaultFace;
    }

    try {
      const result = this.landmarker.detectForVideo(video, timestampMs);

      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const landmarks: HandLandmark[] = result.faceLandmarks[0].map((lm) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z,
        }));

        const headRotation = this.calculateHeadRotation(landmarks);
        const mouthRatio = this.calculateMouthOpen(landmarks);
        const mouthOpen = mouthRatio > 0.18;
        const { leftEyeBlink, rightEyeBlink, blinking } = this.detectBlink(landmarks, result.faceBlendshapes);

        // Smile detection (lip corner distance / face width)
        const leftCorner = landmarks[61];
        const rightCorner = landmarks[291];
        const faceWidth = Math.abs(landmarks[454].x - landmarks[234].x);
        const smileRatio = faceWidth > 0 ? Math.hypot(leftCorner.x - rightCorner.x, leftCorner.y - rightCorner.y) / faceWidth : 0;
        const smiling = smileRatio > 0.44;

        // Eyebrow raise detection
        const eyebrowY = (landmarks[70].y + landmarks[336].y) / 2;
        const eyeY = (landmarks[159].y + landmarks[386].y) / 2;
        const browRaised = Math.abs(eyebrowY - eyeY) > 0.06;

        // Head Nod / Shake
        const headNod = Math.abs(headRotation.pitch) > 12;
        const headShake = Math.abs(headRotation.yaw) > 14;

        // Primary Facial Gesture Classification
        let facialGesture: 'NEUTRAL' | 'SMILE' | 'SURPRISE' | 'WINK' | 'NOD' | 'SHAKE' = 'NEUTRAL';
        if (smiling) facialGesture = 'SMILE';
        else if (mouthOpen) facialGesture = 'SURPRISE';
        else if ((leftEyeBlink && !rightEyeBlink) || (!leftEyeBlink && rightEyeBlink)) facialGesture = 'WINK';
        else if (headNod) facialGesture = 'NOD';
        else if (headShake) facialGesture = 'SHAKE';

        return {
          faceDetected: true,
          landmarks,
          headRotation,
          mouthOpen,
          mouthRatio,
          blinking,
          leftEyeBlink,
          rightEyeBlink,
          smiling,
          smileRatio,
          browRaised,
          headNod,
          headShake,
          facialGesture,
        };
      }

      return defaultFace;
    } catch (err) {
      console.error('[FaceLandmarkerService] Detection error:', err);
      return defaultFace;
    }
  }

  public calculateHeadRotation(lm: HandLandmark[]): { pitch: number; yaw: number; roll: number } {
    if (lm.length < 468) return { pitch: 0, yaw: 0, roll: 0 };

    const noseTip = lm[1];
    const leftEar = lm[234];
    const rightEar = lm[454];
    const chin = lm[152];
    const forehead = lm[10];

    // Yaw (horizontal turn left/right)
    const midEarX = (leftEar.x + rightEar.x) / 2;
    const yaw = (noseTip.x - midEarX) * 120; // normalized degrees approx

    // Pitch (vertical tilt up/down)
    const midVerticalY = (forehead.y + chin.y) / 2;
    const pitch = (noseTip.y - midVerticalY) * 120;

    // Roll (side tilt left/right)
    const dy = rightEar.y - leftEar.y;
    const dx = rightEar.x - leftEar.x;
    const roll = Math.atan2(dy, dx) * (180 / Math.PI);

    return {
      pitch: Math.round(pitch * 10) / 10,
      yaw: Math.round(yaw * 10) / 10,
      roll: Math.round(roll * 10) / 10,
    };
  }

  public calculateMouthOpen(lm: HandLandmark[]): number {
    if (lm.length < 300) return 0;
    const topLip = lm[13];
    const bottomLip = lm[14];
    const leftCorner = lm[61];
    const rightCorner = lm[291];

    const verticalDist = Math.hypot(topLip.x - bottomLip.x, topLip.y - bottomLip.y);
    const horizontalDist = Math.hypot(leftCorner.x - rightCorner.x, leftCorner.y - rightCorner.y);

    return horizontalDist > 0 ? verticalDist / horizontalDist : 0;
  }

  public detectBlink(lm: HandLandmark[], blendshapes: any[]): { leftEyeBlink: boolean; rightEyeBlink: boolean; blinking: boolean } {
    if (blendshapes && blendshapes.length > 0 && blendshapes[0].categories) {
      const categories = blendshapes[0].categories;
      const leftBlinkCategory = categories.find((c: any) => c.categoryName === 'eyeBlinkLeft');
      const rightBlinkCategory = categories.find((c: any) => c.categoryName === 'eyeBlinkRight');

      const leftEyeBlink = (leftBlinkCategory?.score || 0) > 0.4;
      const rightEyeBlink = (rightBlinkCategory?.score || 0) > 0.4;

      return {
        leftEyeBlink,
        rightEyeBlink,
        blinking: leftEyeBlink || rightEyeBlink,
      };
    }

    // Geometry fallback
    if (lm.length < 370) return { leftEyeBlink: false, rightEyeBlink: false, blinking: false };

    const leftTop = lm[159];
    const leftBottom = lm[145];
    const leftDist = Math.hypot(leftTop.x - leftBottom.x, leftTop.y - leftBottom.y);

    const rightTop = lm[386];
    const rightBottom = lm[374];
    const rightDist = Math.hypot(rightTop.x - rightBottom.x, rightTop.y - rightBottom.y);

    const leftEyeBlink = leftDist < 0.015;
    const rightEyeBlink = rightDist < 0.015;

    return {
      leftEyeBlink,
      rightEyeBlink,
      blinking: leftEyeBlink || rightEyeBlink,
    };
  }

  public destroy() {
    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }
    this.isInitialized = false;
  }
}

export const faceLandmarkerService = new FaceLandmarkerService();
