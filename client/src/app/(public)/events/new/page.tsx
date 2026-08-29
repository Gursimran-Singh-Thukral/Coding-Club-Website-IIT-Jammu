"use client";

import { RequireManager } from "@/components/require-manager";
import { EventForm } from "@/components/events/event-form";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{"// event management"}</p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">New event</h1>
      <div className="mt-8">
        <RequireManager>
          <EventForm />
        </RequireManager>
      </div>
    </div>
  );
}
