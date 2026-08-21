import { VoiceCommand } from '../types/motion';

export type VoiceListenerCallback = (command: VoiceCommand) => void;

class VoiceService {
  private recognition: any = null;
  private isListening = false;
  private listeners: Set<VoiceListenerCallback> = new Set();

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
        const confidence = event.results[lastResultIndex][0].confidence || 0.9;

        console.log('[VoiceService] Spoken phrase:', transcript);
        const parsedCommand = this.parseVoiceCommand(transcript, confidence);
        this.notifyListeners(parsedCommand);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('[VoiceService] Speech recognition error:', event.error);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            // Already started or restarting
          }
        }
      };
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public startListening() {
    if (!this.recognition || this.isListening) return;
    try {
      this.isListening = true;
      this.recognition.start();
      console.log('[VoiceService] Started speech recognition');
    } catch (e) {
      console.warn('[VoiceService] Could not start speech recognition:', e);
    }
  }

  public stopListening() {
    if (!this.recognition || !this.isListening) return;
    this.isListening = false;
    try {
      this.recognition.stop();
      console.log('[VoiceService] Stopped speech recognition');
    } catch (e) {
      console.warn('[VoiceService] Could not stop speech recognition:', e);
    }
  }

  public addListener(callback: VoiceListenerCallback) {
    this.listeners.add(callback);
  }

  public removeListener(callback: VoiceListenerCallback) {
    this.listeners.delete(callback);
  }

  private notifyListeners(command: VoiceCommand) {
    this.listeners.forEach((listener) => listener(command));
  }

  public parseVoiceCommand(transcript: string, confidence: number): VoiceCommand {
    const text = transcript.toLowerCase();

    if (text.includes('canvas') || text.includes('draw') || text.includes('dibujar')) {
      return { command: text, action: 'navigate', target: 'air-canvas', timestamp: Date.now(), confidence };
    }
    if (text.includes('arcade') || text.includes('game') || text.includes('juego')) {
      return { command: text, action: 'navigate', target: 'arcade', timestamp: Date.now(), confidence };
    }
    if (text.includes('theremin') || text.includes('music') || text.includes('musica')) {
      return { command: text, action: 'navigate', target: 'theremin', timestamp: Date.now(), confidence };
    }
    if (text.includes('3d') || text.includes('three') || text.includes('viewport')) {
      return { command: text, action: 'navigate', target: 'three', timestamp: Date.now(), confidence };
    }
    if (text.includes('ar') || text.includes('augmented') || text.includes('spatial')) {
      return { command: text, action: 'navigate', target: 'ar', timestamp: Date.now(), confidence };
    }
    if (text.includes('clear') || text.includes('limpiar') || text.includes('borrar')) {
      return { command: text, action: 'clear', timestamp: Date.now(), confidence };
    }
    if (text.includes('reset') || text.includes('reiniciar')) {
      return { command: text, action: 'reset', timestamp: Date.now(), confidence };
    }
    if (text.includes('stop') || text.includes('detener') || text.includes('pausa')) {
      return { command: text, action: 'stop', timestamp: Date.now(), confidence };
    }

    return { command: text, action: 'unknown', timestamp: Date.now(), confidence };
  }
}

export const voiceService = new VoiceService();
