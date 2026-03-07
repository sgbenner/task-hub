ALTER TABLE taskhub.tasks
  ADD COLUMN scheduled_date DATE;

CREATE INDEX idx_tasks_scheduled_date ON taskhub.tasks(scheduled_date);
