import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHead } from "@/components/section-head";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import type { TeamMember } from "@/lib/types";

export function TeamPreview({ team }: { team: TeamMember[] }) {
  if (!team.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <ScrollReveal>
        <SectionHead index="04" kicker="the people" title="Run by students, for students." />
      </ScrollReveal>

      <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4 sm:pl-9">
        {team.map((member) => (
          <div key={member.id} className="flex flex-col items-center gap-2 bg-ground px-4 py-8 text-center transition-colors hover:bg-surface">
            <Avatar size="xl">
              <AvatarImage src={member.image_url ?? undefined} alt={member.name} />
              <AvatarFallback className="text-lg">{initials(member.name)}</AvatarFallback>
            </Avatar>
            <p className="mt-1 font-heading text-sm font-semibold">{member.name}</p>
            <p className="font-mono text-xs text-muted">{member.title}</p>
            {(member.github || member.linkedin) && (
              <div className="mt-1 flex items-center justify-center gap-3 text-muted">
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
    </section>
  );
}
