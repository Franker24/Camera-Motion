import { useState, useEffect } from 'react';
import { faceLandmarkerService } from '../services/faceLandmarker';

export function useFaceTracking() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    faceLandmarkerService
      .initialize()
      .then(() => {
        if (mounted) setIsReady(true);
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Failed to initialize Face Landmarker');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { isReady, error };
}
