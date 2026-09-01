/**

    @fileoverview Incremental migration adding the Manager-managed team
    roster. Safe to re-run.

*/

CREATE TABLE IF NOT EXISTS public.team_members (

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

CREATE INDEX IF NOT EXISTS idx_team_members_display_order ON public.team_members(display_order);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
