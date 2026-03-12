export interface ReadingSession {
  id: string;
  user_id: string;
  session_date: string;
  text_read: string;
  accuracy_percentage: number;
  words_read: number;
  correct_words: number;
  reading_time_seconds: number;
  difficulty_level: string;
  created_at: string;
}

export interface DailyGoal {
  id: string;
  user_id: string;
  goal_date: string;
  target_sessions: number;
  completed_sessions: number;
  new_words_found: number;
  total_words_read: number;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_title: string;
  achievement_description: string;
  earned_date: string;
  created_at: string;
}

export interface PersonalizedFeedback {
  message: string;
  type: 'success' | 'improvement' | 'encouragement';
  focusArea?: string;
}

export interface ProgressStats {
  totalSessions: number;
  averageAccuracy: number;
  totalWordsRead: number;
  improvementTrend: 'improving' | 'stable' | 'needsWork';
  strongAreas: string[];
  areasToImprove: string[];
}
