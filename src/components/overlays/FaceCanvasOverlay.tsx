import React, { useEffect, useRef } from 'react';
import { FaceData } from '../../types/gestures';

interface FaceCanvasOverlayProps {
  face: FaceData;
  width: number;
  height: number;
}

const LEFT_EYE_PATH = [33, 160, 158, 133, 153, 144, 33];
const RIGHT_EYE_PATH = [362, 385, 387, 263, 373, 380, 362];
const LIPS_PATH = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 146, 91, 181, 84, 17, 314, 405, 321, 375, 61];
const EYEBROW_LEFT = [70, 63, 105, 66, 107];
const EYEBROW_RIGHT = [336, 296, 334, 293, 300];
const NOSE_BRIDGE = [168, 6, 197, 195, 5, 4, 1];

export const FaceCanvasOverlay: React.FC<FaceCanvasOverlayProps> = ({
  face,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (!face.faceDetected || !face.landmarks || face.landmarks.length === 0) return;

    const lm = face.landmarks;

    const getPt = (index: number) => {
      if (!lm[index]) return null;
      // Coordinate flip (1 - x) to match selfie video stream
      const x = (1 - lm[index].x) * width;
      const y = lm[index].y * height;
      return { x, y };
    };

    const isMoving =
      face.smiling ||
      face.mouthOpen ||
      face.blinking ||
      face.headNod ||
      face.headShake ||
      Math.abs(face.headRotation.yaw) > 6 ||
      Math.abs(face.headRotation.pitch) > 6;

    // Color Scheme: Pure Point Matrix (NO MASK BLOBS, NO SOLID FILLS!)
    // Idle: Cyan/Blue (#06b6d4) ➔ Motion Active: Emerald Green (#22c55e)
    const basePointColor = isMoving ? '#22c55e' : '#06b6d4';
    const accentColor = isMoving ? '#4ade80' : '#38bdf8';
    const lineStrokeColor = isMoving ? 'rgba(34, 197, 94, 0.5)' : 'rgba(6, 182, 212, 0.5)';

    // 1. Fine Constellation Lines for Key Features (NO SOLID MASK FILLS)
    [EYEBROW_LEFT, EYEBROW_RIGHT, NOSE_BRIDGE, LEFT_EYE_PATH, RIGHT_EYE_PATH, LIPS_PATH].forEach((path) => {
      ctx.beginPath();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = lineStrokeColor;
      path.forEach((idx, i) => {
        const p = getPt(idx);
        if (!p) return;
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    });

    // 2. Pupil Target Crosshairs
    [468, 473].forEach((centerIdx) => {
      const p = getPt(centerIdx);
      if (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, 2 * Math.PI);
        ctx.strokeStyle = face.blinking ? '#f43f5e' : accentColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = face.blinking ? '#f43f5e' : basePointColor;
        ctx.fill();
      }
    });

    // 3. Render ALL 468 Face 3D Landmark Matrix Dots (PURE POINTS ACROSS ENTIRE FACE)
    lm.forEach((_, i) => {
      const p = getPt(i);
      if (!p) return;

      let r = 1.8;
      let col = basePointColor;

      if (i === 1) {
        // Nose Tip
        r = 4.5;
        col = accentColor;
      } else if (LEFT_EYE_PATH.includes(i) || RIGHT_EYE_PATH.includes(i)) {
        col = face.blinking ? '#f59e0b' : accentColor;
        r = 2.2;
      } else if (LIPS_PATH.includes(i)) {
        col = face.mouthOpen ? '#ec4899' : accentColor;
        r = 2.2;
      } else if (i % 3 === 0) {
        col = accentColor;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = col;
      ctx.fill();
    });

    // 4. Bounding Frame & Sci-Fi Corner Brackets
    const xs = lm.map((p) => (1 - p.x) * width);
    const ys = lm.map((p) => p.y * height);
    const minX = Math.min(...xs) - 20;
    const maxX = Math.max(...xs) + 20;
    const minY = Math.min(...ys) - 20;
    const maxY = Math.max(...ys) + 20;
    const boxW = maxX - minX;

    const cornerSize = Math.min(22, boxW * 0.2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = basePointColor;

    ctx.beginPath();
    ctx.moveTo(minX, minY + cornerSize); ctx.lineTo(minX, minY); ctx.lineTo(minX + cornerSize, minY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(maxX - cornerSize, minY); ctx.lineTo(maxX, minY); ctx.lineTo(maxX, minY + cornerSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(minX, maxY - cornerSize); ctx.lineTo(minX, maxY); ctx.lineTo(minX + cornerSize, maxY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(maxX - cornerSize, maxY); ctx.lineTo(maxX, maxY); ctx.lineTo(maxX, maxY - cornerSize);
    ctx.stroke();

    // 5. HUD Banner
    const gestureLabel = face.facialGesture !== 'NEUTRAL' ? ` | GESTURE: ${face.facialGesture}` : '';
    const headText = `[ 👤 3D FACE POINT MATRIX // 468 POINTS ${isMoving ? '(🟢 ACTIVE)' : '(🔵 IDLE)'}${gestureLabel} ]`;
    ctx.font = 'bold 11px "Fira Code", monospace';
    const textW = ctx.measureText(headText).width;

    ctx.fillStyle = 'rgba(3, 7, 18, 0.9)';
    ctx.strokeStyle = basePointColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(minX, minY - 26, textW + 16, 22, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accentColor;
    ctx.fillText(headText, minX + 8, minY - 11);

    // 6. Nose 3D Spatial Vector Pointer
    const pNose = getPt(1);
    if (pNose) {
      const vectorLen = 50;
      const radYaw = (face.headRotation.yaw * Math.PI) / 180;
      const radPitch = (face.headRotation.pitch * Math.PI) / 180;
      const vx = pNose.x - Math.sin(radYaw) * vectorLen;
      const vy = pNose.y + Math.sin(radPitch) * vectorLen;

      ctx.beginPath();
      ctx.moveTo(pNose.x, pNose.y);
      ctx.lineTo(vx, vy);
      ctx.strokeStyle = basePointColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(vx, vy, 5, 0, 2 * Math.PI);
      ctx.fillStyle = accentColor;
      ctx.fill();
    }
  }, [face, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
    />
  );
};
