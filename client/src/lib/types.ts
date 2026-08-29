export type Role = "Student" | "Field Specialist" | "Manager" | "Technical Secretary";

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

export interface ClubEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  venue: string;
  category: EventCategory;
  created_by: string | null;
  created_at: string;
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

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  image_url: string | null;
  github: string | null;
  linkedin: string | null;
  display_order: number;
  created_at: string;
}
