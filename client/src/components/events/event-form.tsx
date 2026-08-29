"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
});

type FormValues = z.infer<typeof schema>;

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({ event }: { event?: ClubEvent }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description ?? "",
          venue: event.venue,
          category: event.category,
          event_date: toLocalInputValue(event.event_date),
        }
      : { category: "Workshop" },
  });

  async function onSubmit(values: FormValues) {
    const payload = { ...values, event_date: new Date(values.event_date).toISOString() };
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="event_date">Date &amp; time</Label>
          <Input id="event_date" type="datetime-local" {...register("event_date")} className="mt-1" />
          {errors.event_date && <p className="mt-1 text-xs text-destructive">{errors.event_date.message}</p>}
        </div>
        <div>
          <Label htmlFor="venue">Venue</Label>
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

      <Button type="submit" disabled={isSubmitting} className="mt-2 self-start">
        {isSubmitting ? "Saving…" : event ? "Save changes" : "Create event"}
      </Button>
    </form>
  );
}
