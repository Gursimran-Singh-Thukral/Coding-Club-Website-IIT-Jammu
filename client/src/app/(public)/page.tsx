import { fetchPublic } from "@/lib/api";
import { getEventStatus } from "@/lib/utils";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { DomainsSection } from "@/components/domains-section";
import { ProjectsPreview } from "@/components/projects-preview";
import { TeamPreview } from "@/components/team-preview";
import type { AboutContent, ClubEvent, TeamMember } from "@/lib/types";

export default async function HomePage() {
  const [about, teamRes, eventsRes] = await Promise.all([
    fetchPublic<AboutContent>("/api/about"),
    fetchPublic<{ data: TeamMember[] }>("/api/team"),
    fetchPublic<{ data: ClubEvent[] }>("/api/events"),
  ]);

  const nextEvent =
    eventsRes?.data
      ?.filter((e) => getEventStatus(e) !== "past")
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())[0] ?? null;

  return (
    <>
      <HeroSection subtitle={about?.heroSubtitle ?? "The official hub for IIT Jammu's developer ecosystem."} nextEvent={nextEvent} />
      <AboutSection about={about} />
      <DomainsSection />
      <ProjectsPreview />
      {/* <TeamPreview team={teamRes?.data ?? []} /> */}
    </>
  );
}
