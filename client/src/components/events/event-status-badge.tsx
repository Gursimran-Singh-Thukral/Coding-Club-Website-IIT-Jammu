import { getEventStatus } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ClubEvent } from "@/lib/types";

export function EventStatusBadge({ event, className }: { event: Pick<ClubEvent, "event_date" | "event_end">; className?: string }) {
  const status = getEventStatus(event);

  if (status === "live") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary",
          className
        )}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        Live
      </span>
    );
  }

  return (
    <span className={cn("text-[10px] font-semibold tracking-widest text-muted-foreground uppercase", className)}>
      {status === "past" ? "Past" : "Upcoming"}
    </span>
  );
}
