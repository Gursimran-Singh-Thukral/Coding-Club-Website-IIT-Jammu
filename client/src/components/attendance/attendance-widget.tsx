"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CodeEntryForm } from "@/components/attendance/code-entry-form";
import { LiveCodeDisplay } from "@/components/attendance/live-code-display";
import { AttendeeList } from "@/components/attendance/attendee-list";

export function AttendanceWidget({ eventId }: { eventId: string }) {
  const { user, loading, isManager } = useAuth();

  if (loading) return <Skeleton className="h-40 w-full" />;

  if (!user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <LogIn className="h-5 w-5 text-muted-foreground" />
          <p className="font-heading font-semibold">Sign in to mark attendance</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Attendance is tied to your institute account so it can&apos;t be shared or spoofed.
          </p>
          <Button render={<Link href="/login" />}>Sign in</Button>
        </CardContent>
      </Card>
    );
  }

  if (isManager) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <LiveCodeDisplay eventId={eventId} />
        <AttendeeList eventId={eventId} />
      </div>
    );
  }

  return <CodeEntryForm eventId={eventId} />;
}
