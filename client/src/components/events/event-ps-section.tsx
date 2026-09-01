"use client";

import { useEffect, useState } from "react";
import { FileText, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PsState = "loading" | "locked" | "empty" | "ready";

// Organizers (Coordinator/Technical Secretary/Field Specialist) always get the PS;
// everyone else only after marking attendance - enforced by GET /api/events/:id/ps
// itself (see eventController.js), this component just reflects that response.
export function EventPsSection({ eventId }: { eventId: string }) {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<PsState>("loading");
  const [ps, setPs] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setState("loading");
    api
      .get<{ data: { ps: string | null } }>(`/api/events/${eventId}/ps`)
      .then((res) => {
        if (res.data.ps) {
          setPs(res.data.ps);
          setState("ready");
        } else {
          setState("empty");
        }
      })
      .catch((err) => setState(err instanceof ApiError && err.status === 403 ? "locked" : "empty"));
  }, [eventId, user]);

  if (authLoading || !user || state === "loading" || state === "empty") return null;

  if (state === "locked") {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" />
          Mark attendance during the event to see the problem statement.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 normal-case tracking-normal">
          <FileText className="h-4 w-4" /> Problem statement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{ps}</p>
      </CardContent>
    </Card>
  );
}
