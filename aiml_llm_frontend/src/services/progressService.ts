import { createClient } from '@supabase/supabase-js';
import type { ReadingSession, DailyGoal, UserAchievement, ProgressStats, PersonalizedFeedback } from '../types/progress';
import type { AnalysisResult } from '../types/api';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

const USER_ID_KEY = 'reading_app_user_id';

function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

export const progressService = {
  async saveReadingSession(
    text: string,
    result: AnalysisResult,
    readingTimeSeconds: number,
    difficulty: string
  ): Promise<ReadingSession | null> {
    if (!supabase) return null;

    const userId = getUserId();
    const today = new Date().toISOString().split('T')[0];

    const session = {
      user_id: userId,
      text_read: text,
      accuracy_percentage: result.accuracyPercentage,
      words_read: result.totalWordsRead || 0,
      correct_words: result.correctWordsCount || 0,
      reading_time_seconds: readingTimeSeconds,
      difficulty_level: difficulty,
    };

    const { data, error } = await supabase
      .from('reading_sessions')
      .insert(session)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error saving reading session:', error);
      return null;
    }

    await this.updateDailyGoal(today, result.vocabularyItems?.length || 0, result.totalWordsRead || 0);

    return data;
  },

  async updateDailyGoal(date: string, newWords: number, wordsRead: number): Promise<void> {
    if (!supabase) return;

    const userId = getUserId();

    const { data: existing } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_date', date)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('daily_goals')
        .update({
          completed_sessions: existing.completed_sessions + 1,
          new_words_found: existing.new_words_found + newWords,
          total_words_read: existing.total_words_read + wordsRead,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('daily_goals').insert({
        user_id: userId,
        goal_date: date,
        target_sessions: 3,
        completed_sessions: 1,
        new_words_found: newWords,
        total_words_read: wordsRead,
      });
    }
  },

  async getTodayGoal(): Promise<DailyGoal | null> {
    if (!supabase) return null;

    const userId = getUserId();
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_date', today)
      .maybeSingle();

    return data;
  },

  async getRecentSessions(limit: number = 5): Promise<ReadingSession[]> {
    if (!supabase) return [];

    const userId = getUserId();

    const { data } = await supabase
      .from('reading_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('session_date', { ascending: false })
      .limit(limit);

    return data || [];
  },

  async getProgressStats(): Promise<ProgressStats | null> {
    if (!supabase) return null;

    const sessions = await this.getRecentSessions(10);

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageAccuracy: 0,
        totalWordsRead: 0,
        improvementTrend: 'needsWork',
        strongAreas: [],
        areasToImprove: ['Start reading to track your progress!'],
      };
    }

    const totalSessions = sessions.length;
    const averageAccuracy = sessions.reduce((sum, s) => sum + Number(s.accuracy_percentage), 0) / totalSessions;
    const totalWordsRead = sessions.reduce((sum, s) => sum + s.words_read, 0);

    const recentAccuracy = sessions.slice(0, 3).reduce((sum, s) => sum + Number(s.accuracy_percentage), 0) / Math.min(3, sessions.length);
    const olderAccuracy = sessions.slice(3).reduce((sum, s) => sum + Number(s.accuracy_percentage), 0) / Math.max(1, sessions.length - 3);

    let improvementTrend: 'improving' | 'stable' | 'needsWork';
    if (recentAccuracy > olderAccuracy + 5) improvementTrend = 'improving';
    else if (recentAccuracy < olderAccuracy - 5) improvementTrend = 'needsWork';
    else improvementTrend = 'stable';

    const strongAreas: string[] = [];
    const areasToImprove: string[] = [];

    if (averageAccuracy >= 90) strongAreas.push('Excellent reading accuracy');
    else if (averageAccuracy < 75) areasToImprove.push('Focus on reading accuracy');

    if (totalWordsRead > 500) strongAreas.push('Great reading volume');
    if (sessions.length >= 5) strongAreas.push('Consistent practice');

    return {
      totalSessions,
      averageAccuracy,
      totalWordsRead,
      improvementTrend,
      strongAreas,
      areasToImprove,
    };
  },

  generatePersonalizedFeedback(result: AnalysisResult, stats: ProgressStats | null): PersonalizedFeedback[] {
    const feedback: PersonalizedFeedback[] = [];

    if (result.accuracyPercentage >= 95) {
      feedback.push({
        message: "Outstanding work! You're reading with excellent accuracy!",
        type: 'success',
      });
    } else if (result.accuracyPercentage >= 85) {
      feedback.push({
        message: "Great job! You're improving your reading skills!",
        type: 'success',
      });
    } else if (result.accuracyPercentage >= 70) {
      feedback.push({
        message: "Good effort! Keep practicing to improve your accuracy.",
        type: 'improvement',
        focusArea: 'pronunciation',
      });
    } else {
      feedback.push({
        message: "Keep going! Try reading slowly and focus on each word.",
        type: 'encouragement',
        focusArea: 'slow reading',
      });
    }

    if (stats && stats.improvementTrend === 'improving') {
      feedback.push({
        message: "You're improving with each session! Keep up the momentum!",
        type: 'success',
      });
    }

    if (result.pronunciationErrors.length > 5) {
      feedback.push({
        message: "Focus on pronunciation. Try saying difficult words slowly.",
        type: 'improvement',
        focusArea: 'pronunciation',
      });
    }

    if (result.practiceWords && result.practiceWords.length > 0) {
      feedback.push({
        message: `Practice these words: ${result.practiceWords.slice(0, 3).join(', ')}`,
        type: 'improvement',
        focusArea: 'vocabulary',
      });
    }

    return feedback;
  },

  async addAchievement(type: string, title: string, description: string): Promise<void> {
    if (!supabase) return;

    const userId = getUserId();

    const { data: existing } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_type', type)
      .maybeSingle();

    if (!existing) {
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_type: type,
        achievement_title: title,
        achievement_description: description,
      });
    }
  },

  async checkAndAwardAchievements(result: AnalysisResult, sessions: ReadingSession[]): Promise<UserAchievement[]> {
    const newAchievements: UserAchievement[] = [];

    if (result.accuracyPercentage === 100) {
      await this.addAchievement('perfect_score', 'Perfect Reader!', 'Read a text with 100% accuracy!');
    }

    if (sessions.length === 1) {
      await this.addAchievement('first_reading', 'First Steps!', 'Completed your first reading session!');
    }

    if (sessions.length === 5) {
      await this.addAchievement('five_sessions', 'Reading Rookie!', 'Completed 5 reading sessions!');
    }

    if (sessions.length === 10) {
      await this.addAchievement('ten_sessions', 'Reading Champion!', 'Completed 10 reading sessions!');
    }

    const totalWords = sessions.reduce((sum, s) => sum + s.words_read, 0);
    if (totalWords >= 1000) {
      await this.addAchievement('thousand_words', 'Word Master!', 'Read over 1,000 words!');
    }

    return newAchievements;
  },
};
