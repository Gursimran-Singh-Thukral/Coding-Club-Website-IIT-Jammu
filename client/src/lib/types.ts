export type Role = "Student" | "Field Specialist" | "Coordinator" | "Technical Secretary";

export interface PlatformUser {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
  role: Role;
  created_at: string;
}

export type EventCategory = "Workshop" | "Seminar" | "Hackathon" | "Talk";

export interface ProfileStats {
  github_repos?: number;
  github_followers?: number;
  codeforces_rating?: number;
  codeforces_rank?: string;
  leetcode_solved?: number;
  kaggle_raw_bio?: string;
}

export interface Profile {
  user_id: string;
  bio: string | null;
  avatar_url: string | null;
  github_handle: string | null;
  codeforces_handle: string | null;
  leetcode_handle: string | null;
  kaggle_handle: string | null;
  tryhackme_handle: string | null;
  stats: ProfileStats;
  updated_at: string;
}

export interface SessionUser {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
  role: Role;
  created_at: string;
  profiles: Profile | Profile[] | null;
}

export type RegistrationMode = "individual" | "team";

export interface ClubEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_end: string | null;
  venue: string;
  category: EventCategory;
  registration_open: boolean;
  registration_mode: RegistrationMode;
  max_team_size: number;
  workspace_enabled: boolean;
  created_by: string | null;
  created_at: string;
}

export type EventStatus = "past" | "live" | "upcoming";

export interface TeamMemberEntry {
  id: string;
  is_leader: boolean;
  joined_at: string;
  users: {
    id: string;
    full_name: string;
    email: string;
    student_id: string;
  };
}

export interface EventTeam {
  id: string;
  event_id: string;
  team_name: string;
  invite_code: string;
  created_by: string | null;
  created_at: string;
  members: TeamMemberEntry[];
}

export interface EventSubmission {
  html: string;
  css: string;
  js: string;
  score: number | null;
  feedback: string | null;
  evaluated_at: string | null;
  tab_switch_count: number;
  paste_attempt_count: number;
  updated_at: string | null;
}

export interface AttendanceRecord {
  id: string;
  marked_at: string;
  users: {
    id: string;
    student_id: string;
    email: string;
  };
}

export interface AboutContent {
  heroSubtitle: string;
  descriptionParagraph1: string;
  descriptionParagraph2: string;
  mission: string;
  vision: string;
}

export interface Session {
  id: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  last_used_at: string;
  is_current: boolean;
}

export type TeamTier = "Technical Secretary" | "Coordinator" | "Field Specialist" | "Team Member";

export type TeamDomain = "Competitive Programming" | "Web Development" | "AI/ML" | "Game Development" | "Cybersecurity";

export const TEAM_TIERS: TeamTier[] = ["Technical Secretary", "Coordinator", "Field Specialist", "Team Member"];

export const TEAM_DOMAINS: TeamDomain[] = ["Competitive Programming", "Web Development", "AI/ML", "Game Development", "Cybersecurity"];

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  image_url: string | null;
  github: string | null;
  linkedin: string | null;
  display_order: number;
  tier: TeamTier;
  domain: TeamDomain | null;
  created_at: string;
}
