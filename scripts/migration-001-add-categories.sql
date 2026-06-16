-- Add category column to memories table
ALTER TABLE memories
ADD COLUMN category VARCHAR(50) DEFAULT 'general';

-- Create index for faster filtering by category
CREATE INDEX idx_memories_category ON memories(category);

-- Create composite index for user_id + category queries
CREATE INDEX idx_memories_user_category ON memories(user_id, category);
