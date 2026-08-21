export type GestureType = 
  | 'NONE'
  | 'OPEN_PALM'
  | 'CLOSED_FIST'
  | 'POINTING'
  | 'PINCH'
  | 'PEACE_VICTORY'
  | 'THUMBS_UP'
  | 'THUMBS_DOWN'
  | 'ROCK_ON'
  | 'OK_SIGN';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandData {
  handedness: 'Left' | 'Right';
  score: number;
  landmarks: HandLandmark[];
  worldLandmarks?: HandLandmark[];
  gesture: GestureType;
  pinchDistance: number;
  isPinching: boolean;
  extendedFingers: number;
  pointer: {
    x: number;
    y: number;
    z: number;
  };
}

export interface FaceData {
  faceDetected: boolean;
  landmarks?: HandLandmark[];
  headRotation: {
    pitch: number; // inclination (up/down)
    yaw: number;   // rotation (left/right)
    roll: number;  // tilt (side/side)
  };
  mouthOpen: boolean;
  mouthRatio: number;
  blinking: boolean;
  leftEyeBlink: boolean;
  rightEyeBlink: boolean;
  smiling: boolean;
  smileRatio: number;
  browRaised: boolean;
  headNod: boolean;
  headShake: boolean;
  facialGesture: 'NEUTRAL' | 'SMILE' | 'SURPRISE' | 'WINK' | 'NOD' | 'SHAKE';
}

export interface ShapeRecognitionResult {
  shape: 'circle' | 'line' | 'triangle' | 'square' | 'unknown';
  confidence: number;
  pointsCount: number;
}
