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
    email TEXT NOT NULL,
    student_id TEXT NOT NULL,
    role student_role DEFAULT 'Student' :: student_role Not NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

);

CREATE TABLE public.events (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category event_category DEFAULT 'Workshop' :: event_category NOT NULL,
    
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL

    totp_secret TEXT;

);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;