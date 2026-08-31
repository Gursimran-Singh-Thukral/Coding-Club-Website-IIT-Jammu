/**

    @fileoverview Incremental migration adding:
      - event end time (for past/live/upcoming status)
      - per-event registration (individual or team-based, with an
        Unstop-style invite-code join flow)
      - a shared, autosaved HTML/CSS/JS workspace per team (for
        in-browser-only hackathons - no server-side code execution)
    Safe to re-run.

*/

-- Event Timing

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_end TIMESTAMP WITH TIME ZONE;

-- Registration Settings (Coordinator-Controlled per Event)

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_open BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_mode TEXT DEFAULT 'individual' NOT NULL;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_registration_mode_check;
ALTER TABLE public.events ADD CONSTRAINT events_registration_mode_check CHECK (registration_mode IN ('individual', 'team'));
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_team_size INTEGER DEFAULT 1 NOT NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS workspace_enabled BOOLEAN DEFAULT false NOT NULL;

-- Teams: Registering Solo or as a Group Both Create a Row Here.
-- Individual-Mode Events Just Skip Showing the Invite Code to the Student.

CREATE TABLE IF NOT EXISTS public.event_teams (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    team_name TEXT NOT NULL,
    invite_code TEXT NOT NULL UNIQUE,

    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

);

CREATE INDEX IF NOT EXISTS idx_event_teams_event_id ON public.event_teams(event_id);

CREATE TABLE IF NOT EXISTS public.event_team_members (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES public.event_teams(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    is_leader BOOLEAN DEFAULT false NOT NULL,

    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- One Team per Student per Event
    UNIQUE(event_id, student_id)

);

CREATE INDEX IF NOT EXISTS idx_event_team_members_team_id ON public.event_team_members(team_id);

-- Shared Team Workspace: One Row per Team, Any Member Can Save It.

CREATE TABLE IF NOT EXISTS public.event_submissions (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.event_teams(id) ON DELETE CASCADE UNIQUE NOT NULL,

    html TEXT DEFAULT '' NOT NULL,
    css TEXT DEFAULT '' NOT NULL,
    js TEXT DEFAULT '' NOT NULL,

    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

);

ALTER TABLE public.event_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_submissions ENABLE ROW LEVEL SECURITY;
