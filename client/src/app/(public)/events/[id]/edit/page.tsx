import { notFound } from "next/navigation";
import { fetchPublic } from "@/lib/api";
import { RequireManager } from "@/components/require-manager";
import { EventForm } from "@/components/events/event-form";
import type { ClubEvent } from "@/lib/types";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetchPublic<{ data: ClubEvent[] }>("/api/events");
  const event = res?.data.find((e) => e.id === id);

  if (!event) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{"// event management"}</p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">Edit event</h1>
      <div className="mt-8">
        <RequireManager>
          <EventForm event={event} />
        </RequireManager>
      </div>
    </div>
  );
}
