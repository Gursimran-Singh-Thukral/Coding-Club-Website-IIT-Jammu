"use client";

import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatBadges } from "@/components/profile/stat-badges";
import { ProfileEditForm } from "@/components/profile/profile-edit-form";
import { SessionsPanel } from "@/components/profile/sessions-panel";
import { initials } from "@/lib/utils";

export default function DashboardProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const profile = Array.isArray(user.profiles) ? user.profiles[0] : user.profiles;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">{"// profile"}</p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">Your digital identity.</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <Avatar size="lg" className="size-20">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt={user.full_name} />
              <AvatarFallback className="text-lg">{initials(user.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-heading text-lg font-semibold">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant="secondary">{user.role}</Badge>
            {profile?.bio && <p className="mt-1 max-w-xs text-sm text-muted-foreground">{profile.bio}</p>}
            <StatBadges stats={profile?.stats} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="normal-case tracking-normal">Edit details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileEditForm profile={profile ?? null} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <SessionsPanel />
      </div>
    </div>
  );
}
