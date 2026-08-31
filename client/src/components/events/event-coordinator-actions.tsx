"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export function EventManagerActions({ eventId, title }: { eventId: string; title: string }) {
  const { isManager } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  if (!isManager) return null;

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/api/events/${eventId}`);
      toast.success("Event deleted");
      router.push("/events");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete event");
      setDeleting(false);
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button variant="outline" size="sm" render={<Link href={`/events/${eventId}/edit`} />}>
        <Pencil className="h-3.5 w-3.5" /> Edit
      </Button>
      <Dialog>
        <DialogTrigger render={<Button variant="destructive" size="sm" />}>
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this event?</DialogTitle>
            <DialogDescription>
              &quot;{title}&quot; and its attendance records will be permanently removed. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
