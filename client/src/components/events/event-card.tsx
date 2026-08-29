import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatEventDate, formatEventTime, isUpcoming } from "@/lib/utils";
import type { ClubEvent } from "@/lib/types";

export function EventCard({ event }: { event: ClubEvent }) {
  const upcoming = isUpcoming(event.event_date);

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <Card className="h-full group-hover:border-primary/40 group-hover:bg-surface-2">
        <CardContent className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary">{event.category}</Badge>
            {!upcoming && (
              <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">Past</span>
            )}
          </div>
          <h3 className="mt-3 font-heading text-lg font-semibold group-hover:underline">{event.title}</h3>
          {event.description && (
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
          )}
          <div className="mt-4 flex flex-col gap-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatEventDate(event.event_date)} · {formatEventTime(event.event_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {event.venue}
            </span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
            View details <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
