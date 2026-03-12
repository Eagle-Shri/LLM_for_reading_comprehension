import { useState } from 'react';
import { Sparkles, Loader2, Volume2, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import type { GeneratedContent } from '../types/api';

interface StoryGeneratorProps {
  onStoryGenerated: (text: string) => void;
}

export function StoryGenerator({ onStoryGenerated }: StoryGeneratorProps) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('short');
  const [topic, setTopic] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const content: GeneratedContent = await api.generateContent({
        difficulty,
        length,
        topic: topic.trim() || undefined,
        ageRange: ageRange.trim() || undefined,
      });
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating story:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseStory = () => {
    if (generatedContent) {
      onStoryGenerated(generatedContent.text);
    }
  };

  const handleSpeakStory = () => {
    if (generatedContent) {
      const speech = new SpeechSynthesisUtterance(generatedContent.text);
      speech.rate = 0.8;
      speech.pitch = 1.1;
      window.speechSynthesis.speak(speech);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-lg font-semibold text-gray-700">Difficulty Level</label>
          <div className="flex space-x-2">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  difficulty === level
                    ? 'bg-teal-400 text-white shadow-md transform scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-lg font-semibold text-gray-700">Story Length</label>
          <div className="flex space-x-2">
            {(['short', 'medium', 'long'] as const).map((len) => (
              <button
                key={len}
                onClick={() => setLength(len)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                  length === len
                    ? 'bg-teal-400 text-white shadow-md transform scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {len.charAt(0).toUpperCase() + len.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="topic" className="text-lg font-semibold text-gray-700">
            Topic (Optional)
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Animals, Space, Friends..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-400 focus:outline-none text-gray-800"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="ageRange" className="text-lg font-semibold text-gray-700">
            Age Range (Optional)
          </label>
          <input
            id="ageRange"
            type="text"
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            placeholder="e.g., 5-7, 7-9, 9-11"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-400 focus:outline-none text-gray-800"
          />
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Generating Story...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6" />
              <span>Generate Story</span>
            </>
          )}
        </button>
      </div>

      {generatedContent && (
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border-2 border-green-200 animate-scaleIn">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{generatedContent.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="bg-blue-100 px-3 py-1 rounded-full">Difficulty: {generatedContent.difficulty}</span>
              {generatedContent.ageRange && (
                <span className="bg-purple-100 px-3 py-1 rounded-full">Age: {generatedContent.ageRange}</span>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl mb-4">
            <p className="text-lg leading-relaxed text-gray-800">{generatedContent.text}</p>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleSpeakStory}
              className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-md transform transition-all duration-200 hover:scale-105"
            >
              <Volume2 className="w-5 h-5" />
              <span>Listen to Story</span>
            </button>
            <button
              onClick={handleUseStory}
              className="inline-flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-md transform transition-all duration-200 hover:scale-105"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Read This Story</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
