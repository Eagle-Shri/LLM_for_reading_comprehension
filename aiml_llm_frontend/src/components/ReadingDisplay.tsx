import { useState, useEffect } from 'react';
import { Mic, Square, Loader2, Volume2 } from 'lucide-react';
import { SpeechRecognitionRecorder } from '../utils/audio';
import { api } from '../services/api';
import type { AnalysisResult } from '../types/api';

interface ReadingDisplayProps {
  text: string;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export function ReadingDisplay({ text, onAnalysisComplete }: ReadingDisplayProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [includeVocabulary, setIncludeVocabulary] = useState(true);
  const [includeGrammar, setIncludeGrammar] = useState(true);
  const [recorder] = useState(() => new SpeechRecognitionRecorder());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleRecordClick = async () => {
    if (!isRecording) {
      try {
        await recorder.startRecording();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
        alert('Failed to start recording. Please check microphone permissions.');
      }
    } else {
      setIsRecording(false);
      setIsProcessing(true);

      try {
        const spokenText = await recorder.stopRecording();
        console.log('Spoken text captured:', spokenText);

        if (!spokenText) {
          alert('No speech detected. Please try reading louder or check your microphone.');
          setIsProcessing(false);
          return;
        }

        const result = await api.analyzeReading({
          originalText: text,
          spokenText: spokenText,
          includeVocabulary,
          includeGrammar,
        });
        onAnalysisComplete(result);
      } catch (error) {
        console.error('Error analyzing reading:', error);
        alert('Failed to analyze reading. Please try again.');
        setIsProcessing(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSpeakText = () => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 0.8;
    speech.pitch = 1.1;
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Your Story:</h3>
          <button
            onClick={handleSpeakText}
            className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full shadow-md transform transition-all duration-200 hover:scale-105"
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen</span>
          </button>
        </div>
        <div className="prose prose-lg max-w-none">
          <p className="text-xl leading-relaxed text-gray-800" style={{ fontFamily: 'Nunito, sans-serif' }}>
            {text}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Analysis Options:</h4>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeVocabulary}
              onChange={(e) => setIncludeVocabulary(e.target.checked)}
              className="w-4 h-4 text-teal-500 rounded focus:ring-teal-400"
            />
            <span className="text-gray-700">Include vocabulary analysis</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeGrammar}
              onChange={(e) => setIncludeGrammar(e.target.checked)}
              className="w-4 h-4 text-teal-500 rounded focus:ring-teal-400"
            />
            <span className="text-gray-700">Include grammar analysis</span>
          </label>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={handleRecordClick}
          disabled={isProcessing}
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-xl transform transition-all duration-300 ${isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-500 hover:scale-110'
            }`}
        >
          {isProcessing ? (
            <Loader2 className="w-16 h-16 text-white animate-spin" />
          ) : isRecording ? (
            <Square className="w-16 h-16 text-white" />
          ) : (
            <Mic className="w-16 h-16 text-white" />
          )}
        </button>

        <div className="text-center">
          {isProcessing ? (
            <p className="text-lg font-semibold text-gray-700">Analyzing your amazing reading...</p>
          ) : isRecording ? (
            <div className="space-y-1">
              <p className="text-lg font-semibold text-red-600">Recording...</p>
              <p className="text-2xl font-bold text-gray-800">{formatTime(recordingTime)}</p>
              <p className="text-sm text-gray-600">Tap to stop</p>
            </div>
          ) : (
            <p className="text-lg font-semibold text-gray-700">Tap here to start reading!</p>
          )}
        </div>
      </div>
    </div>
  );
}
