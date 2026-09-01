import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { fetchPublic } from "@/lib/api";
import { formatEventDate, formatEventTimeRange } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { AttendanceWidget } from "@/components/attendance/attendance-widget";
import { RegistrationWidget } from "@/components/events/registration-widget";
import { EventCoordinatorActions } from "@/components/events/event-coordinator-actions";
import { EventPsSection } from "@/components/events/event-ps-section";
import { IntegrityMonitor } from "@/components/events/integrity-monitor";
import type { ClubEvent } from "@/lib/types";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetchPublic<{ data: ClubEvent[] }>("/api/events");
  const event = res?.data.find((e) => e.id === id);

  if (!event) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{event.category}</Badge>
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
        <EventCoordinatorActions eventId={event.id} title={event.title} />
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

      <div className="mt-10">
        <IntegrityMonitor event={event} />
      </div>
    </div>
  );
}
