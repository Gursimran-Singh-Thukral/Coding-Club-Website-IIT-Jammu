import { ScrollReveal } from "@/components/scroll-reveal";
import { SectionHead } from "@/components/section-head";

const DOMAINS = [
  {
    tag: "web",
    title: "Web & App",
    body: "Full-stack product work — the club portal, event tooling, and anything the campus ends up using daily.",
    stack: ["Next.js", "TypeScript"],
  },
  {
    tag: "ml",
    title: "ML & AI",
    body: "Reading groups and paper reproductions that go past the notebook and into something you can actually run.",
    stack: ["PyTorch", "Python"],
  },
  {
    tag: "cp",
    title: "Competitive",
    body: "Weekly practice and contest prep for Codeforces, ICPC, and campus ladders.",
    stack: ["C++", "Codeforces"],
  },
  {
    tag: "sec",
    title: "Security",
    body: "CTF practice and applied security — breaking things deliberately, then understanding why they broke.",
    stack: ["CTF", "Web", "Crypto"],
  },
];

export function DomainsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <ScrollReveal>
        <SectionHead index="02" kicker="what we build" title="Where members go deep" sub="Pick a domain, or bounce between a couple." />
      </ScrollReveal>

      <ScrollReveal delay={0.08} className="mt-10 sm:pl-9">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
          {DOMAINS.map((d) => (
            <article key={d.tag} className="flex flex-col bg-ground p-5 transition-colors hover:bg-surface">
              <span className="font-mono text-xs tracking-widest text-accent uppercase">/{d.tag}</span>
              <h3 className="mt-3 font-heading text-lg font-semibold tracking-tight">{d.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {d.stack.map((t) => (
                  <span key={t} className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-[0.65rem] text-muted">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
