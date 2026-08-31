/**

    @fileoverview Incremental migration adding a structured hierarchy to the
    team roster: `tier` (Technical Secretary > Coordinator > Field Specialist
    > Team Member) drives the public team page's layout, `domain` groups
    Team Member-tier entries into their branch (CP/Web Dev/AI-ML/Game Dev/
    Cybersecurity). Existing rows default to 'Team Member' with no domain -
    a coordinator can reassign them from /dashboard/team. Safe to re-run.

*/

ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'Team Member' NOT NULL;
ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_tier_check;
ALTER TABLE public.team_members ADD CONSTRAINT team_members_tier_check
    CHECK (tier IN ('Technical Secretary', 'Coordinator', 'Field Specialist', 'Team Member'));

ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS domain TEXT;
ALTER TABLE public.team_members DROP CONSTRAINT IF EXISTS team_members_domain_check;
ALTER TABLE public.team_members ADD CONSTRAINT team_members_domain_check
    CHECK (domain IS NULL OR domain IN ('Competitive Programming', 'Web Development', 'AI/ML', 'Game Development', 'Cybersecurity'));

NOTIFY pgrst, 'reload schema';
