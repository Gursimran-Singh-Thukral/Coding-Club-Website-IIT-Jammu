import { fetchPublic } from "@/lib/api";
import { EventsBrowser } from "@/components/events/events-browser";
import type { ClubEvent } from "@/lib/types";

export const metadata = { title: "Events · Coding Club IIT Jammu" };

export default async function EventsPage() {
  const res = await fetchPublic<{ data: ClubEvent[] }>("/api/events");
  const events = res?.data ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{"// events"}</p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight">Workshops, hackathons & talks.</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Every session the club runs — register, show up, and mark attendance with the live code on screen.
      </p>

      <div className="mt-10">
        {res === null ? (
          <p className="text-sm text-muted-foreground">Couldn&apos;t reach the server right now. Try again shortly.</p>
        ) : (
          <EventsBrowser events={events} />
        )}
      </div>
    </div>
  );
}
