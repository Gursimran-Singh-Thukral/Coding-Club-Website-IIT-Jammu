import { Terminal } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHead } from "@/components/section-head";

export function ProjectsPreview() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <ScrollReveal>
        <SectionHead index="03" kicker="showcase" title="Built by club members." />
      </ScrollReveal>

      <ScrollReveal delay={0.08} className="mt-10 sm:pl-9">
        <div className="panel flex flex-col items-center gap-3 rounded-md py-16 text-center">
          <Terminal className="h-6 w-6 text-accent" />
          <p className="font-heading text-xl font-semibold">Coming soon.</p>
        </div>
      </ScrollReveal>
    </section>
  );
}
