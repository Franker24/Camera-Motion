import { FilesetResolver, HandLandmarker as MPHandLandmarker } from '@mediapipe/tasks-vision';
import { HandData, HandLandmark, GestureType } from '../types/gestures';

class HandLandmarkerService {
  private landmarker: MPHandLandmarker | null = null;
  private isLoading = false;
  private isInitialized = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized || this.isLoading) return;
    this.isLoading = true;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.landmarker = await MPHandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
      });

      this.isInitialized = true;
      console.log('[HandLandmarkerService] Initialized successfully with GPU delegate');
    } catch (error) {
      console.warn('[HandLandmarkerService] GPU initialization failed, falling back to CPU:', error);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        this.landmarker = await MPHandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });
        this.isInitialized = true;
      } catch (fallbackErr) {
        console.error('[HandLandmarkerService] Fatal initialization error:', fallbackErr);
        throw fallbackErr;
      }
    } finally {
      this.isLoading = false;
    }
  }

  public detectHands(video: HTMLVideoElement, timestampMs: number): HandData[] {
    if (!this.landmarker || !this.isInitialized || video.readyState < 2) {
      return [];
    }

    try {
      const result = this.landmarker.detectForVideo(video, timestampMs);
      const handsData: HandData[] = [];

      if (result.landmarks && result.landmarks.length > 0) {
        result.landmarks.forEach((landmarks, index) => {
          const handednessInfo = result.handednesses?.[index]?.[0];
          const handedness = (handednessInfo?.categoryName as 'Left' | 'Right') || 'Right';
          const score = handednessInfo?.score || 0.9;

          // Convert landmarks to HandLandmark objects
          const convertedLandmarks: HandLandmark[] = landmarks.map((lm) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
          }));

          // Calculate Pinch distance (between Thumb Tip: landmark 4 and Index Tip: landmark 8)
          const thumbTip = convertedLandmarks[4];
          const indexTip = convertedLandmarks[8];
          const pinchDistance = this.calculateDistance(thumbTip, indexTip);
          const isPinching = pinchDistance < 0.07;

          // Count extended fingers
          const extendedFingers = this.countExtendedFingers(convertedLandmarks);

          // Detect Gesture
          const gesture = this.classifyGesture(convertedLandmarks, isPinching, extendedFingers);

          // Pointer position is index tip (landmark 8)
          const pointer = {
            x: indexTip.x,
            y: indexTip.y,
            z: indexTip.z,
          };

          handsData.push({
            handedness,
            score,
            landmarks: convertedLandmarks,
            worldLandmarks: result.worldLandmarks?.[index]?.map((lm) => ({
              x: lm.x,
              y: lm.y,
              z: lm.z,
            })),
            gesture,
            pinchDistance,
            isPinching,
            extendedFingers,
            pointer,
          });
        });
      }

      return handsData;
    } catch (err) {
      console.error('[HandLandmarkerService] Detection error:', err);
      return [];
    }
  }

  public calculateDistance(p1: HandLandmark, p2: HandLandmark): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  public countExtendedFingers(lm: HandLandmark[]): number {
    if (lm.length < 21) return 0;
    let count = 0;

    // Thumb: Compare tip (4) x distance relative to mcp (2)
    if (Math.abs(lm[4].x - lm[17].x) > Math.abs(lm[3].x - lm[17].x)) {
      count++;
    }

    // Index (8 vs 6)
    if (lm[8].y < lm[6].y) count++;
    // Middle (12 vs 10)
    if (lm[12].y < lm[10].y) count++;
    // Ring (16 vs 14)
    if (lm[16].y < lm[14].y) count++;
    // Pinky (20 vs 18)
    if (lm[20].y < lm[18].y) count++;

    return count;
  }

  public classifyGesture(lm: HandLandmark[], isPinching: boolean, extendedFingers: number): GestureType {
    if (isPinching) {
      // Check if middle, ring, pinky are extended for OK_SIGN
      const middleExt = lm[12].y < lm[10].y;
      const ringExt = lm[16].y < lm[14].y;
      if (middleExt && ringExt) return 'OK_SIGN';
      return 'PINCH';
    }

    if (extendedFingers >= 4) return 'OPEN_PALM';
    if (extendedFingers === 0) return 'CLOSED_FIST';

    const indexExtended = lm[8].y < lm[6].y;
    const middleExtended = lm[12].y < lm[10].y;
    const ringExtended = lm[16].y < lm[14].y;
    const pinkyExtended = lm[20].y < lm[18].y;

    // Rock On / Spider-Man: Index & Pinky extended, middle & ring flexed
    if (indexExtended && pinkyExtended && !middleExtended && !ringExtended) {
      return 'ROCK_ON';
    }

    // Peace / Victory: Index & Middle extended, ring & pinky flexed
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      return 'PEACE_VICTORY';
    }

    // Pointing: Only Index extended
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'POINTING';
    }

    // Thumbs Up / Down
    const thumbUp = lm[4].y < lm[3].y && lm[4].y < lm[8].y;
    const thumbDown = lm[4].y > lm[3].y && lm[4].y > lm[8].y;

    if (thumbUp && !indexExtended && !middleExtended && !pinkyExtended) {
      return 'THUMBS_UP';
    }
    if (thumbDown && !indexExtended && !middleExtended && !pinkyExtended) {
      return 'THUMBS_DOWN';
    }

    return 'NONE';
  }

  public destroy() {
    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }
    this.isInitialized = false;
  }
}

export const handLandmarkerService = new HandLandmarkerService();
