-- Add is_private column to events table
ALTER TABLE events
ADD COLUMN is_private BOOLEAN DEFAULT false NOT NULL;

-- Create event_invitations table
CREATE TABLE IF NOT EXISTS event_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, student_id)
);
