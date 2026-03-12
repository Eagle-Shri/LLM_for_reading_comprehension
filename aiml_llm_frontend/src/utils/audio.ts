export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to access microphone. Please check permissions.');
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();

  return new Promise((resolve, reject) => {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };

    recognition.onerror = (event: any) => {
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.start();
  });
}

export class SpeechRecognitionRecorder {
  private recognition: any = null;
  private transcript: string = '';
  private isActive: boolean = false;
  private resolveStop: ((transcript: string) => void) | null = null;

  constructor() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true; // Changed to true to capture partials if needed, but handled in logic
      this.recognition.lang = 'en-US';
    }
  }

  startRecording(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition is not supported in this browser'));
        return;
      }

      this.transcript = '';
      this.isActive = true;
      this.resolveStop = null;

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            this.transcript += event.results[i][0].transcript + ' ';
            console.log('Final chunk:', event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        console.log('Current transcript state:', this.transcript);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isActive = false;
      };

      this.recognition.onend = () => {
        console.log('Recognition ended');
        this.isActive = false;
        if (this.resolveStop) {
          this.resolveStop(this.transcript.trim());
          this.resolveStop = null;
        }
      };

      this.recognition.onstart = () => {
        console.log('Recognition started');
        resolve();
      };

      try {
        this.recognition.start();
      } catch (e) {
        // If already started, just resolve
        console.warn('Recognition already started or error starting:', e);
        resolve();
      }
    });
  }

  stopRecording(): Promise<string> {
    return new Promise((resolve) => {
      if (!this.recognition || !this.isActive) {
        resolve(this.transcript.trim());
        return;
      }

      this.resolveStop = resolve;
      this.recognition.stop();
      // isActive will be set to false in onend
    });
  }

  isRecording(): boolean {
    return this.isActive;
  }
}

export function speakText(text: string): void {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  window.speechSynthesis.cancel();
}

export function playTextToSpeech(text: string, language: string = 'en-US'): Promise<void> {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(event);

    window.speechSynthesis.speak(utterance);
  });
}
