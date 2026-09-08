-- Create ctf_challenges table
CREATE TABLE IF NOT EXISTS ctf_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 0,
    flag TEXT NOT NULL,
    target_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ctf_submissions table
CREATE TABLE IF NOT EXISTS ctf_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES ctf_challenges(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_correct BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on event_id for challenges
CREATE INDEX IF NOT EXISTS idx_ctf_challenges_event_id ON ctf_challenges(event_id);

-- Add index on challenge_id for submissions
CREATE INDEX IF NOT EXISTS idx_ctf_submissions_challenge_id ON ctf_submissions(challenge_id);
