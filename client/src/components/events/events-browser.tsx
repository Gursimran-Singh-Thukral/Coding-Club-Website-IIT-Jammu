"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/event-card";
import { useAuth } from "@/lib/auth-context";
import { getEventStatus } from "@/lib/utils";
import type { ClubEvent, EventCategory } from "@/lib/types";

const CATEGORIES: Array<EventCategory | "All"> = ["All", "Workshop", "Seminar", "Hackathon", "Talk"];

export function EventsBrowser({ events }: { events: ClubEvent[] }) {
  const { isCoordinator } = useAuth();
  const [category, setCategory] = useState<string>("All");
  const [when, setWhen] = useState<"upcoming" | "past">("upcoming");

  const filtered = useMemo(() => {
    return events
      .filter((e) => category === "All" || e.category === category)
      .filter((e) => (when === "upcoming" ? getEventStatus(e) !== "past" : getEventStatus(e) === "past"))
      .sort((a, b) => {
        const diff = new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
        return when === "upcoming" ? diff : -diff;
      });
  }, [events, category, when]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={category} onValueChange={(v) => setCategory(v as string)}>
          <TabsList>
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c}>
                {c}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <Tabs value={when} onValueChange={(v) => setWhen(v as "upcoming" | "past")}>
            <TabsList variant="line">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
          </Tabs>
          {isCoordinator && (
            <Button size="sm" render={<Link href="/events/new" />}>
              <Plus className="h-4 w-4" /> New Event
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">
          No {when} events{category !== "All" ? ` in ${category}` : ""} right now.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
