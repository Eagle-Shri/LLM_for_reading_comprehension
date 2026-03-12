import { useState, useEffect } from 'react';
import { Languages, Loader2, Volume2, Type, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { playTextToSpeech } from '../utils/audio';
import type { TranslationResult, SupportedLanguagesResponse } from '../types/api';

interface TranslateTextProps {
  text: string;
}

export function TranslateText({ text }: TranslateTextProps) {
  const defaultLanguages = ['Spanish', 'French', 'German', 'Hindi', 'Tamil', 'Mandarin', 'Japanese', 'Italian', 'Portuguese', 'Russian'];
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [includePronunciation, setIncludePronunciation] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [languages, setLanguages] = useState<string[]>(defaultLanguages);
  const [viewMode, setViewMode] = useState<'sentence' | 'word'>('sentence');
  const [playingAudio, setPlayingAudio] = useState<{ index: number; type: 'original' | 'translated' } | null>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response: SupportedLanguagesResponse = await api.getSupportedLanguages();
        if (response.languages && response.languages.length > 0) {
          setLanguages(response.languages);
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };
    fetchLanguages();
  }, []);

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const translationResult = await api.translate({
        text,
        targetLanguage,
        includePronunciation,
      });
      setResult(translationResult);
    } catch (error) {
      console.error('Error translating:', error);
      alert('Failed to translate text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = async (text: string, language: string, index: number, type: 'original' | 'translated') => {
    setPlayingAudio({ index, type });
    try {
      await playTextToSpeech(text, language);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setPlayingAudio(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-3">
          <label htmlFor="targetLanguage" className="text-lg font-semibold text-gray-700">
            Translate to:
          </label>
          <select
            id="targetLanguage"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-400 focus:outline-none text-gray-800"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <input
            id="includePronunciation"
            type="checkbox"
            checked={includePronunciation}
            onChange={(e) => setIncludePronunciation(e.target.checked)}
            className="w-5 h-5 text-blue-500 rounded focus:ring-blue-400"
          />
          <label htmlFor="includePronunciation" className="text-gray-700 font-medium">
            Include pronunciation guide
          </label>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleTranslate}
          disabled={loading}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Translating...</span>
            </>
          ) : (
            <>
              <Languages className="w-5 h-5" />
              <span>Translate</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-6">
          {result.sentenceBreakdown && result.sentenceBreakdown.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Translation Breakdown</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('sentence')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      viewMode === 'sentence'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Sentence Meaning
                  </button>
                  <button
                    onClick={() => setViewMode('word')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      viewMode === 'word'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    Word-by-Word
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {result.sentenceBreakdown.map((sentence, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-200">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-500 mb-1">English</p>
                          <p className="text-lg text-gray-800">{sentence.originalSentence}</p>
                        </div>
                        <button
                          onClick={() => handlePlayAudio(sentence.originalSentence, 'en-US', index, 'original')}
                          className="ml-3 p-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors disabled:opacity-50"
                          disabled={playingAudio?.index === index && playingAudio?.type === 'original'}
                        >
                          <Volume2 className={`w-5 h-5 ${playingAudio?.index === index && playingAudio?.type === 'original' ? 'text-blue-500 animate-pulse' : 'text-gray-600'}`} />
                        </button>
                      </div>

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-500 mb-1">{result.targetLanguage}</p>
                          <p className="text-xl font-semibold text-blue-600">{sentence.translatedSentence}</p>
                        </div>
                        <button
                          onClick={() => handlePlayAudio(sentence.translatedSentence, targetLanguage.toLowerCase(), index, 'translated')}
                          className="ml-3 p-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors disabled:opacity-50"
                          disabled={playingAudio?.index === index && playingAudio?.type === 'translated'}
                        >
                          <Volume2 className={`w-5 h-5 ${playingAudio?.index === index && playingAudio?.type === 'translated' ? 'text-blue-500 animate-pulse' : 'text-gray-600'}`} />
                        </button>
                      </div>

                      {viewMode === 'sentence' && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-sm font-semibold text-gray-600 mb-1">Why this translation:</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{sentence.simplifiedExplanation}</p>
                        </div>
                      )}

                      {viewMode === 'word' && sentence.wordByWord && sentence.wordByWord.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-sm font-semibold text-gray-600 mb-2">Word-by-Word:</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {sentence.wordByWord.map((word, wordIndex) => (
                              <div key={wordIndex} className="bg-white p-2 rounded-lg border border-blue-100">
                                <p className="text-xs text-gray-500">{word.original}</p>
                                <p className="text-sm font-semibold text-blue-600">{word.translation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Full Translation ({result.targetLanguage}):</h4>
              <p className="text-xl font-semibold text-blue-600">{result.translatedText}</p>
            </div>
            {result.pronunciationGuide && (
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Pronunciation Guide:</h4>
                <p className="text-lg text-gray-700 italic">{result.pronunciationGuide}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
