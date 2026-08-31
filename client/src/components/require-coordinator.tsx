"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function RequireManager({ children }: { children: React.ReactNode }) {
  const { user, loading, isManager } = useAuth();

  if (loading) return <Skeleton className="h-64 w-full" />;

  if (!isManager) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <ShieldAlert className="h-6 w-6 text-muted-foreground" />
        <p className="font-heading text-lg font-semibold">Managers only</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {user ? "Your role doesn't have access to event management yet." : "Sign in with a Manager account to continue."}
        </p>
        <Button render={<Link href={user ? "/events" : "/login"} />}>{user ? "Back to events" : "Sign in"}</Button>
      </div>
    );
  }

  return <>{children}</>;
}
