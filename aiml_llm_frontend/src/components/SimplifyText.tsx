import { useState } from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import type { SimplifiedText } from '../types/api';

interface SimplifyTextProps {
  text: string;
}

export function SimplifyText({ text }: SimplifyTextProps) {
  const [targetLevel, setTargetLevel] = useState('Grade 1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimplifiedText | null>(null);

  const gradeLevels = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];

  const handleSimplify = async () => {
    setLoading(true);
    try {
      const simplifiedResult = await api.simplifyText({
        text,
        targetLevel,
      });
      setResult(simplifiedResult);
    } catch (error) {
      console.error('Error simplifying text:', error);
      alert('Failed to simplify text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label htmlFor="targetLevel" className="text-lg font-semibold text-gray-700">
          Simplify to reading level:
        </label>
        <select
          id="targetLevel"
          value={targetLevel}
          onChange={(e) => setTargetLevel(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-400 focus:outline-none text-gray-800"
        >
          {gradeLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div className="text-center">
        <button
          onClick={handleSimplify}
          disabled={loading}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Simplifying...</span>
            </>
          ) : (
            <>
              <Lightbulb className="w-5 h-5" />
              <span>Make It Easier!</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border-2 border-gray-200">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Original Text:</h4>
            <p className="text-lg text-gray-800">{result.originalText}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200">
            <h4 className="text-sm font-semibold text-gray-600 mb-2">
              Simplified Text ({result.readingLevel}):
            </h4>
            <p className="text-xl font-semibold text-blue-600">{result.simplifiedText}</p>
          </div>
          {result.simplifications && result.simplifications.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border-2 border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Changes Made:</h4>
              <ul className="space-y-2">
                {result.simplifications.map((change, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 text-xl">→</span>
                    <span className="text-gray-700">{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
