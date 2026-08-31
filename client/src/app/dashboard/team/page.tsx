"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { RequireCoordinator } from "@/components/require-coordinator";
import { TeamMemberForm } from "@/components/team/team-member-form";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { initials } from "@/lib/utils";
import type { TeamMember } from "@/lib/types";

export default function DashboardTeamPage() {
  const [members, setMembers] = useState<TeamMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    try {
      const res = await api.get<{ data: TeamMember[] }>("/api/team");
      setMembers(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load the team roster.");
    }
  }

  useEffect(() => {
    // Loading the roster means asking the API - an external system.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(member: TeamMember) {
    setEditing(member);
    setFormOpen(true);
  }

  function handleSaved(member: TeamMember) {
    setFormOpen(false);
    setMembers((prev) => {
      if (!prev) return [member];
      const exists = prev.some((m) => m.id === member.id);
      const next = exists ? prev.map((m) => (m.id === member.id ? member : m)) : [...prev, member];
      return next.sort((a, b) => a.display_order - b.display_order);
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/api/team/${deleteTarget.id}`);
      toast.success("Team member removed");
      setMembers((prev) => prev?.filter((m) => m.id !== deleteTarget.id) ?? null);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove team member");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <RequireCoordinator>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">{"// team management"}</p>
            <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">The public roster.</h1>
            <p className="mt-1 text-sm text-muted-foreground">Shown on the homepage, in display order.</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add member
          </Button>
        </div>

        <div className="mt-8">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!members && !error && (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {members && members.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No team members yet — add the first one.
              </CardContent>
            </Card>
          )}

          {members && members.length > 0 && (
            <div className="flex flex-col gap-3">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardContent className="flex items-center gap-4">
                    <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <Avatar size="lg">
                      <AvatarImage src={member.image_url ?? undefined} alt={member.name} />
                      <AvatarFallback>{initials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-semibold">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {member.tier}
                        {member.domain ? ` · ${member.domain}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button variant="outline" size="icon-sm" onClick={() => openEdit(member)} aria-label="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="destructive" size="icon-sm" onClick={() => setDeleteTarget(member)} aria-label="Remove">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit team member" : "Add team member"}</DialogTitle>
              <DialogDescription>{editing ? `Updating ${editing.name}.` : "Shown publicly on the homepage."}</DialogDescription>
            </DialogHeader>
            <TeamMemberForm member={editing} onSuccess={handleSaved} />
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove {deleteTarget?.name}?</DialogTitle>
              <DialogDescription>This removes them from the public homepage immediately.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Removing…" : "Remove"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </RequireCoordinator>
    </div>
  );
}
