ALTER TABLE taskhub.tasks
  ADD COLUMN due_date DATE;

CREATE INDEX idx_tasks_due_date ON taskhub.tasks(due_date);
