import { fetchPublic } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { initials } from "@/lib/utils";
import type { TeamMember } from "@/lib/types";

export const metadata = { title: "Team · Coding Club IIT Jammu" };

export default async function TeamPage() {
  const res = await fetchPublic<{ data: TeamMember[] }>("/api/team");
  const team = res?.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{"// team"}</p>
      <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight">Run by students, for students.</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">The people organizing events, reviewing projects, and keeping the club running.</p>

      {team.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">Coming soon.</p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
          {team.map((member) => (
            <div key={member.id} className="flex flex-col items-center gap-2 bg-ground px-4 py-8 text-center transition-colors hover:bg-surface">
              <Avatar size="lg" className="size-20">
                <AvatarImage src={member.image_url ?? undefined} alt={member.name} />
                <AvatarFallback className="text-lg">{initials(member.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-heading font-semibold">{member.name}</p>
                <p className="font-mono text-xs text-muted">{member.title}</p>
              </div>
              {(member.github || member.linkedin) && (
                <div className="flex items-center gap-3 text-muted">
                  {member.github && (
                    <a href={member.github} target="_blank" rel="noreferrer" aria-label={`${member.name} on GitHub`} className="hover:text-accent">
                      <GithubIcon className="h-4 w-4" />
                    </a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} target="_blank" rel="noreferrer" aria-label={`${member.name} on LinkedIn`} className="hover:text-accent">
                      <LinkedinIcon className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
