"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, Clock, MapPin } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ClubEvent, EventCategory } from "@/lib/types";

const CATEGORIES: EventCategory[] = ["Workshop", "Seminar", "Hackathon", "Talk"];

const schema = z.object({
  title: z.string().min(3, "Title is too short"),
  description: z.string().optional(),
  venue: z.string().min(2, "Venue is required"),
  category: z.enum(["Workshop", "Seminar", "Hackathon", "Talk"]),
  event_date: z.string().min(1, "Date & time is required"),
  end_time: z.string().optional(),
  ps: z.string().optional(),
  registration_open: z.boolean(),
  registration_mode: z.enum(["individual", "team"]),
  max_team_size: z.coerce.number().int().min(1).max(20),
  workspace_enabled: z.boolean(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toLocalTimeValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Combines the start date with an end-of-day time-of-day into a full
// timestamp, rolling to the next day if the end time is earlier than the
// start time (overnight events).
function combineEndDateTime(startIso: string, endTime: string) {
  const start = new Date(startIso);
  const [hours, minutes] = endTime.split(":").map(Number);
  const end = new Date(start);
  end.setHours(hours, minutes, 0, 0);
  if (end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);
  return end.toISOString();
}

export function EventForm({ event }: { event?: ClubEvent }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description ?? "",
          venue: event.venue,
          category: event.category,
          event_date: toLocalInputValue(event.event_date),
          end_time: event.event_end ? toLocalTimeValue(event.event_end) : "",
          ps: "",
          registration_open: event.registration_open,
          registration_mode: event.registration_mode,
          max_team_size: event.max_team_size,
          workspace_enabled: event.workspace_enabled,
        }
      : {
          category: "Workshop",
          ps: "",
          registration_open: false,
          registration_mode: "individual",
          max_team_size: 4,
          workspace_enabled: false,
        },
  });

  const registrationOpen = watch("registration_open");
  const registrationMode = watch("registration_mode");

  useEffect(() => {
    // The PS Has its own Attendance/Role-Gated Endpoint (see eventController.js's
    // getEventPs) - it's Deliberately Excluded from the Public GET /api/events
    // Listing this Form's `event` Prop Comes From, so it has to be Fetched Separately.
    if (!event) return;
    api
      .get<{ data: { ps: string | null } }>(`/api/events/${event.id}/ps`)
      .then((res) => setValue("ps", res.data.ps ?? ""))
      .catch(() => {});
  }, [event, setValue]);

  async function onSubmit(values: FormOutput) {
    const { end_time, ...rest } = values;
    const payload = {
      ...rest,
      event_date: new Date(values.event_date).toISOString(),
      event_end: end_time ? combineEndDateTime(values.event_date, end_time) : null,
    };
    try {
      if (event) {
        await api.put(`/api/events/${event.id}`, payload);
        toast.success("Event updated");
        router.push(`/events/${event.id}`);
      } else {
        const res = await api.post<{ data: ClubEvent }>("/api/events", payload);
        toast.success("Event created");
        router.push(`/events/${res.data.id}`);
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} className="mt-1" />
        {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} className="mt-1" rows={4} />
      </div>

      <div>
        <Label htmlFor="ps">Problem statement (PS)</Label>
        <Textarea
          id="ps"
          {...register("ps")}
          className="mt-1 font-mono text-sm"
          rows={18}
          placeholder={"Overview\n\nRequirements\n- ...\n\nEvaluation criteria\n- ...\n\nSubmission instructions\n- ..."}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          As long as it needs to be - requirements, evaluation criteria, submission instructions, whatever the
          event needs. Line breaks and spacing are preserved as typed. Visible to Coordinators, Technical
          Secretaries and Field Specialists at all times. Everyone else only sees it after marking attendance for
          this event.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <Label htmlFor="event_date" className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5 text-primary" /> Start date &amp; time
          </Label>
          <div className="date-time-field mt-1">
            <Input id="event_date" type="datetime-local" {...register("event_date")} className="pr-9" />
            <button
              type="button"
              aria-label="Open date picker"
              onClick={() => (document.getElementById("event_date") as HTMLInputElement | null)?.showPicker?.()}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-primary"
            >
              <CalendarClock className="h-4 w-4" />
            </button>
          </div>
          {errors.event_date && <p className="mt-1 text-xs text-destructive">{errors.event_date.message}</p>}
        </div>
        <div>
          <Label htmlFor="end_time" className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-primary" /> End time
          </Label>
          <div className="date-time-field mt-1">
            <Input id="end_time" type="time" {...register("end_time")} className="pr-9" />
            <button
              type="button"
              aria-label="Open time picker"
              onClick={() => (document.getElementById("end_time") as HTMLInputElement | null)?.showPicker?.()}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-primary"
            >
              <Clock className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Optional - lets the site show Live/Past correctly.</p>
        </div>
        <div>
          <Label htmlFor="venue" className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" /> Venue
          </Label>
          <Input id="venue" {...register("venue")} className="mt-1" />
          {errors.venue && <p className="mt-1 text-xs text-destructive">{errors.venue.message}</p>}
        </div>
      </div>

      <div>
        <Label>Category</Label>
        <Select value={watch("category")} onValueChange={(v) => setValue("category", v as EventCategory)}>
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-border p-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" className="accent-primary" {...register("registration_open")} />
          Open registration for this event
        </label>

        {registrationOpen && (
          <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
            <div>
              <Label>Registration type</Label>
              <div className="mt-1.5 flex gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                  <input type="radio" value="individual" className="accent-primary" {...register("registration_mode")} />
                  Individual
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="radio" value="team" className="accent-primary" {...register("registration_mode")} />
                  Team-based (invite code to join)
                </label>
              </div>
            </div>

            {registrationMode === "team" && (
              <div className="max-w-40">
                <Label htmlFor="max_team_size">Max team size</Label>
                <Input id="max_team_size" type="number" min={1} max={20} {...register("max_team_size")} className="mt-1" />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" className="accent-primary" {...register("workspace_enabled")} />
              Enable in-browser HTML/CSS/JS workspace for participants
            </label>
          </div>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2 self-start">
        {isSubmitting ? "Saving…" : event ? "Save changes" : "Create event"}
      </Button>
    </form>
  );
}
