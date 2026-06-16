-- Add constraint for importance_score range (1-10)
ALTER TABLE memories
ADD CONSTRAINT importance_score_range CHECK (importance_score >= 1 AND importance_score <= 10);
