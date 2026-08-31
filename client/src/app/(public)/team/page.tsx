import { fetchPublic } from "@/lib/api";
import { TeamMemberCard } from "@/components/team/team-member-card";
import { TEAM_DOMAINS, type TeamMember, type TeamDomain } from "@/lib/types";

export const metadata = { title: "Team · Coding Club IIT Jammu" };

const DOMAIN_LABELS: Record<TeamDomain, string> = {
  "Competitive Programming": "CP Team",
  "Web Development": "Web Dev Team",
  "AI/ML": "AI/ML Team",
  "Game Development": "Game Dev Team",
  Cybersecurity: "Cybersec Team",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <p className="mb-6 text-center font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase">{children}</p>;
}

export default async function TeamPage() {
  const res = await fetchPublic<{ data: TeamMember[] }>("/api/team");
  const team = res?.data ?? [];

  const technicalSecretary = team.filter((m) => m.tier === "Technical Secretary");
  const coordinators = team.filter((m) => m.tier === "Coordinator");
  const fieldSpecialists = team.filter((m) => m.tier === "Field Specialist");
  const teamMembers = team.filter((m) => m.tier === "Team Member");
  const unassigned = teamMembers.filter((m) => !m.domain);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{"// team"}</p>
      <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight">Run by students, for students.</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">The people organizing events, reviewing projects, and keeping the club running.</p>

      {team.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">Coming soon.</p>
      ) : (
        <div className="mt-16 flex flex-col gap-16">
          {technicalSecretary.length > 0 && (
            <section>
              <SectionHeading>Technical Secretary</SectionHeading>
              <div className="mx-auto max-w-lg">
                {technicalSecretary.map((m, i) => (
                  <TeamMemberCard key={m.id} member={m} size="xl" index={i} />
                ))}
              </div>
            </section>
          )}

          {coordinators.length > 0 && (
            <section>
              <SectionHeading>Coordinators</SectionHeading>
              <div className="grid grid-cols-1 place-items-center gap-8 sm:grid-cols-2">
                {coordinators.map((m, i) => (
                  <TeamMemberCard key={m.id} member={m} size="lg" index={i} />
                ))}
              </div>
            </section>
          )}

          {fieldSpecialists.length > 0 && (
            <section>
              <SectionHeading>Field Specialists</SectionHeading>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {fieldSpecialists.map((m, i) => (
                  <TeamMemberCard key={m.id} member={m} size="md" index={i} />
                ))}
              </div>
            </section>
          )}

          {TEAM_DOMAINS.map((domain) => {
            const members = teamMembers.filter((m) => m.domain === domain);
            if (members.length === 0) return null;
            return (
              <section key={domain}>
                <SectionHeading>{DOMAIN_LABELS[domain]}</SectionHeading>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {members.map((m, i) => (
                    <TeamMemberCard key={m.id} member={m} size="sm" index={i} />
                  ))}
                </div>
              </section>
            );
          })}

          {unassigned.length > 0 && (
            <section>
              <SectionHeading>Team</SectionHeading>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {unassigned.map((m, i) => (
                  <TeamMemberCard key={m.id} member={m} size="sm" index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
