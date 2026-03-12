import { useState, useEffect } from 'react';
import { Target, TrendingUp, Trophy, Star, Calendar, Book, Lightbulb, CheckCircle2 } from 'lucide-react';
import type { AnalysisResult } from '../types/api';
import type { ProgressStats, PersonalizedFeedback, DailyGoal } from '../types/progress';
import { progressService } from '../services/progressService';

interface PracticeTipsProps {
  result: AnalysisResult;
  originalText: string;
}

export function PracticeTips({ result, originalText }: PracticeTipsProps) {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [todayGoal, setTodayGoal] = useState<DailyGoal | null>(null);
  const [feedback, setFeedback] = useState<PersonalizedFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgressData = async () => {
      setLoading(true);
      try {
        const sessions = await progressService.getRecentSessions(10);
        const progressStats = await progressService.getProgressStats();
        const goal = await progressService.getTodayGoal();

        setStats(progressStats);
        setTodayGoal(goal);

        const personalizedFeedback = progressService.generatePersonalizedFeedback(result, progressStats);
        setFeedback(personalizedFeedback);

        await progressService.checkAndAwardAchievements(result, sessions);
      } catch (error) {
        console.error('Error loading progress data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgressData();
  }, [result]);

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const goalProgress = todayGoal
    ? Math.min(100, (todayGoal.completed_sessions / todayGoal.target_sessions) * 100)
    : 0;

  const motivationalMessages = [
    "Every reader was once a beginner!",
    "Small steps make strong readers!",
    "You're building great habits!",
    "Reading opens new worlds!",
    "Keep going, you're doing amazing!",
  ];

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  const challenges = [
    { title: "Find 5 new words", description: "Discover 5 words you don't know", icon: Book },
    { title: "Read for 10 minutes", description: "Practice reading today", icon: Calendar },
    { title: "Perfect pronunciation", description: "Read a passage with 100% accuracy", icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl shadow-md border-2 border-teal-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-teal-400 rounded-full p-3">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Personalized Feedback</h3>
        </div>

        <div className="space-y-3">
          {feedback.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 ${
                item.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200'
                  : item.type === 'improvement'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />}
                {item.type === 'improvement' && <Target className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />}
                {item.type === 'encouragement' && <Star className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-gray-700 font-medium">{item.message}</p>
                  {item.focusArea && (
                    <p className="text-sm text-gray-600 mt-1">Focus area: {item.focusArea}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 p-6 rounded-2xl shadow-md border-2 border-violet-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-violet-400 rounded-full p-3">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Daily Reading Goal</h3>
        </div>

        <div className="bg-white p-4 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-semibold">Today's Progress</span>
            <span className="text-violet-600 font-bold">
              {todayGoal?.completed_sessions || 0} / {todayGoal?.target_sessions || 3} sessions
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-400 to-fuchsia-400 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${goalProgress}%` }}
            >
              {goalProgress > 15 && (
                <span className="text-white text-xs font-bold">{Math.round(goalProgress)}%</span>
              )}
            </div>
          </div>

          {todayGoal && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{todayGoal.new_words_found}</p>
                <p className="text-xs text-gray-600">New Words</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{todayGoal.total_words_read}</p>
                <p className="text-xs text-gray-600">Words Read</p>
              </div>
            </div>
          )}
        </div>

        {goalProgress === 100 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl border-2 border-yellow-300 animate-pulse">
            <p className="text-center text-yellow-800 font-bold flex items-center justify-center">
              <Trophy className="w-5 h-5 mr-2" />
              Goal Complete! You're on fire today!
            </p>
          </div>
        )}
      </div>

      {stats && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl shadow-md border-2 border-amber-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-amber-400 rounded-full p-3">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Your Progress</h3>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <p className="text-3xl font-bold text-amber-600">{stats.totalSessions}</p>
              <p className="text-sm text-gray-600">Sessions</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <p className="text-3xl font-bold text-emerald-600">{Math.round(stats.averageAccuracy)}%</p>
              <p className="text-sm text-gray-600">Avg Accuracy</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <p className="text-3xl font-bold text-blue-600">{stats.totalWordsRead}</p>
              <p className="text-sm text-gray-600">Total Words</p>
            </div>
          </div>

          <div className="space-y-3">
            {stats.strongAreas.length > 0 && (
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <p className="font-semibold text-emerald-800 mb-2">Strong Areas:</p>
                <ul className="space-y-1">
                  {stats.strongAreas.map((area, index) => (
                    <li key={index} className="text-emerald-700 text-sm flex items-center">
                      <Star className="w-4 h-4 mr-2 text-emerald-500" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {stats.areasToImprove.length > 0 && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <p className="font-semibold text-amber-800 mb-2">Areas to Improve:</p>
                <ul className="space-y-1">
                  {stats.areasToImprove.map((area, index) => (
                    <li key={index} className="text-amber-700 text-sm flex items-center">
                      <Target className="w-4 h-4 mr-2 text-amber-500" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-2xl shadow-md border-2 border-pink-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-pink-400 rounded-full p-3">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Mini Challenges</h3>
        </div>

        <div className="space-y-3">
          {challenges.map((challenge, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-pink-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-lg p-3">
                  <challenge.icon className="w-5 h-5 text-pink-500" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{challenge.title}</p>
                  <p className="text-sm text-gray-600">{challenge.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-sky-50 to-indigo-50 p-6 rounded-2xl shadow-md border-2 border-sky-200">
        <div className="text-center">
          <Star className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <p className="text-xl font-bold text-gray-800 mb-2">{randomMessage}</p>
          <p className="text-gray-600">Keep practicing every day to become a reading superstar!</p>
        </div>
      </div>
    </div>
  );
}
