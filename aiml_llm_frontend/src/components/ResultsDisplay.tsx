import { useState, useEffect } from 'react';
import { BookOpen, Volume2, CheckCircle, AlertCircle } from 'lucide-react';
import { speakText } from '../utils/audio';
import { TranslateText } from './TranslateText';
import { SimplifyText } from './SimplifyText';
import { ReadingTips } from './ReadingTips';
import { PracticeTips } from './PracticeTips';
import { progressService } from '../services/progressService';
import type { AnalysisResult, PronunciationError } from '../types/api';

interface ResultsDisplayProps {
  result: AnalysisResult;
  originalText: string;
}

export function ResultsDisplay({ result, originalText }: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'grammar' | 'practice' | 'translate' | 'simplify' | 'tips' | 'progress'>('vocabulary');
  const [selectedError, setSelectedError] = useState<PronunciationError | null>(null);
  const [selectedMissing, setSelectedMissing] = useState<string | null>(null);

  useEffect(() => {
    const saveSession = async () => {
      const readingTime = 120;
      const difficulty = result.accuracyPercentage >= 90 ? 'easy' : result.accuracyPercentage >= 70 ? 'medium' : 'hard';
      await progressService.saveReadingSession(originalText, result, readingTime, difficulty);
    };
    saveSession();
  }, [result, originalText]);

  const totalWords = originalText.split(' ').filter(w => w.trim()).length;
  const wordsRead = result.totalWordsRead || totalWords;
  const correctWords = result.correctWordsCount || (wordsRead - result.pronunciationErrors.length - result.missingWords.length);
  const pronunciationScore = wordsRead > 0 ? Math.round((correctWords / wordsRead) * 100) : 0;

  const renderHighlightedText = () => {
    const words = originalText.split(' ');
    const errorMap = new Map(
      result.pronunciationErrors.map((err) => [err.position, err])
    );
    const missingSet = new Set(result.missingWords.map(m => m.word));

    return (
      <div className="flex flex-wrap gap-2">
        {words.map((word, index) => {
          const cleanWord = word.replace(/[^\w]/g, '');
          const error = errorMap.get(index);
          const isMissing = missingSet.has(cleanWord);

          if (error) {
            return (
              <button
                key={index}
                onClick={() => setSelectedError(error)}
                className="relative underline decoration-wavy decoration-red-500 decoration-2 hover:bg-red-50 px-1 rounded cursor-pointer transition-colors"
              >
                {word}
              </button>
            );
          }

          if (isMissing) {
            return (
              <button
                key={index}
                onClick={() => setSelectedMissing(cleanWord)}
                className="bg-blue-100 hover:bg-blue-200 px-1 rounded cursor-pointer transition-colors"
              >
                {word}
              </button>
            );
          }

          return (
            <span key={index} className="px-1">
              {word}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-br from-peach-50 via-coral-50 to-yellow-50 p-8 rounded-3xl shadow-xl border-4 border-coral-200 animate-slideUp relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-coral-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="flex items-start space-x-4 relative z-10">
          <div className="bg-gradient-to-br from-coral-400 to-peach-400 rounded-2xl p-4 shadow-lg animate-bounce-slow">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-black text-gray-800 mb-3" style={{ fontFamily: 'Poppins' }}>Wow, amazing effort!</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-3" style={{ fontFamily: 'Nunito' }}>
              You're doing a fantastic job understanding and sounding out each word. With every story you read, your confidence and fluency are growing stronger!
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-3" style={{ fontFamily: 'Nunito' }}>
              Take your time, focus on each word, and remember — great readers aren't just fast, they understand what they read.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed font-semibold" style={{ fontFamily: 'Nunito' }}>
              I'm so proud of your progress — keep shining and turning every page with curiosity and courage!
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-5 relative z-10">
          <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Poppins' }}>Reading Score</span>
              <span className="text-4xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{pronunciationScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${pronunciationScore}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gradient-to-br from-violet-100 to-purple-100 p-4 rounded-2xl shadow-md border-2 border-violet-200 transform transition-all duration-300 hover:scale-105">
              <p className="text-3xl font-black text-violet-600" style={{ fontFamily: 'Poppins' }}>{wordsRead}</p>
              <p className="text-sm font-semibold text-gray-600 mt-1" style={{ fontFamily: 'Nunito' }}>Words Read</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 to-green-100 p-4 rounded-2xl shadow-md border-2 border-emerald-200 transform transition-all duration-300 hover:scale-105">
              <p className="text-3xl font-black text-emerald-600" style={{ fontFamily: 'Poppins' }}>{correctWords}</p>
              <p className="text-sm font-semibold text-gray-600 mt-1" style={{ fontFamily: 'Nunito' }}>Correct</p>
            </div>
            <div className="bg-gradient-to-br from-peach-100 to-coral-100 p-4 rounded-2xl shadow-md border-2 border-coral-200 transform transition-all duration-300 hover:scale-105">
              <p className="text-3xl font-black text-coral-600" style={{ fontFamily: 'Poppins' }}>{result.pronunciationErrors.length}</p>
              <p className="text-sm font-semibold text-gray-600 mt-1" style={{ fontFamily: 'Nunito' }}>Practice</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-violet-200 animate-fadeIn">
        <h3 className="text-2xl font-black text-gray-800 mb-5" style={{ fontFamily: 'Poppins' }}>Your Reading</h3>
        <div className="text-xl leading-relaxed text-gray-800" style={{ fontFamily: 'Nunito' }}>
          {renderHighlightedText()}
        </div>

        {selectedError && (
          <div className="mt-6 p-5 bg-gradient-to-br from-coral-50 to-peach-50 rounded-2xl border-3 border-coral-300 shadow-lg animate-scaleIn">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">You said:</p>
                <p className="text-lg font-semibold text-red-600 mb-2">{selectedError.spokenAs}</p>
                <p className="text-sm text-gray-600 mb-1">Try saying:</p>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-semibold text-green-600">{selectedError.originalWord}</p>
                  <button
                    onClick={() => speakText(selectedError.originalWord)}
                    className="bg-green-400 hover:bg-green-500 text-white p-2 rounded-full transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedError(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {selectedMissing && (
          <div className="mt-6 p-5 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border-3 border-violet-300 shadow-lg animate-scaleIn">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-blue-600">Oops, this word was missed!</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{selectedMissing}</p>
              </div>
              <button
                onClick={() => setSelectedMissing(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border-4 border-yellow-200 overflow-hidden animate-fadeIn">
        <div className="grid grid-cols-7 border-b-4 border-yellow-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`py-4 px-2 md:px-4 font-bold text-sm md:text-base transition-all duration-300 transform ${
              activeTab === 'vocabulary'
                ? 'bg-gradient-to-br from-violet-400 to-purple-400 text-white shadow-lg scale-105'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 hover:from-violet-100 hover:to-purple-100 hover:scale-102'
            }`}
            style={{ fontFamily: 'Poppins' }}
          >
            📖 Words
          </button>
          <button
            onClick={() => setActiveTab('grammar')}
            className={`py-4 px-2 md:px-4 font-bold text-sm md:text-base transition-all duration-300 transform ${
              activeTab === 'grammar'
                ? 'bg-gradient-to-br from-emerald-400 to-green-400 text-white shadow-lg scale-105'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 hover:from-emerald-100 hover:to-green-100 hover:scale-102'
            }`}
            style={{ fontFamily: 'Poppins' }}
          >
            ✅ Grammar
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`py-4 px-2 md:px-4 font-bold text-sm md:text-base transition-all duration-300 transform ${
              activeTab === 'practice'
                ? 'bg-gradient-to-br from-yellow-400 to-amber-400 text-white shadow-lg scale-105'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 hover:from-yellow-100 hover:to-amber-100 hover:scale-102'
            }`}
            style={{ fontFamily: 'Poppins' }}
          >
            ⭐ Practice
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`py-4 px-2 md:px-4 font-bold text-sm md:text-base transition-all duration-300 transform ${
              activeTab === 'progress'
                ? 'bg-gradient-to-br from-teal-400 to-cyan-400 text-white shadow-lg scale-105'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 hover:from-teal-100 hover:to-cyan-100 hover:scale-102'
            }`}
            style={{ fontFamily: 'Poppins' }}
          >
            📊 Progress
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`py-4 px-2 md:px-4 font-bold text-sm md:text-base transition-all duration-300 transform ${
              activeTab === 'tips'
                ? 'bg-gradient-to-br from-coral-400 to-peach-400 text-white shadow-lg scale-105'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 hover:from-coral-100 hover:to-peach-100 hover:scale-102'
            }`}
            style={{ fontFamily: 'Poppins' }}
          >
            💡 Tips
          </button>
          <button
            onClick={() => setActiveTab('translate')}
            className={`py-4 px-2 md:px-4 font-bold text-sm md:text-base transition-all duration-300 transform ${
              activeTab === 'translate'
                ? 'bg-gradient-to-br from-cyan-400 to-teal-400 text-white shadow-lg scale-105'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 hover:from-cyan-100 hover:to-teal-100 hover:scale-102'
            }`}
            style={{ fontFamily: 'Poppins' }}
          >
            🌍 Translate
          </button>
          <button
            onClick={() => setActiveTab('simplify')}
            className={`py-4 px-2 md:px-4 font-bold text-sm md:text-base transition-all duration-300 transform ${
              activeTab === 'simplify'
                ? 'bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-lg scale-105'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-600 hover:from-pink-100 hover:to-rose-100 hover:scale-102'
            }`}
            style={{ fontFamily: 'Poppins' }}
          >
            🔍 Simplify
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'vocabulary' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-violet-100 to-purple-100 p-4 rounded-2xl border-2 border-violet-300">
                <h3 className="text-xl font-black text-gray-800 mb-2" style={{ fontFamily: 'Poppins' }}>
                  Key Vocabulary from Your Story
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Nunito' }}>
                  Learn these words to boost your vocabulary and understanding!
                </p>
              </div>

              {result.vocabularyItems.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200">
                  <div className="text-6xl mb-4">🌟</div>
                  <p className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Poppins' }}>Amazing Work!</p>
                  <p className="text-gray-600" style={{ fontFamily: 'Nunito' }}>You know all the words in this story!</p>
                </div>
              ) : (
                result.vocabularyItems.map((item, index) => {
                  const wordLength = item.word.length;
                  const difficulty = wordLength <= 4 ? 'Easy' : wordLength <= 7 ? 'Medium' : 'Challenging';
                  const difficultyColor = difficulty === 'Easy' ? 'emerald' : difficulty === 'Medium' ? 'yellow' : 'coral';

                  return (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-2xl shadow-lg border-3 border-violet-200 hover:shadow-xl transition-all duration-300 transform hover:scale-102"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-3xl font-black text-violet-600" style={{ fontFamily: 'Poppins' }}>
                            {item.word}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-${difficultyColor}-500`}>
                            {difficulty}
                          </span>
                        </div>
                        <button
                          onClick={() => speakText(item.word)}
                          className="bg-gradient-to-br from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 text-white p-3 rounded-full transition-all shadow-lg hover:scale-110"
                          title="Listen to pronunciation"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-violet-50 p-4 rounded-xl">
                          <p className="text-sm font-bold text-gray-600 mb-1" style={{ fontFamily: 'Poppins' }}>Meaning:</p>
                          <p className="text-lg text-gray-800" style={{ fontFamily: 'Nunito' }}>{item.simpleDefinition}</p>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-xl">
                          <p className="text-sm font-bold text-gray-600 mb-1" style={{ fontFamily: 'Poppins' }}>Example:</p>
                          <p className="text-gray-800 italic" style={{ fontFamily: 'Nunito' }}>"{item.exampleSentence}"</p>
                          <button
                            onClick={() => speakText(item.exampleSentence)}
                            className="mt-2 inline-flex items-center space-x-1 bg-purple-400 hover:bg-purple-500 text-white text-sm py-1 px-3 rounded-full transition-colors"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Listen</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'grammar' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 rounded-2xl border-2 border-amber-300">
                <h3 className="text-xl font-black text-gray-800 mb-2" style={{ fontFamily: 'Poppins' }}>
                  Grammar Insights from Your Reading
                </h3>
                <p className="text-gray-600" style={{ fontFamily: 'Nunito' }}>
                  Learn how sentences work and improve your English structure!
                </p>
              </div>

              {result.grammarErrors.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200">
                  <div className="text-6xl mb-4">⭐</div>
                  <p className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Poppins' }}>Perfect Grammar!</p>
                  <p className="text-gray-600" style={{ fontFamily: 'Nunito' }}>Your reading had excellent grammar structure!</p>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-300 shadow-lg">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="bg-blue-500 text-white rounded-full p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-black text-gray-800 mb-2" style={{ fontFamily: 'Poppins' }}>
                          Grammar Tip of the Day
                        </h4>
                        <p className="text-gray-700" style={{ fontFamily: 'Nunito' }}>
                          When telling stories, use <strong>past tense</strong> for things that already happened.
                          This helps your listener know when events took place!
                        </p>
                      </div>
                    </div>
                  </div>

                  {result.grammarErrors.map((error, index) => (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-2xl shadow-lg border-3 border-orange-200 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-600 mb-2" style={{ fontFamily: 'Poppins' }}>You said:</p>
                            <div className="bg-orange-50 p-4 rounded-xl border-l-4 border-orange-400">
                              <p className="text-lg font-semibold text-orange-700" style={{ fontFamily: 'Nunito' }}>
                                "{error.incorrectPhrase}"
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-6 h-6 text-emerald-500 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-600 mb-2" style={{ fontFamily: 'Poppins' }}>Better way:</p>
                            <div className="bg-emerald-50 p-4 rounded-xl border-l-4 border-emerald-400 flex items-center justify-between">
                              <p className="text-lg font-semibold text-emerald-700" style={{ fontFamily: 'Nunito' }}>
                                "{error.correctPhrase}"
                              </p>
                              <button
                                onClick={() => speakText(error.correctPhrase)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-full transition-all shadow-md hover:scale-110 ml-3"
                                title="Listen to correct pronunciation"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl border-2 border-amber-200">
                          <div className="flex items-start space-x-2 mb-3">
                            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                            </svg>
                            <div>
                              <p className="font-bold text-sm text-gray-700 mb-1" style={{ fontFamily: 'Poppins' }}>
                                Why This Matters:
                              </p>
                              <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Nunito' }}>
                                {error.simpleExplanation}
                              </p>
                            </div>
                          </div>
                        </div>

                        {error.exampleSentence && (
                          <div className="bg-violet-50 p-5 rounded-xl border-2 border-violet-200">
                            <p className="text-sm font-bold text-gray-700 mb-3" style={{ fontFamily: 'Poppins' }}>
                              Practice Example:
                            </p>
                            <div className="bg-white p-4 rounded-lg mb-3">
                              <p className="text-gray-800 text-lg italic" style={{ fontFamily: 'Nunito' }}>
                                "{error.exampleSentence}"
                              </p>
                            </div>
                            <button
                              onClick={() => speakText(error.exampleSentence!)}
                              className="inline-flex items-center space-x-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold py-2 px-4 rounded-full transition-all shadow-md hover:scale-105"
                            >
                              <Volume2 className="w-4 h-4" />
                              <span>Listen to Example</span>
                            </button>
                          </div>
                        )}

                        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-5 rounded-xl border-2 border-teal-200">
                          <p className="text-sm font-bold text-gray-700 mb-3" style={{ fontFamily: 'Poppins' }}>
                            Quick Practice Challenge:
                          </p>
                          <p className="text-gray-700 mb-3" style={{ fontFamily: 'Nunito' }}>
                            Try saying this sentence out loud using the correct grammar:
                          </p>
                          <div className="bg-white p-4 rounded-lg border-l-4 border-teal-400">
                            <p className="font-semibold text-teal-700" style={{ fontFamily: 'Nunito' }}>
                              "{error.correctPhrase}"
                            </p>
                          </div>
                          <button
                            onClick={() => speakText(error.correctPhrase)}
                            className="mt-3 inline-flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white text-sm py-2 px-4 rounded-full transition-all"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Hear It Again</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'practice' && (
            <div className="space-y-6">
              {result.practiceWords.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">Words to Practice</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {result.practiceWords.map((word, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-cyan-50 to-blue-50 p-3 rounded-xl border-2 border-cyan-200 flex items-center justify-between"
                      >
                        <span className="text-lg font-semibold text-gray-800">{word}</span>
                        <button
                          onClick={() => speakText(word)}
                          className="bg-cyan-400 hover:bg-cyan-500 text-white p-2 rounded-full transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.focusAreas.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3">Focus On</h4>
                  <ul className="space-y-2">
                    {result.focusAreas.map((area, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-teal-500 text-xl">✓</span>
                        <span className="text-gray-700">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border-2 border-amber-200">
                <h4 className="text-lg font-bold text-gray-800 mb-2">Your Next Adventure!</h4>
                <p className="text-gray-700">{result.nextSteps}</p>
              </div>
            </div>
          )}

          {activeTab === 'progress' && <PracticeTips result={result} originalText={originalText} />}

          {activeTab === 'tips' && <ReadingTips analysisResult={result} />}

          {activeTab === 'translate' && <TranslateText text={originalText} />}

          {activeTab === 'simplify' && <SimplifyText text={originalText} />}
        </div>
      </div>
    </div>
  );
}
