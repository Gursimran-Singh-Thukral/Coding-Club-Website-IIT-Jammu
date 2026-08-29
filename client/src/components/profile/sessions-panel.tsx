"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Laptop, LogOut, ShieldOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { describeUserAgent, timeAgo } from "@/lib/utils";
import type { Session } from "@/lib/types";

export function SessionsPanel() {
  const { logout } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await api.get<{ data: Session[] }>("/api/auth/sessions");
      setSessions(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load sessions.");
    }
  }

  useEffect(() => {
    // Loading the session list means asking the API - an external system.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleRevoke(session: Session) {
    if (session.is_current) {
      await logout();
      router.push("/");
      return;
    }

    setBusyId(session.id);
    try {
      await api.delete(`/api/auth/sessions/${session.id}`);
      toast.success("Session signed out");
      setSessions((prev) => prev?.filter((s) => s.id !== session.id) ?? null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to revoke session");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRevokeOthers() {
    try {
      await api.post("/api/auth/sessions/revoke-others");
      toast.success("Signed out of other devices");
      setSessions((prev) => prev?.filter((s) => s.is_current) ?? null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to sign out other devices");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="normal-case tracking-normal">Active sessions</CardTitle>
        <CardDescription>Devices currently signed in to your account.</CardDescription>
        {sessions && sessions.length > 1 && (
          <CardAction>
            <Button variant="outline" size="sm" onClick={handleRevokeOthers}>
              <ShieldOff className="h-3.5 w-3.5" /> Sign out others
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!sessions && !error && (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {sessions && sessions.length === 0 && <p className="text-sm text-muted-foreground">No active sessions.</p>}

        {sessions && sessions.length > 0 && (
          <ul className="divide-y divide-border/60">
            {sessions.map((session) => (
              <li key={session.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3">
                  <Laptop className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      {describeUserAgent(session.user_agent)}
                      {session.is_current && <Badge variant="secondary">This device</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Active {timeAgo(session.last_used_at)}
                      {session.ip_address ? ` · ${session.ip_address}` : ""}
                    </p>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger render={<Button variant="ghost" size="icon-sm" disabled={busyId === session.id} />}>
                    <LogOut className="h-3.5 w-3.5" />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{session.is_current ? "Sign out this device?" : "Sign out this session?"}</DialogTitle>
                      <DialogDescription>
                        {session.is_current
                          ? "You'll be signed out here too."
                          : `This immediately ends the "${describeUserAgent(session.user_agent)}" session.`}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                      <Button variant="destructive" onClick={() => handleRevoke(session)}>
                        Sign out
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
