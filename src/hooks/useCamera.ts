import { useState, useEffect, useRef, useCallback } from 'react';
import { cameraService, CameraOptions } from '../services/cameraService';

export interface UseCameraOptions extends CameraOptions {
  autoStart?: boolean;
}

export function useCamera(initialOptions?: UseCameraOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(initialOptions?.deviceId || '');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(initialOptions?.facingMode || 'user');
  const [resolution, setResolution] = useState<{ width: number; height: number }>({
    width: initialOptions?.width || 640,
    height: initialOptions?.height || 480,
  });
  const [fps, setFps] = useState<number>(initialOptions?.frameRate || 30);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const autoStart = initialOptions?.autoStart ?? true;

  const fetchDevices = useCallback(async () => {
    try {
      const devList = await cameraService.getDevices();
      setDevices(devList);
      if (devList.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(devList[0].deviceId);
      }
    } catch (err: any) {
      console.warn('[useCamera] Could not enumerate devices:', err);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const isManuallyStoppedRef = useRef(false);

  const start = useCallback(async (customVideoEl?: HTMLVideoElement) => {
    const el = customVideoEl || videoRef.current;
    if (!el) {
      setError('Video element reference not attached.');
      return;
    }

    isManuallyStoppedRef.current = false;
    setIsLoading(true);
    setError(null);

    try {
      await cameraService.startCamera(el, {
        deviceId: selectedDeviceId || undefined,
        facingMode: !selectedDeviceId ? facingMode : undefined,
        width: resolution.width,
        height: resolution.height,
        frameRate: fps,
      });
      setIsActive(true);
      fetchDevices();
    } catch (err: any) {
      console.error('[useCamera] Start error:', err);
      setError(err.message || 'Failed to access camera.');
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeviceId, facingMode, resolution, fps, fetchDevices]);

  const stop = useCallback(() => {
    isManuallyStoppedRef.current = true;
    cameraService.stopCamera();
    setIsActive(false);
  }, []);

  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    setSelectedDeviceId('');
  }, []);

  // Auto-start camera on initial load when video element is ready (unless user explicitly stopped it)
  useEffect(() => {
    if (autoStart && videoRef.current && !isActive && !isLoading && !error && !isManuallyStoppedRef.current) {
      start();
    }
  }, [autoStart, start, isActive, isLoading, error]);

  return {
    videoRef,
    isActive,
    isLoading,
    error,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    facingMode,
    setFacingMode,
    toggleFacingMode,
    resolution,
    setResolution,
    fps,
    setFps,
    start,
    stop,
    isFrontFacing: facingMode === 'user' && !selectedDeviceId,
  };
}
