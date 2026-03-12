import { useState } from 'react';
import { Header } from './components/Header';
import { StoryGenerator } from './components/StoryGenerator';
import { TextInput } from './components/TextInput';
import { ReadingDisplay } from './components/ReadingDisplay';
import { ResultsDisplay } from './components/ResultsDisplay';
import type { AnalysisResult } from './types/api';

type TabType = 'generate' | 'custom';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('generate');
  const [currentText, setCurrentText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleStoryGenerated = (text: string) => {
    setCurrentText(text);
    setAnalysisResult(null);
  };

  const handleTextSubmitted = (text: string) => {
    setCurrentText(text);
    setAnalysisResult(null);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
  };

  const handleStartOver = () => {
    setCurrentText('');
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-peach-50 via-yellow-50 to-violet-100">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentText ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-coral-200 animate-fadeIn">
            <div className="flex space-x-2 mb-6 bg-gradient-to-r from-peach-100 to-coral-100 rounded-full p-2 shadow-inner">
              <button
                onClick={() => setActiveTab('generate')}
                className={`flex-1 py-3 px-6 rounded-full font-bold transition-all duration-300 transform ${
                  activeTab === 'generate'
                    ? 'bg-white text-gray-800 shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:scale-102'
                }`}
                style={{ fontFamily: 'Poppins' }}
              >
                ✨ Start a Story
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-3 px-6 rounded-full font-bold transition-all duration-300 transform ${
                  activeTab === 'custom'
                    ? 'bg-white text-gray-800 shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-800 hover:scale-102'
                }`}
                style={{ fontFamily: 'Poppins' }}
              >
                📝 Use Your Own Text
              </button>
            </div>

            <div className="mt-8">
              {activeTab === 'generate' ? (
                <StoryGenerator onStoryGenerated={handleStoryGenerated} />
              ) : (
                <TextInput onTextSubmitted={handleTextSubmitted} />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {!analysisResult ? (
              <div className="bg-white rounded-3xl shadow-xl p-8 border-4 border-emerald-200 animate-scaleIn">
                <ReadingDisplay text={currentText} onAnalysisComplete={handleAnalysisComplete} />
                <div className="mt-6 text-center">
                  <button
                    onClick={handleStartOver}
                    className="text-gray-600 hover:text-gray-800 font-semibold underline"
                  >
                    Choose a different story
                  </button>
                </div>
              </div>
            ) : (
              <>
                <ResultsDisplay result={analysisResult} originalText={currentText} />
                <div className="text-center">
                  <button
                    onClick={handleStartOver}
                    className="bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-white font-black py-4 px-10 rounded-full shadow-xl transform transition-all duration-300 hover:scale-110 animate-bounce-slow"
                    style={{ fontFamily: 'Poppins' }}
                  >
                    Read Another Story!
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="bg-gradient-to-r from-coral-50 to-peach-50 border-t-4 border-coral-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-800 font-semibold">
              For Parents & Teachers
            </a>
            <span>•</span>
            <a href="#" className="hover:text-gray-800 font-semibold">
              Difficulty Guide
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
