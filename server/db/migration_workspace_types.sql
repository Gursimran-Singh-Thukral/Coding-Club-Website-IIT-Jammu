-- Create workspace_type enum
CREATE TYPE workspace_type_enum AS ENUM ('web', 'cpp', 'python', 'cybersec', 'gamedev');

-- Add workspace_type to events
ALTER TABLE events
ADD COLUMN workspace_type workspace_type_enum DEFAULT 'web'::workspace_type_enum NOT NULL;
