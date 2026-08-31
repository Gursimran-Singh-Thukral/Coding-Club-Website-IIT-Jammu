"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { LogIn, Users, Copy, Code2, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { getEventStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClubEvent, EventTeam } from "@/lib/types";

export function RegistrationWidget({ event }: { event: ClubEvent }) {
  const { user, isCoordinator, loading: authLoading } = useAuth();
  const [team, setTeam] = useState<EventTeam | null | undefined>(undefined);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Nothing to synchronize while signed out - the render below never
    // reaches the team-dependent branches in that case.
    if (!user) return;
    api
      .get<{ data: EventTeam | null }>(`/api/events/${event.id}/teams/me`)
      .then((res) => setTeam(res.data))
      .catch(() => setTeam(null));

    // Coordinators run the event rather than checking into it - they skip
    // this gate (server enforces the same exemption independently).
    if (event.workspace_enabled && !isCoordinator) {
      api
        .get<{ data: { marked: boolean } }>(`/api/attendance/${event.id}/me`)
        .then((res) => setAttendanceMarked(res.data.marked))
        .catch(() => setAttendanceMarked(false));
    }
  }, [event.id, event.workspace_enabled, user, isCoordinator]);

  const isLive = getEventStatus(event) === "live";
  const workspaceUnlocked = event.workspace_enabled && isLive && (attendanceMarked || isCoordinator);

  async function handleRegister() {
    setBusy(true);
    try {
      const res = await api.post<{ data: EventTeam }>(`/api/events/${event.id}/teams`, {
        team_name: user!.full_name,
      });
      setTeam(res.data);
      toast.success("You're registered!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to register");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateTeam() {
    if (!teamName.trim()) return;
    setBusy(true);
    try {
      const res = await api.post<{ data: EventTeam }>(`/api/events/${event.id}/teams`, { team_name: teamName });
      setTeam(res.data);
      toast.success("Team created!");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create team");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoinTeam() {
    if (!inviteCode.trim()) return;
    setBusy(true);
    try {
      const res = await api.post<{ data: EventTeam }>(`/api/events/${event.id}/teams/join`, {
        invite_code: inviteCode,
      });
      setTeam(res.data);
      toast.success(`Joined ${res.data.team_name}!`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to join team");
    } finally {
      setBusy(false);
    }
  }

  async function handleLeave() {
    setBusy(true);
    try {
      await api.delete(`/api/events/${event.id}/teams/me`);
      setTeam(null);
      toast.success("You've left the event");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to leave");
    } finally {
      setBusy(false);
    }
  }

  function copyInviteCode() {
    if (!team) return;
    navigator.clipboard.writeText(team.invite_code).then(() => toast.success("Invite code copied"));
  }

  if (authLoading) return <Skeleton className="h-40 w-full" />;

  if (!user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <LogIn className="h-5 w-5 text-muted-foreground" />
          <p className="font-heading font-semibold">Sign in to register</p>
          <Button render={<Link href="/login" />}>Sign in</Button>
        </CardContent>
      </Card>
    );
  }

  if (team === undefined) return <Skeleton className="h-40 w-full" />;

  if (team) {
    const myMembership = team.members.find((m) => m.users.id === user.id);
    const iAmLeader = !!myMembership?.is_leader;
    const iAmSoleMember = team.members.length === 1;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 normal-case tracking-normal">
            <Users className="h-4 w-4" /> {team.team_name}
          </CardTitle>
          <CardDescription>You&apos;re registered for this event.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {event.registration_mode === "team" && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm tracking-widest">{team.invite_code}</span>
              <Button variant="outline" size="icon-sm" onClick={copyInviteCode} aria-label="Copy invite code">
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground">
                Share this code so teammates can join ({team.members.length}/{event.max_team_size})
              </span>
            </div>
          )}

          <ul className="divide-y divide-border/60">
            {team.members.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 py-2 text-sm">
                <span className="font-medium">{m.users.full_name}</span>
                {m.is_leader && <Badge variant="secondary">Leader</Badge>}
              </li>
            ))}
          </ul>

          {event.workspace_enabled && (
            <div>
              {workspaceUnlocked ? (
                <Button size="sm" render={<Link href={`/events/${event.id}/workspace`} />}>
                  <Code2 className="h-3.5 w-3.5" /> Open workspace
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {!isLive
                    ? "The workspace opens once the event goes live."
                    : "Mark attendance during the event to unlock the workspace."}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {(!iAmLeader || iAmSoleMember) && (
              <Button variant="outline" size="sm" onClick={handleLeave} disabled={busy}>
                <LogOut className="h-3.5 w-3.5" /> {iAmLeader ? "Disband team" : "Leave team"}
              </Button>
            )}
            {iAmLeader && !iAmSoleMember && (
              <p className="text-xs text-muted-foreground self-center">
                You&apos;re the leader - ask a coordinator to remove the team if you need to cancel it.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 normal-case tracking-normal">
          <Users className="h-4 w-4" /> Registration
        </CardTitle>
        <CardDescription>
          {event.registration_mode === "team"
            ? "Create a team or join one with an invite code."
            : "Register yourself for this event."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {event.registration_mode === "individual" ? (
          <Button onClick={handleRegister} disabled={busy}>
            {busy ? "Registering…" : "Register"}
          </Button>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="team_name">Create a team</Label>
              <Input
                id="team_name"
                placeholder="Team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
              <Button onClick={handleCreateTeam} disabled={busy || !teamName.trim()} size="sm" className="self-start">
                Create team
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="invite_code">Join with a code</Label>
              <Input
                id="invite_code"
                placeholder="Invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="font-mono tracking-widest"
              />
              <Button
                onClick={handleJoinTeam}
                disabled={busy || !inviteCode.trim()}
                size="sm"
                variant="outline"
                className="self-start"
              >
                Join team
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
