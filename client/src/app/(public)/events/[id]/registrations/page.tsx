"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { ArrowLeft, Download, Eye, Trash2, ArrowUpDown, MousePointerClick, Clipboard } from "lucide-react";
import { RequireCoordinator } from "@/components/require-coordinator";
import { api, ApiError } from "@/lib/api";
import { buildSandboxedPreview } from "@/lib/sandbox-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { rowsToCsv, downloadCsv } from "@/lib/csv";
import type { ClubEvent, EventTeam, EventSubmission } from "@/lib/types";

const CSV_HEADERS = [
  { key: "team_name", label: "Team" },
  { key: "full_name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "student_id", label: "Student ID" },
  { key: "role", label: "Role" },
  { key: "joined_at", label: "Registered At" },
  { key: "score", label: "Score" },
];

type TeamSubmission = EventSubmission & { team_name: string };

function TeamReview({
  eventId,
  teamId,
  onEvaluated,
}: {
  eventId: string;
  teamId: string;
  onEvaluated: (teamId: string, score: number | null) => void;
}) {
  const [submission, setSubmission] = useState<TeamSubmission | null>(null);
  const [pane, setPane] = useState<"preview" | "html" | "css" | "js">("preview");
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<{ data: TeamSubmission }>(`/api/events/${eventId}/submissions/${teamId}`)
      .then((res) => {
        setSubmission(res.data);
        setScore(res.data.score !== null ? String(res.data.score) : "");
        setFeedback(res.data.feedback ?? "");
      })
      .catch(() => setSubmission(null));
  }, [eventId, teamId]);

  async function handleSaveEvaluation() {
    setSaving(true);
    try {
      const parsedScore = score.trim() === "" ? null : Number(score);
      if (parsedScore !== null && Number.isNaN(parsedScore)) {
        toast.error("Score must be a number");
        return;
      }
      const res = await api.put<{ data: EventSubmission }>(`/api/events/${eventId}/submissions/${teamId}/evaluate`, {
        score: parsedScore,
        feedback: feedback.trim() || null,
      });
      toast.success("Evaluation saved");
      onEvaluated(teamId, res.data.score);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save evaluation");
    } finally {
      setSaving(false);
    }
  }

  if (!submission) return <Skeleton className="h-[60vh] w-full" />;

  const codePanes = { html: submission.html, css: submission.css, js: submission.js };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Tabs value={pane} onValueChange={(v) => setPane(v as typeof pane)}>
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            <TabsTrigger value="js">JS</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1" title="Times the tab lost focus while working - a soft signal, not proof of anything">
            <MousePointerClick className="h-3.5 w-3.5" /> {submission.tab_switch_count}
          </span>
          <span className="flex items-center gap-1" title="Blocked paste attempts inside the editor">
            <Clipboard className="h-3.5 w-3.5" /> {submission.paste_attempt_count}
          </span>
        </div>
      </div>

      {pane === "preview" ? (
        <iframe
          title="Submission preview"
          sandbox="allow-scripts"
          srcDoc={buildSandboxedPreview(submission)}
          className="h-[50vh] w-full rounded-md border border-border bg-white"
        />
      ) : (
        <div className="h-[50vh] overflow-auto rounded-md border border-border">
          <CodeMirror
            value={codePanes[pane]}
            height="50vh"
            theme={oneDark}
            editable={false}
            readOnly
            extensions={[pane === "html" ? html() : pane === "css" ? css() : javascript()]}
          />
        </div>
      )}

      <div className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-[8rem_1fr]">
        <div>
          <Label htmlFor="score">Score</Label>
          <Input id="score" type="number" value={score} onChange={(e) => setScore(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="feedback">Feedback</Label>
          <Textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={2} className="mt-1" />
        </div>
        <Button size="sm" onClick={handleSaveEvaluation} disabled={saving} className="sm:col-span-2 sm:self-start">
          {saving ? "Saving…" : "Save evaluation"}
        </Button>
      </div>
    </div>
  );
}

