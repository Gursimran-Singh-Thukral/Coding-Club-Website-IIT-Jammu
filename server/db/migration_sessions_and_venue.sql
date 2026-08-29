/**

    @fileoverview Incremental migration for an existing database that was
    created from an earlier, buggy version of schema.sql (missing `venue`
    on events, no `sessions` table). Safe to re-run.

*/

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue TEXT NOT NULL DEFAULT 'TBA';
ALTER TABLE public.events ALTER COLUMN venue DROP DEFAULT;

CREATE TABLE IF NOT EXISTS public.sessions (

    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    user_agent TEXT,
    ip_address TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE

);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
