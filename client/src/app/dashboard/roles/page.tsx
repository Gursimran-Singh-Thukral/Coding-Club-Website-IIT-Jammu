"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, ShieldCheck } from "lucide-react";
import { RequireCoordinator } from "@/components/require-coordinator";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PlatformUser, Role } from "@/lib/types";

const ROLES: Role[] = ["Student", "Field Specialist", "Coordinator", "Technical Secretary"];

function RolesView() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<PlatformUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .get<{ data: PlatformUser[] }>("/api/users")
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load users."));
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.student_id.toLowerCase().includes(q)
    );
  }, [users, query]);

  async function handleRoleChange(target: PlatformUser, role: Role) {
    const previous = target.role;
    setUsers((prev) => prev?.map((u) => (u.id === target.id ? { ...u, role } : u)) ?? null);
    try {
      await api.put(`/api/users/${target.id}/role`, { role });
      toast.success(`${target.full_name} is now ${role}`);
    } catch (err) {
      setUsers((prev) => prev?.map((u) => (u.id === target.id ? { ...u, role: previous } : u)) ?? null);
      toast.error(err instanceof ApiError ? err.message : "Failed to update role");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">{"// role management"}</p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">Platform roles.</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Promote members to Field Specialist, Coordinator, or Technical Secretary. Changes apply immediately.
      </p>

      <div className="relative mt-8 max-w-sm">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or student ID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="mt-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!users && !error && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {users && filtered.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">No users match &quot;{query}&quot;.</p>
        )}

        {filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map((u) => (
              <Card key={u.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-semibold">{u.full_name}</p>
                      {u.id === me?.id && <Badge variant="secondary">You</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {u.email} · {u.student_id}
                    </p>
                  </div>

                  {u.id === me?.id ? (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5" /> {u.role}
                    </div>
                  ) : (
                    <Select value={u.role} onValueChange={(v) => handleRoleChange(u, v as Role)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RolesPage() {
  return (
    <RequireCoordinator>
      <RolesView />
    </RequireCoordinator>
  );
}
