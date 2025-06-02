# Supabase Setup Guide for Strong Habit App

## 1. Environment Variables

Create a `.env.local` file in your project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase dashboard under Settings > API.

## 2. Database Schema

Execute the following SQL in your Supabase SQL Editor to create the required tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create exercises table
CREATE TABLE exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  target_reps INTEGER NOT NULL DEFAULT 1,
  current_reps INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_stats table
CREATE TABLE user_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  streak INTEGER NOT NULL DEFAULT 0,
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_celebration TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_exercises_updated_at 
  BEFORE UPDATE ON exercises 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at 
  BEFORE UPDATE ON user_stats 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Exercises policies
CREATE POLICY "Users can view their own exercises" ON exercises
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercises" ON exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercises" ON exercises
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercises" ON exercises
  FOR DELETE USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view their own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_exercises_user_id ON exercises(user_id);
CREATE INDEX idx_exercises_created_at ON exercises(created_at);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
```

## 3. Authentication Setup

In your Supabase dashboard:

1. Go to Authentication > Settings
2. Enable "Enable anonymous sign-ins" for now (we can enhance this later)
3. Optionally, configure other auth providers (Google, Facebook, etc.)

## 4. Migration from localStorage

The app will automatically migrate data from localStorage to Supabase when users first load the app after the update. The migration includes:

- All existing exercises with their current progress
- User streak data
- Last reset and celebration timestamps

## 5. Features Enabled by Supabase

✅ **Data sync across devices** - Users can access their data from any device
✅ **Backup and recovery** - Data is safely stored in the cloud
✅ **Real-time updates** - Changes sync instantly
✅ **Scalability** - Can handle many users
✅ **User authentication** - Each user has their own private data
✅ **Data integrity** - ACID transactions and constraints

## 6. Testing the Setup

1. Start your development server: `npm run dev`
2. Open the app and create a test exercise
3. Check your Supabase dashboard > Table Editor to see the data
4. Try accessing from a different browser to test data persistence

## Next Steps

- Enhanced authentication (social logins)
- Real-time collaboration features
- Data analytics and insights
- Export/import functionality 