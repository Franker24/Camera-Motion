import React from 'react';
import { HandData, FaceData } from '../../types/gestures';
import { HandCanvasOverlay } from './HandCanvasOverlay';
import { FaceCanvasOverlay } from './FaceCanvasOverlay';

interface CombinedCanvasOverlayProps {
  hands: HandData[];
  face: FaceData;
  width: number;
  height: number;
  showHands?: boolean;
  showFace?: boolean;
}

export const CombinedCanvasOverlay: React.FC<CombinedCanvasOverlayProps> = ({
  hands,
  face,
  width,
  height,
  showHands = true,
  showFace = true,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {showFace && (
        <FaceCanvasOverlay
          face={face}
          width={width}
          height={height}
        />
      )}
      {showHands && (
        <HandCanvasOverlay
          hands={hands}
          width={width}
          height={height}
        />
      )}
    </div>
  );
};
