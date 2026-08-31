import { Avatar, AvatarFallback, AvatarImage, type AvatarSize } from "@/components/ui/avatar";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { initials } from "@/lib/utils";
import type { TeamMember } from "@/lib/types";

// The card's own tier vocabulary (sm..xl, matching the public team page's
// hierarchy - Team -> Field Specialist -> Coordinator -> Tech Sec) maps to
// one Avatar size + one name size each, right here - the single place that
// needs updating if the hierarchy ever gains/loses a level.
const TIER_CONFIG = {
  sm: { avatar: "3xl", name: "text-base", fallback: "text-2xl" },
  md: { avatar: "4xl", name: "text-lg", fallback: "text-3xl" },
  lg: { avatar: "5xl", name: "text-xl", fallback: "text-4xl" },
  xl: { avatar: "6xl", name: "text-2xl", fallback: "text-5xl" },
} satisfies Record<string, { avatar: AvatarSize; name: string; fallback: string }>;

export type TeamCardSize = keyof typeof TIER_CONFIG;

export function TeamMemberCard({ member, size = "md", index = 0 }: { member: TeamMember; size?: TeamCardSize; index?: number }) {
  const { avatar, name, fallback } = TIER_CONFIG[size];

  return (
    <div
      style={{ animationDelay: `${index * 60}ms` }}
      className="rise group relative flex flex-col items-center overflow-hidden rounded-2xl border border-line bg-surface px-6 py-10 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_0_40px_-8px] hover:shadow-primary/30"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--brand-green)_14%,transparent),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative">
        <div className="absolute inset-0 -z-10 scale-110 rounded-full bg-primary/25 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
        <Avatar
          size={avatar}
          className="ring-2 ring-line ring-offset-4 ring-offset-surface transition-all duration-300 group-hover:ring-primary/60"
        >
          <AvatarImage src={member.image_url ?? undefined} alt={member.name} />
          <AvatarFallback className={fallback}>{initials(member.name)}</AvatarFallback>
        </Avatar>
      </div>

      <div className="relative mt-5">
        <p className={`font-heading font-semibold ${name}`}>{member.name}</p>
        <p className="mt-1 font-mono text-xs tracking-wide text-primary uppercase">{member.title}</p>
      </div>

      {(member.github || member.linkedin) && (
        <div className="relative mt-4 flex items-center gap-4 text-muted">
          {member.github && (
            <a href={member.github} target="_blank" rel="noreferrer" aria-label={`${member.name} on GitHub`} className="transition-colors hover:text-primary">
              <GithubIcon className="h-4.5 w-4.5" />
            </a>
          )}
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noreferrer" aria-label={`${member.name} on LinkedIn`} className="transition-colors hover:text-primary">
              <LinkedinIcon className="h-4.5 w-4.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
