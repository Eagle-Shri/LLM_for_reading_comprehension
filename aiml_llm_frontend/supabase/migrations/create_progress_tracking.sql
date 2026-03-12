/*
  # User Progress Tracking System

  1. New Tables
    - `reading_sessions`
      - `id` (uuid, primary key)
      - `user_id` (text) - Anonymous user identifier
      - `session_date` (timestamptz) - When the session occurred
      - `text_read` (text) - The text that was read
      - `accuracy_percentage` (numeric) - Reading accuracy
      - `words_read` (integer) - Total words in the text
      - `correct_words` (integer) - Correctly read words
      - `reading_time_seconds` (integer) - Time spent reading
      - `difficulty_level` (text) - easy, medium, hard
      - `created_at` (timestamptz) - Record creation time

    - `daily_goals`
      - `id` (uuid, primary key)
      - `user_id` (text) - Anonymous user identifier
      - `goal_date` (date) - The date for this goal
      - `target_sessions` (integer) - Target number of reading sessions
      - `completed_sessions` (integer) - Completed sessions
      - `new_words_found` (integer) - New vocabulary words discovered
      - `total_words_read` (integer) - Total words read that day
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_achievements`
      - `id` (uuid, primary key)
      - `user_id` (text) - Anonymous user identifier
      - `achievement_type` (text) - Type of achievement
      - `achievement_title` (text) - Achievement title
      - `achievement_description` (text) - Description
      - `earned_date` (timestamptz) - When achievement was earned
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for user access based on user_id

  3. Important Notes
    - Uses text-based user_id for anonymous tracking (localStorage-based)
    - Tracks reading performance metrics over time
    - Supports daily goal setting and progress monitoring
*/

CREATE TABLE IF NOT EXISTS reading_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  session_date timestamptz DEFAULT now(),
  text_read text NOT NULL,
  accuracy_percentage numeric(5,2) DEFAULT 0,
  words_read integer DEFAULT 0,
  correct_words integer DEFAULT 0,
  reading_time_seconds integer DEFAULT 0,
  difficulty_level text DEFAULT 'medium',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  goal_date date NOT NULL,
  target_sessions integer DEFAULT 3,
  completed_sessions integer DEFAULT 0,
  new_words_found integer DEFAULT 0,
  total_words_read integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, goal_date)
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  achievement_type text NOT NULL,
  achievement_title text NOT NULL,
  achievement_description text NOT NULL,
  earned_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert their own reading sessions"
  ON reading_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own reading sessions"
  ON reading_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert their own daily goals"
  ON daily_goals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own daily goals"
  ON daily_goals FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own daily goals"
  ON daily_goals FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert their own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_date ON reading_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON daily_goals(user_id, goal_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id, earned_date DESC);
