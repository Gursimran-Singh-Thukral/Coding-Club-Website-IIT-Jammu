"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEventDate } from "@/lib/utils";
import type { ClubEvent } from "@/lib/types";

export function HeroSection({ subtitle, nextEvent }: { subtitle: string; nextEvent: ClubEvent | null }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-fade", { y: 16, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out" });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="mx-auto max-w-[min(100vw,150em)] grid grid-cols-1 items-stretch border-b border-line lg:grid-cols-2">
      <div className="rules flex flex-col justify-center px-5 py-16 lg:border-r lg:border-line lg:px-12 lg:py-24">
        <p className="hero-fade font-mono text-xs tracking-[0.25em] text-primary uppercase">
          {"// the coding community at IIT Jammu"}
        </p>

        <h1 className="hero-fade mt-6 font-heading text-5xl leading-[0.95] font-bold tracking-tight sm:text-6xl lg:text-[4.5rem]">
          Where IIT&nbsp;Jammu
          <br />
          writes the <span className="text-primary">future</span>.
        </h1>

        <p className="hero-fade mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">{subtitle}</p>

        <div className="hero-fade mt-9 flex flex-wrap items-center gap-3">
          <Button size="lg" render={<Link href="/events" />}>
            Explore events
            <ArrowRight className="ml-1" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/team" />}>
            Meet the team
          </Button>
        </div>
      </div>

      <div className="flex items-center bg-surface/40 px-5 py-16 lg:px-12">
        <div className="hero-fade w-full">
          <div className="panel overflow-hidden rounded-md">
            <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-3">
              <div className="flex gap-2">
                <span className="size-3 rounded-full bg-[#ff5f56]" />
                <span className="size-3 rounded-full bg-[#ffbd2e]" />
                <span className="size-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="font-mono text-xs text-muted">— ccc@iitjmu: ~/events</span>
            </div>
            <div className="min-h-[13rem] px-5 py-4 font-mono text-[0.82rem] leading-relaxed sm:text-sm">
              <p className="mb-1.5">
                <span className="text-violet">➜ </span>events --next
              </p>
              {nextEvent ? (
                <>
                  <p className="mb-1.5 text-accent">✓ {nextEvent.title}</p>
                  <p className="mb-1.5 text-muted">
                    &nbsp;&nbsp;{formatEventDate(nextEvent.event_date)} · {nextEvent.venue}
                  </p>
                  <p className="mb-1.5">
                    <span className="text-violet">➜ </span>
                    <span className="text-muted">open </span>
                    <Link href={`/events/${nextEvent.id}`} className="text-accent underline-offset-4 hover:underline">
                      {nextEvent.title}
                    </Link>
                    <span className="text-muted"> to RSVP</span>
                  </p>
                </>
              ) : (
                <p className="mb-1.5 text-muted">&nbsp;&nbsp;nothing scheduled right now — check back soon.</p>
              )}
              <p>
                <span className="text-violet">➜ </span>
                <span className="caret" aria-hidden />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
