import { ShapeRecognitionResult } from '../types/gestures';

export interface Point2D {
  x: number;
  y: number;
}

export class ShapeRecognizer {
  public static recognize(points: Point2D[]): ShapeRecognitionResult {
    if (points.length < 10) {
      return { shape: 'unknown', confidence: 0, pointsCount: points.length };
    }

    // Downsample & normalize points
    const normalized = this.normalizePoints(points);
    const boundingBox = this.getBoundingBox(normalized);
    const width = boundingBox.maxX - boundingBox.minX;
    const height = boundingBox.maxY - boundingBox.minY;
    const aspectRatio = width / (height || 1);

    // Distance start to end
    const startPoint = normalized[0];
    const endPoint = normalized[normalized.length - 1];
    const closureDist = Math.hypot(startPoint.x - endPoint.x, startPoint.y - endPoint.y);

    const totalPathLength = this.calculatePathLength(normalized);
    const diagonal = Math.hypot(width, height);

    // 1. Line Test (straight movement, high start-to-end vs path ratio)
    const directDist = Math.hypot(startPoint.x - endPoint.x, startPoint.y - endPoint.y);
    if (directDist / totalPathLength > 0.85) {
      return { shape: 'line', confidence: Math.min(1, directDist / totalPathLength), pointsCount: points.length };
    }

    // 2. Closed Shape Tests
    const isClosed = closureDist < diagonal * 0.3;

    if (isClosed) {
      // Circle test: distance to center point variance
      const center = {
        x: (boundingBox.minX + boundingBox.maxX) / 2,
        y: (boundingBox.minY + boundingBox.maxY) / 2,
      };

      const distances = normalized.map((p) => Math.hypot(p.x - center.x, p.y - center.y));
      const avgRadius = distances.reduce((a, b) => a + b, 0) / distances.length;
      const variance = distances.reduce((sum, r) => sum + Math.pow(r - avgRadius, 2), 0) / distances.length;
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / (avgRadius || 1); // coefficient of variation

      if (cv < 0.22 && aspectRatio > 0.6 && aspectRatio < 1.6) {
        return { shape: 'circle', confidence: Math.max(0.6, 1 - cv * 3), pointsCount: points.length };
      }

      // Square vs Triangle by aspect ratio and corner count approximation
      if (aspectRatio > 0.75 && aspectRatio < 1.35) {
        return { shape: 'square', confidence: 0.8, pointsCount: points.length };
      }

      return { shape: 'triangle', confidence: 0.7, pointsCount: points.length };
    }

    return { shape: 'unknown', confidence: 0.3, pointsCount: points.length };
  }

  private static normalizePoints(points: Point2D[]): Point2D[] {
    if (points.length === 0) return [];
    const minX = Math.min(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));

    return points.map((p) => ({
      x: p.x - minX,
      y: p.y - minY,
    }));
  }

  private static getBoundingBox(points: Point2D[]) {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }

  private static calculatePathLength(points: Point2D[]): number {
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    }
    return length;
  }
}
