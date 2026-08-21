import { useState, useEffect } from 'react';
import { handLandmarkerService } from '../services/handLandmarker';

export function useHandTracking() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    handLandmarkerService
      .initialize()
      .then(() => {
        if (mounted) setIsReady(true);
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Failed to initialize Hand Landmarker');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { isReady, error };
}
