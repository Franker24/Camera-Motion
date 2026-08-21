import { useState, useEffect, useCallback } from 'react';
import { voiceService } from '../services/voiceService';
import { VoiceCommand } from '../types/motion';
import { socketService } from '../services/socketService';

export function useVoiceControl(onCommandReceived?: (command: VoiceCommand) => void) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);

  useEffect(() => {
    setIsSupported(voiceService.isSupported());

    const handleCommand = (cmd: VoiceCommand) => {
      setLastCommand(cmd);
      if (onCommandReceived) {
        onCommandReceived(cmd);
      }
      // Broadcast voice command over socket
      socketService.sendVoiceCommand(cmd);
    };

    voiceService.addListener(handleCommand);

    return () => {
      voiceService.removeListener(handleCommand);
    };
  }, [onCommandReceived]);

  const startListening = useCallback(() => {
    voiceService.startListening();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    voiceService.stopListening();
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    lastCommand,
    startListening,
    stopListening,
    toggleListening,
  };
}
