"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, UserPlus, X } from "lucide-react";

interface User {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
}

interface Invite {
  id: string;
  student_id: string;
  users: {
    id: string;
    full_name: string;
    email: string;
  };
}

export function EventInvitesDialog({ eventId, open, onOpenChange }: { eventId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  async function fetchData() {
    setLoading(true);
    try {
      const [usersRes, invitesRes] = await Promise.all([
        api.get<{ data: User[] }>("/api/users"),
        api.get<{ data: Invite[] }>(`/api/events/${eventId}/invites`)
      ]);
      setUsers(usersRes.data || []);
      setInvites(invitesRes.data || []);
    } catch (err) {
      toast.error("Failed to load invites");
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(studentId: string) {
    setInvitingId(studentId);
    try {
      await api.post(`/api/events/${eventId}/invites`, { studentId });
      toast.success("User invited successfully");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to invite user");
    } finally {
      setInvitingId(null);
    }
  }

  async function handleRevoke(studentId: string) {
    setRevokingId(studentId);
    try {
      await api.delete(`/api/events/${eventId}/invites/${studentId}`);
      toast.success("Invite revoked");
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to revoke invite");
    } finally {
      setRevokingId(null);
    }
  }

  const invitedIds = new Set(invites.map(i => i.student_id));
  const uninvitedUsers = users.filter(u => !invitedIds.has(u.id) && (u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Event Invites</DialogTitle>
          <DialogDescription>Invite students to this private event.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col gap-6">
            <div className="flex flex-col gap-3 min-h-[200px]">
              <h3 className="text-sm font-medium">Currently Invited ({invites.length})</h3>
              <div className="border rounded-md divide-y overflow-y-auto max-h-[200px]">
                {invites.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No one is invited yet.</p>
                ) : (
                  invites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-3">
                      <div>
                        <p className="text-sm font-medium">{invite.users.full_name}</p>
                        <p className="text-xs text-muted-foreground">{invite.users.email}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleRevoke(invite.student_id)} disabled={revokingId === invite.student_id}>
                        {revokingId === invite.student_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 text-red-500" />}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 flex-1 min-h-[200px]">
              <h3 className="text-sm font-medium">Invite Others</h3>
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="border rounded-md divide-y overflow-y-auto flex-1">
                {uninvitedUsers.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No matching users found.</p>
                ) : (
                  uninvitedUsers.slice(0, 50).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3">
                      <div>
                        <p className="text-sm font-medium">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleInvite(user.id)} disabled={invitingId === user.id}>
                        {invitingId === user.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                        Invite
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
