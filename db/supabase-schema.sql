-- Rootio Database Schema
-- Run this in Supabase SQL Editor

-- Note: RLS (Row Level Security) will be enabled on individual tables below

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT,
  handle TEXT UNIQUE,
  avatar TEXT DEFAULT '🌻',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habits table
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📚',
  list TEXT DEFAULT 'habit', -- 'habit', 'task', 'goal', 'event'
  freq TEXT DEFAULT 'diario', -- 'diario', 'semanal', 'mensal'
  days INTEGER[] DEFAULT '{0,1,2,3,4,5,6}', -- 0=dom, 1=seg, etc.
  pts INTEGER DEFAULT 10,
  priority TEXT DEFAULT 'media', -- 'baixa', 'media', 'alta'
  order_index INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  subtasks TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  est_mins INTEGER,
  deadline DATE,
  hidden BOOLEAN DEFAULT FALSE,
  streak_goal INTEGER,
  goal_target DECIMAL,
  goal_current DECIMAL,
  goal_unit TEXT,
  goal_period TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- History table (daily habit completions)
CREATE TABLE habit_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  habits JSONB DEFAULT '{}', -- {habitId: {done: boolean, notes?: string}}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Wallet/Savings table
CREATE TABLE wallet_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  target DECIMAL NOT NULL,
  saved DECIMAL DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career goals table
CREATE TABLE career_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'cargo', 'habilidade', 'network', 'educacao', 'projeto', 'financeiro'
  active BOOLEAN DEFAULT TRUE,
  target_salary DECIMAL,
  salary_currency TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Habits: users can only see/edit their own habits
CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

-- Habit history: users can only see/edit their own history
CREATE POLICY "Users can view own habit history" ON habit_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habit history" ON habit_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habit history" ON habit_history FOR UPDATE USING (auth.uid() = user_id);

-- Wallet goals: users can only see/edit their own goals
CREATE POLICY "Users can view own wallet goals" ON wallet_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet goals" ON wallet_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet goals" ON wallet_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wallet goals" ON wallet_goals FOR DELETE USING (auth.uid() = user_id);

-- Career goals: users can only see/edit their own goals
CREATE POLICY "Users can view own career goals" ON career_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own career goals" ON career_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own career goals" ON career_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own career goals" ON career_goals FOR DELETE USING (auth.uid() = user_id);

-- Note: Profile creation will be handled by the app when user signs up

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallet_goals_updated_at BEFORE UPDATE ON wallet_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_goals_updated_at BEFORE UPDATE ON career_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();