import { notFound } from "next/navigation";
import { CalendarDays, MapPin, MonitorPlay } from "lucide-react";
import { fetchServer } from "@/lib/api-server";
import { formatEventDate, formatEventTimeRange } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { AttendanceWidget } from "@/components/attendance/attendance-widget";
import { RegistrationWidget } from "@/components/events/registration-widget";
import { EventCoordinatorActions } from "@/components/events/event-coordinator-actions";
import { EventPsSection } from "@/components/events/event-ps-section";
import { IntegrityMonitor } from "@/components/events/integrity-monitor";
import { CtfBoard } from "@/components/ctf/ctf-board";
import { CtfLeaderboard } from "@/components/ctf/ctf-leaderboard";
import { LivestreamViewer } from "@/components/events/livestream-viewer";
import type { ClubEvent } from "@/lib/types";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetchServer<{ data: ClubEvent[] }>("/api/events");
  const event = res?.data.find((e) => e.id === id);

  if (!event) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{event.category}</Badge>
            {event.is_private && <Badge variant="outline" className="border-red-500 text-red-500">Private</Badge>}
            <EventStatusBadge event={event} />
          </div>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight">{event.title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatEventDate(event.event_date)} · {formatEventTimeRange(event)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {event.venue}
            </span>
          </div>
        </div>
        <EventCoordinatorActions eventId={event.id} title={event.title} isPrivate={event.is_private} />
      </div>

      {event.description && <p className="mt-8 max-w-2xl leading-relaxed text-muted-foreground">{event.description}</p>}

      {event.registration_open && (
        <div className="mt-10">
          <RegistrationWidget event={event} />
        </div>
      )}

      <div className="mt-10">
        <AttendanceWidget eventId={event.id} />
      </div>

      <div className="mt-10">
        <EventPsSection eventId={event.id} />
      </div>

      {event.category === "Hackathon" && (
        <div className="mt-10 space-y-10">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              Capture The Flag (CTF)
            </h2>
            <CtfBoard eventId={event.id} />
          </div>
          <CtfLeaderboard eventId={event.id} />
        </div>
      )}

      <div className="mt-10">
        <LivestreamViewer event={event} />
      </div>

      <div className="mt-10">
        <IntegrityMonitor event={event} />
      </div>

      {event.category === "Workshop" && (
        <div className="mt-10 flex flex-col items-start gap-4 p-6 bg-muted/50 rounded-lg border">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MonitorPlay className="h-5 w-5 text-primary" /> Live Workshop Environment
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Join the interactive live session where you can see the instructor's code in real-time and experiment in your own sandbox.
            </p>
          </div>
          <Button render={<Link href={`/cybersecurity?eventId=${event.id}`} />}>
            Enter Live Session
          </Button>
        </div>
      )}
    </div>
  );
}