function RegistrationsView({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<ClubEvent | null>(null);
  const [teams, setTeams] = useState<EventTeam[] | null>(null);
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [sortByScore, setSortByScore] = useState(false);

  function load() {
    api
      .get<{ data: ClubEvent[] }>("/api/events")
      .then((res) => setEvent(res.data.find((e) => e.id === eventId) ?? null));
    api
      .get<{ data: EventTeam[] }>(`/api/events/${eventId}/registrations`)
      .then((res) => setTeams(res.data))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load registrations"));
  }

  useEffect(load, [eventId]);

  useEffect(() => {
    if (!event?.workspace_enabled || !teams || teams.length === 0) return;
    api
      .get<{ data: (EventTeam & { event_submissions: EventSubmission | null })[] }>(`/api/events/${eventId}/submissions`)
      .then((res) => {
        const next: Record<string, number | null> = {};
        for (const t of res.data) next[t.id] = t.event_submissions?.score ?? null;
        setScores(next);
      })
      .catch(() => {});
  }, [eventId, event?.workspace_enabled, teams]);

  async function handleRemove(teamId: string) {
    try {
      await api.delete(`/api/events/${eventId}/teams/${teamId}`);
      toast.success("Team removed");
      setTeams((prev) => prev?.filter((t) => t.id !== teamId) ?? null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove team");
    }
  }

  function handleDownload() {
    if (!teams) return;
    const rows = teams.flatMap((team) =>
      team.members.map((m) => ({
        team_name: team.team_name,
        full_name: m.users.full_name,
        email: m.users.email,
        student_id: m.users.student_id,
        role: m.is_leader ? "Leader" : "Member",
        joined_at: new Date(m.joined_at).toLocaleString(),
        score: scores[team.id] ?? "",
      }))
    );
    downloadCsv(`registrations_${eventId}.csv`, rowsToCsv(rows, CSV_HEADERS));
  }

  const totalStudents = teams?.reduce((sum, t) => sum + t.members.length, 0) ?? 0;
  const orderedTeams = teams
    ? sortByScore
      ? [...teams].sort((a, b) => (scores[b.id] ?? -Infinity) - (scores[a.id] ?? -Infinity))
      : teams
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button variant="outline" size="sm" render={<Link href={`/events/${eventId}`} />}>
            <ArrowLeft className="h-3.5 w-3.5" /> Event
          </Button>
          <h1 className="mt-3 font-heading text-2xl font-semibold tracking-tight">
            Registrations {event ? `— ${event.title}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {teams ? `${teams.length} team${teams.length === 1 ? "" : "s"} · ${totalStudents} student${totalStudents === 1 ? "" : "s"}` : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {event?.workspace_enabled && (
            <Button variant="outline" size="sm" onClick={() => setSortByScore((v) => !v)}>
              <ArrowUpDown className="h-3.5 w-3.5" /> {sortByScore ? "Sorted by score" : "Sort by score"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!teams || teams.length === 0}>
            <Download className="h-3.5 w-3.5" /> Download CSV
          </Button>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {!teams && <Skeleton className="h-40 w-full" />}
        {teams && teams.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">No one has registered yet.</p>
        )}
        {orderedTeams?.map((team) => (
          <div key={team.id} className="rounded-md border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-heading font-semibold">{team.team_name}</span>
                {event?.registration_mode === "team" && (
                  <Badge variant="outline" className="font-mono">
                    {team.invite_code}
                  </Badge>
                )}
                {event?.workspace_enabled && scores[team.id] != null && (
                  <Badge>{scores[team.id]} pts</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {event?.workspace_enabled && (
                  <Dialog>
                    <DialogTrigger render={<Button variant="outline" size="sm" />}>
                      <Eye className="h-3.5 w-3.5" /> Review
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>{team.team_name}&apos;s submission</DialogTitle>
                        <DialogDescription>Review the code, preview it live, and score it.</DialogDescription>
                      </DialogHeader>
                      <TeamReview
                        eventId={eventId}
                        teamId={team.id}
                        onEvaluated={(teamId, newScore) => setScores((prev) => ({ ...prev, [teamId]: newScore }))}
                      />
                    </DialogContent>
                  </Dialog>
                )}
                <Button variant="destructive" size="sm" onClick={() => handleRemove(team.id)}>
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </Button>
              </div>
            </div>
            <ul className="mt-3 divide-y divide-border/60">
              {team.members.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-4 py-1.5 text-sm">
                  <span>
                    {m.users.full_name} <span className="text-muted-foreground">({m.users.student_id})</span>
                  </span>
                  {m.is_leader && <Badge variant="secondary">Leader</Badge>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegistrationsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <RequireCoordinator>
      <RegistrationsView eventId={id} />
    </RequireCoordinator>
  );
}
