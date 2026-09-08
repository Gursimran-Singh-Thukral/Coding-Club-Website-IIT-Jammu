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
  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => category === "All" || e.category === category)
      .filter((e) => getEventStatus(e) !== "past")
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  }, [events, category]);

  const pastEvents = useMemo(() => {
    return events
      .filter((e) => category === "All" || e.category === category)
      .filter((e) => getEventStatus(e) === "past")
      .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
  }, [events, category]);

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
          {isCoordinator && (
            <Button size="sm" render={<Link href="/events/new" />}>
              <Plus className="h-4 w-4" /> New Event
            </Button>
          )}
        </div>
      </div>

      {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
        <p className="mt-16 text-center text-sm text-muted-foreground">
          No events{category !== "All" ? ` in ${category}` : ""} right now.
        </p>
      ) : (
        <div className="mt-8 flex flex-col gap-12">
          {upcomingEvents.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold tracking-tight">Live & Upcoming</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
          
          {pastEvents.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold tracking-tight text-muted-foreground">Past Events</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
