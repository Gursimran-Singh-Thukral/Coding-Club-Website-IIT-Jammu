import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { fetchPublic } from "@/lib/api";
import { formatEventDate, formatEventTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AttendanceWidget } from "@/components/attendance/attendance-widget";
import { EventManagerActions } from "@/components/events/event-manager-actions";
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
          <Badge variant="secondary">{event.category}</Badge>
          <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight">{event.title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatEventDate(event.event_date)} · {formatEventTime(event.event_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {event.venue}
            </span>
          </div>
        </div>
        <EventManagerActions eventId={event.id} title={event.title} />
      </div>

      {event.description && <p className="mt-8 max-w-2xl leading-relaxed text-muted-foreground">{event.description}</p>}

      <div className="mt-10">
        <AttendanceWidget eventId={event.id} />
      </div>
    </div>
  );
}
