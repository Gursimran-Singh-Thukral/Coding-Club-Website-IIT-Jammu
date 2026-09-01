import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHead } from "@/components/section-head";
import type { AboutContent } from "@/lib/types";

export function AboutSection({ about }: { about: AboutContent | null }) {
  if (!about) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <ScrollReveal>
        <SectionHead index="01" kicker="who we are" title="A campus-wide home for people who build." />
        <div className="mt-5 space-y-4 text-muted-foreground sm:pl-9">
          <p>{about.descriptionParagraph1}</p>
          <p>{about.descriptionParagraph2}</p>
        </div>
      </ScrollReveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:pl-9">
        <ScrollReveal delay={0.05}>
          <div className="panel rounded-md p-5">
            <p className="font-mono text-xs tracking-widest text-muted uppercase">Mission</p>
            <p className="mt-2 text-balance font-heading text-lg leading-snug">{about.mission}</p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.12}>
          <div className="panel rounded-md p-5">
            <p className="font-mono text-xs tracking-widest text-muted uppercase">Vision</p>
            <p className="mt-2 text-balance font-heading text-lg leading-snug">{about.vision}</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
