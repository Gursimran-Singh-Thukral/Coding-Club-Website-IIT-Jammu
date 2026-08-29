"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AttendanceRecord } from "@/lib/types";

export function AttendeeList({ eventId }: { eventId: string }) {
  const [records, setRecords] = useState<AttendanceRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ data: AttendanceRecord[] }>(`/api/attendance/${eventId}`)
      .then((res) => {
        if (!cancelled) setRecords(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't load attendees.");
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 normal-case tracking-normal">
          <Users className="h-4 w-4" /> Attendees {records ? `(${records.length})` : ""}
        </CardTitle>
        <CardDescription>Everyone who has checked in with the live code so far.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!records && !error && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        )}
        {records && records.length === 0 && <p className="text-sm text-muted-foreground">No one has checked in yet.</p>}
        {records && records.length > 0 && (
          <ul className="divide-y divide-border/60">
            {records.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <span className="font-medium">{r.users.student_id}</span>
                <span className="text-muted-foreground">{new Date(r.marked_at).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
