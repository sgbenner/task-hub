ALTER TABLE taskhub.tasks
  ADD COLUMN parent_id UUID REFERENCES taskhub.tasks(id) ON DELETE CASCADE;

CREATE INDEX idx_tasks_parent_id ON taskhub.tasks(parent_id);
