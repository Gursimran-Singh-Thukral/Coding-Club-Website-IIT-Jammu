"use client";

import { useEffect, useState } from "react";
import { AlertOctagon, AlertTriangle, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { timeAgo } from "@/lib/utils";
import type { ClubEvent, EventSubmission } from "@/lib/types";

const POLL_MS = 6000;

interface SubmissionTeamRow {
  id: string;
  team_name: string;
  // PostgREST returns a to-one embed as an object, but as an array in some
  // shapes depending on how the relationship is inferred - handle both.
  event_submissions: EventSubmission | EventSubmission[] | null;
}

function submissionOf(row: SubmissionTeamRow): EventSubmission | null {
  if (!row.event_submissions) return null;
  return Array.isArray(row.event_submissions) ? (row.event_submissions[0] ?? null) : row.event_submissions;
}

// Coordinator-only, live-polling view of every team's self-reported tab-switch
// and blocked-paste counts (see workspace/page.tsx) for events with the
// in-browser workspace enabled. Same data source as the judging panel
// (GET /api/events/:id/submissions, requireCoordinator-gated server-side) -
// this just polls it and surfaces the integrity counters instead of code.
export function IntegrityMonitor({ event }: { event: ClubEvent }) {
  const { isCoordinator, loading: authLoading } = useAuth();
  const [teams, setTeams] = useState<SubmissionTeamRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isCoordinator || !event.workspace_enabled) return;
    let cancelled = false;

    function load() {
      api
        .get<{ data: SubmissionTeamRow[] }>(`/api/events/${event.id}/submissions`)
        .then((res) => {
          if (!cancelled) setTeams(res.data);
        })
        .catch((err) => {
          if (!cancelled) setError(err instanceof ApiError ? err.message : "Couldn't load integrity data.");
        });
    }

    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [event.id, event.workspace_enabled, isCoordinator]);

  if (authLoading || !isCoordinator || !event.workspace_enabled) return null;

  const rows = (teams ?? [])
    .map((t) => {
      const sub = submissionOf(t);
      return {
        id: t.id,
        team_name: t.team_name,
        tab_switch_count: sub?.tab_switch_count ?? 0,
        paste_attempt_count: sub?.paste_attempt_count ?? 0,
        updated_at: sub?.updated_at ?? null,
      };
    })
    .sort((a, b) => b.tab_switch_count + b.paste_attempt_count - (a.tab_switch_count + a.paste_attempt_count));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 normal-case tracking-normal">
          <ShieldAlert className="h-4 w-4" /> Live integrity monitor
        </CardTitle>
        <CardDescription>
          Self-reported tab switches &amp; blocked paste attempts per team, refreshing every {POLL_MS / 1000}s. A
          client-side signal a determined student can defeat via devtools - treat it as a lead to check on in
          person, not proof.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!teams && !error && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        )}
        {teams && rows.length === 0 && <p className="text-sm text-muted-foreground">No teams registered yet.</p>}
        {teams && rows.length > 0 && (
          <ul className="divide-y divide-border/60">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <div>
                  <span className="font-medium">{row.team_name}</span>
                  {row.updated_at && (
                    <span className="ml-2 text-xs text-muted-foreground">active {timeAgo(row.updated_at)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={row.tab_switch_count > 0 ? "destructive" : "secondary"}>
                    <AlertTriangle className="h-3 w-3" /> {row.tab_switch_count} tab{" "}
                    {row.tab_switch_count === 1 ? "switch" : "switches"}
                  </Badge>
                  <Badge variant={row.paste_attempt_count > 0 ? "destructive" : "secondary"}>
                    <AlertOctagon className="h-3 w-3" /> {row.paste_attempt_count} paste{" "}
                    {row.paste_attempt_count === 1 ? "attempt" : "attempts"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
