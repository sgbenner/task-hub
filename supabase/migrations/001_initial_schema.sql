-- TaskHub Schema Migration
-- Run this in your Supabase SQL Editor

CREATE SCHEMA IF NOT EXISTS taskhub;

GRANT USAGE ON SCHEMA taskhub TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA taskhub GRANT ALL ON TABLES TO anon, authenticated;

-- Task lists
CREATE TABLE taskhub.task_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks
CREATE TABLE taskhub.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES taskhub.task_lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Goals
CREATE TABLE taskhub.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  horizon_id TEXT NOT NULL CHECK (horizon_id IN ('1-year', '5-year', '10-year')),
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_tasks_list_id ON taskhub.tasks(list_id);
CREATE INDEX idx_goals_horizon_id ON taskhub.goals(horizon_id);

GRANT ALL ON ALL TABLES IN SCHEMA taskhub TO anon, authenticated;
