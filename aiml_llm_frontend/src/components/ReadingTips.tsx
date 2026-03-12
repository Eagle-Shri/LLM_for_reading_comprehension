import { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Users, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import type { AnalysisResult, ReadingTips as ReadingTipsType } from '../types/api';

interface ReadingTipsProps {
  analysisResult: AnalysisResult;
}

export function ReadingTips({ analysisResult }: ReadingTipsProps) {
  const [tips, setTips] = useState<ReadingTipsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      setLoading(true);
      try {
        const tipsResult = await api.getTips(analysisResult);
        setTips(tipsResult);
      } catch (error) {
        console.error('Error fetching tips:', error);
        alert('Failed to get reading tips. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, [analysisResult]);

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-gray-200 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        <span className="ml-3 text-gray-600">Getting personalized tips...</span>
      </div>
    );
  }

  if (!tips) {
    return null;
  }

  return (
    <div className="space-y-6">
      {tips.tips.length > 0 && (
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl shadow-md border-2 border-teal-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-teal-400 rounded-full p-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Reading Tips for You</h3>
          </div>
          <ul className="space-y-3">
            {tips.tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-3 bg-white p-4 rounded-xl">
                <span className="text-teal-500 text-xl font-bold">{index + 1}.</span>
                <span className="text-gray-700 flex-1">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tips.exercises.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-2xl shadow-md border-2 border-amber-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-amber-400 rounded-full p-3">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Fun Practice Exercises</h3>
          </div>
          <ul className="space-y-3">
            {tips.exercises.map((exercise, index) => (
              <li key={index} className="flex items-start space-x-3 bg-white p-4 rounded-xl">
                <span className="text-amber-500 text-xl">✏️</span>
                <span className="text-gray-700 flex-1">{exercise}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tips.parentGuidance.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl shadow-md border-2 border-purple-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-purple-400 rounded-full p-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">For Parents & Teachers</h3>
          </div>
          <ul className="space-y-3">
            {tips.parentGuidance.map((guidance, index) => (
              <li key={index} className="flex items-start space-x-3 bg-white p-4 rounded-xl">
                <span className="text-purple-500 text-xl">👥</span>
                <span className="text-gray-700 flex-1">{guidance}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
