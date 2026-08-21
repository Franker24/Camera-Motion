import React, { useEffect, useRef, useState } from 'react';
import { CombinedCanvasOverlay } from '../overlays/CombinedCanvasOverlay';
import { HandData, FaceData } from '../../types/gestures';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isFrontFacing?: boolean;
  hands?: HandData[];
  face?: FaceData;
  showHandsOverlay?: boolean;
  showFaceOverlay?: boolean;
  onDimensionsChanged?: (dimensions: { width: number; height: number }) => void;
  className?: string;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  isFrontFacing = false,
  hands = [],
  face = {
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
  showHandsOverlay = true,
  showFaceOverlay = true,
  onDimensionsChanged,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 640,
    height: 480,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.round(rect.width || 640);
      const h = Math.round(rect.height || 480);

      setDimensions((prev) => {
        if (prev.width === w && prev.height === h) return prev;
        return { width: w, height: h };
      });

      if (onDimensionsChanged) {
        onDimensionsChanged({ width: w, height: h });
      }
    };

    updateSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(container);

    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', updateSize);
    }

    return () => {
      resizeObserver.disconnect();
      if (video) {
        video.removeEventListener('loadedmetadata', updateSize);
      }
    };
  }, [videoRef, onDimensionsChanged]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[320px] rounded-xl overflow-hidden bg-slate-950 border border-cyan-900/40 shadow-2xl flex items-center justify-center ${className}`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        className="scale-x-[-1]"
      />

      <CombinedCanvasOverlay
        hands={hands}
        face={face}
        width={dimensions.width}
        height={dimensions.height}
        showHands={showHandsOverlay}
        showFace={showFaceOverlay}
      />
    </div>
  );
};
