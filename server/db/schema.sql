/**

    @fileoverview Database Schema for Coding Club API
    @version Phase 1

*/

-- Custom Types

CREATE TYPE event_category AS ENUM ('Workshop', 'Seminar', 'Hackathon', 'Talk');
CREATE TYPE student_role AS ENUM ('Student', 'Field Specialist', 'Manager', 'Technical Secretary');

-- Tables

CREATE TABLE public.users (

    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    student_id TEXT NOT NULL,
    role student_role DEFAULT 'Student' :: student_role NOT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

);

-- This app mints its own UUIDs at signup (not Supabase Auth's), so the FK
-- to auth.users can never be satisfied — drop it right after creation.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

CREATE TABLE public.events (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue TEXT NOT NULL,
    category event_category DEFAULT 'Workshop' :: event_category NOT NULL,

    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    totp_secret TEXT

);

CREATE TABLE public.attendance (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,

    marked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    UNIQUE(event_id, student_id)

);

CREATE TABLE public.profiles (

    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    bio TEXT,
    avatar_url TEXT,

    -- External Handles

    github_handle TEXT,
    codeforces_handle TEXT,
    leetcode_handle TEXT,
    kaggle_handle TEXT,
    tryhackme_handle TEXT,

    -- Flexible JSON Storage for Dynamic Achievements

    stats JSONB DEFAULT '{}'::jsonb,

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

);

-- Tracks each login as a revocable session, keyed by the "sid" embedded in
-- that login's refresh token. Lets a user see and sign out of other devices.

CREATE TABLE public.sessions (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    user_agent TEXT,
    ip_address TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE

);

CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);

-- Public-facing "who's on the team" roster, managed by Managers. Independent
-- of users/profiles - not every team-page entry needs to be a platform user.

CREATE TABLE public.team_members (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    image_url TEXT,
    github TEXT,
    linkedin TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,

    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

);

CREATE INDEX idx_team_members_display_order ON public.team_members(display_order);

-- Enabling Row Level Security

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
