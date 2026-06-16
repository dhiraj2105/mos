-- Add expires_at column to memories table
ALTER TABLE memories
ADD COLUMN expires_at TIMESTAMP NULL;

-- Create index for efficient expiration filtering
CREATE INDEX idx_memories_expires_at ON memories(expires_at);
