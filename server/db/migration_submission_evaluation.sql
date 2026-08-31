/**

    @fileoverview Incremental migration adding judging fields to team
    workspace submissions (score/feedback set by a coordinator), plus two
    lightweight, self-reported integrity counters surfaced to judges
    alongside the score - NOT a hard anti-cheat control, just a signal (see
    the workspace UI, which blocks paste/cut client-side; a determined
    student can still defeat any client-side check via devtools). Safe to
    re-run.

*/

ALTER TABLE public.event_submissions ADD COLUMN IF NOT EXISTS score NUMERIC;
ALTER TABLE public.event_submissions ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE public.event_submissions ADD COLUMN IF NOT EXISTS evaluated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.event_submissions ADD COLUMN IF NOT EXISTS evaluated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.event_submissions ADD COLUMN IF NOT EXISTS tab_switch_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE public.event_submissions ADD COLUMN IF NOT EXISTS paste_attempt_count INTEGER DEFAULT 0 NOT NULL;

NOTIFY pgrst, 'reload schema';
