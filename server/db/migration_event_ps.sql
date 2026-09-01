/**

    @fileoverview Adds a per-event "PS" (Problem Statement) field. Visible to
    organizers (Coordinators, Technical Secretaries, Field Specialists) at all
    times, and to regular students only after they've marked attendance for
    the event - enforced server-side in eventController.js's getEventPs, not
    just hidden client-side. Deliberately excluded from the public GET
    /api/events listing (see PUBLIC_EVENT_FIELDS in eventController.js).
    Safe to re-run.

*/

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ps TEXT;
