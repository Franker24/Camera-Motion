import React, { useEffect, useRef } from 'react';
import { HandData } from '../../types/gestures';

const FINGER_PATHS = [
  [0, 1, 2, 3, 4],       // Thumb
  [0, 5, 6, 7, 8],       // Index
  [0, 9, 10, 11, 12],    // Middle
  [0, 13, 14, 15, 16],   // Ring
  [0, 17, 18, 19, 20],   // Pinky
];

interface HandCanvasOverlayProps {
  hands: HandData[];
  width: number;
  height: number;
}

export const HandCanvasOverlay: React.FC<HandCanvasOverlayProps> = ({
  hands,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ringRotationRef = useRef(0);
  const motionTrailRef = useRef<{ x: number; y: number; alpha: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (!hands || hands.length === 0) {
      motionTrailRef.current = [];
      return;
    }

    // Increment rotation for Stark ARC Reactor Rings
    ringRotationRef.current += 0.04;

    hands.forEach((hand) => {
      const lm = hand.landmarks;
      if (!lm || lm.length === 0) return;

      const getPt = (idx: number) => {
        if (!lm[idx]) return null;
        // Coordinate flip (1 - x) to align with selfie video feed
        const x = (1 - lm[idx].x) * width;
        const y = lm[idx].y * height;
        return { x, y };
      };

      const primaryColor = hand.isPinching ? '#f43f5e' : '#06b6d4';
      const accentColor = hand.isPinching ? '#fda4af' : '#38bdf8';
      const glowColor = hand.isPinching ? 'rgba(244, 63, 94, 0.45)' : 'rgba(6, 182, 212, 0.45)';

      // 1. Kinetic Motion Trail (from JESTER CV)
      const indexPt = getPt(8);
      if (indexPt) {
        motionTrailRef.current.push({ x: indexPt.x, y: indexPt.y, alpha: 1.0 });
        if (motionTrailRef.current.length > 18) motionTrailRef.current.shift();

        // Render Motion Trail Spline
        if (motionTrailRef.current.length > 1) {
          ctx.beginPath();
          ctx.moveTo(motionTrailRef.current[0].x, motionTrailRef.current[0].y);
          for (let i = 1; i < motionTrailRef.current.length; i++) {
            const pt = motionTrailRef.current[i];
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.strokeStyle = glowColor;
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      }

      // 2. Stark / JARVIS ARC Reactor Palm Light & Rotating Rings
      const pPalm = getPt(9) || getPt(0);
      if (pPalm) {
        // Outer Radial Aura
        const auraGrad = ctx.createRadialGradient(pPalm.x, pPalm.y, 4, pPalm.x, pPalm.y, 65);
        auraGrad.addColorStop(0, hand.isPinching ? 'rgba(244, 63, 94, 0.4)' : 'rgba(6, 182, 212, 0.35)');
        auraGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

        ctx.beginPath();
        ctx.arc(pPalm.x, pPalm.y, 65, 0, 2 * Math.PI);
        ctx.fillStyle = auraGrad;
        ctx.fill();

        // Rotating ARC Reactor Outer Ring 1
        ctx.save();
        ctx.translate(pPalm.x, pPalm.y);
        ctx.rotate(ringRotationRef.current);
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, 1.5 * Math.PI);
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.restore();

        // Rotating ARC Reactor Ring 2 (Counter-rotation)
        ctx.save();
        ctx.translate(pPalm.x, pPalm.y);
        ctx.rotate(-ringRotationRef.current * 1.5);
        ctx.beginPath();
        ctx.arc(0, 0, 38, 0, 2 * Math.PI);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 10]);
        ctx.stroke();
        ctx.restore();

        // Central Energy Core Node
        ctx.beginPath();
        ctx.arc(pPalm.x, pPalm.y, 9, 0, 2 * Math.PI);
        ctx.fillStyle = accentColor;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 3. Flexible Curved Finger Bones (Smooth Quadratic Splines)
      FINGER_PATHS.forEach((finger) => {
        const pts = finger.map(getPt).filter(Boolean) as { x: number; y: number }[];
        if (pts.length < 2) return;

        // Outer Glow Path
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const xc = (pts[i - 1].x + pts[i].x) / 2;
          const yc = (pts[i - 1].y + pts[i].y) / 2;
          ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Core Line
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          const xc = (pts[i - 1].x + pts[i].x) / 2;
          const yc = (pts[i - 1].y + pts[i].y) / 2;
          ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });

      // 4. Stark Lock Target Reticle at Index Tip
      if (indexPt) {
        ctx.beginPath();
        ctx.arc(indexPt.x, indexPt.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = hand.isPinching ? '#f43f5e' : '#38bdf8';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(indexPt.x, indexPt.y, 16, 0, 2 * Math.PI);
        ctx.strokeStyle = hand.isPinching ? '#f43f5e' : '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Target Crosshair ticks
        ctx.beginPath();
        ctx.moveTo(indexPt.x - 22, indexPt.y); ctx.lineTo(indexPt.x - 12, indexPt.y);
        ctx.moveTo(indexPt.x + 12, indexPt.y); ctx.lineTo(indexPt.x + 22, indexPt.y);
        ctx.moveTo(indexPt.x, indexPt.y - 22); ctx.lineTo(indexPt.x, indexPt.y - 12);
        ctx.moveTo(indexPt.x, indexPt.y + 12); ctx.lineTo(indexPt.x, indexPt.y + 22);
        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 5. Joint Nodes at all 21 Keypoints
      lm.forEach((_, idx) => {
        if (idx === 8) return; // Index tip already drawn above
        const pt = getPt(idx);
        if (!pt) return;

        ctx.beginPath();
        if (idx === 4) {
          ctx.arc(pt.x, pt.y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = '#a855f7';
          ctx.fill();
        } else {
          ctx.arc(pt.x, pt.y, 3.5, 0, 2 * Math.PI);
          ctx.fillStyle = '#22d3ee';
          ctx.fill();
        }
      });

      // 6. Electric Lightning Arc on Pinch
      const pThumb = getPt(4);
      if (hand.isPinching && pThumb && indexPt) {
        ctx.beginPath();
        ctx.moveTo(pThumb.x, pThumb.y);

        // Jagged Lightning Arc
        const midX = (pThumb.x + indexPt.x) / 2 + (Math.random() - 0.5) * 12;
        const midY = (pThumb.y + indexPt.y) / 2 + (Math.random() - 0.5) * 12;

        ctx.lineTo(midX, midY);
        ctx.lineTo(indexPt.x, indexPt.y);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(midX, midY, 14, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(244, 63, 94, 0.6)';
        ctx.fill();
      }

      // 7. Bounding Box & HUD Banner
      const xs = lm.map((p) => (1 - p.x) * width);
      const ys = lm.map((p) => p.y * height);
      const minX = Math.min(...xs) - 15;
      const maxX = Math.max(...xs) + 15;
      const minY = Math.min(...ys) - 15;
      const maxY = Math.max(...ys) + 15;
      const boxW = maxX - minX;

      const cornerLen = Math.min(18, boxW * 0.22);
      ctx.lineWidth = 2;
      ctx.strokeStyle = primaryColor;
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(minX, minY + cornerLen); ctx.lineTo(minX, minY); ctx.lineTo(minX + cornerLen, minY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(maxX - cornerLen, minY); ctx.lineTo(maxX, minY); ctx.lineTo(maxX, minY + cornerLen);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(minX, maxY - cornerLen); ctx.lineTo(minX, maxY); ctx.lineTo(minX + cornerLen, maxY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(maxX - cornerLen, maxY); ctx.lineTo(maxX, maxY); ctx.lineTo(maxX, maxY - cornerLen);
      ctx.stroke();

      // HUD Label
      const labelText = `[ 🖐️ STARK ARC HAND // ${hand.handedness.toUpperCase()} | GESTURE: ${hand.gesture} | FINGERS: ${hand.extendedFingers}/5 ]`;
      ctx.font = 'bold 11px "Fira Code", monospace';
      const textWidth = ctx.measureText(labelText).width;

      ctx.fillStyle = 'rgba(3, 7, 18, 0.9)';
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(minX, minY - 26, textWidth + 16, 22, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = hand.isPinching ? '#f43f5e' : '#38bdf8';
      ctx.fillText(labelText, minX + 8, minY - 11);
    });
  }, [hands, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
    />
  );
};
