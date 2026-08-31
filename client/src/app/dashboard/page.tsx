"use client";

import Link from "next/link";
import { CalendarDays, UserRound, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardOverviewPage() {
  const { user, isCoordinator } = useAuth();
  if (!user) return null;

  const profile = Array.isArray(user.profiles) ? user.profiles[0] : user.profiles;
  const profileIncomplete = !profile?.bio && !profile?.github_handle;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-sm text-muted-foreground">Welcome back,</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{user.full_name.split(" ")[0]}</h1>
        <Badge variant="secondary">{user.role}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {user.student_id} · member since {new Date(user.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
      </p>

      {profileIncomplete && (
        <Card className="mt-8">
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-heading font-semibold">Your profile is looking bare.</p>
              <p className="text-sm text-muted-foreground">Add a bio and your GitHub/Codeforces/LeetCode handles so people can find you.</p>
            </div>
            <Button size="sm" render={<Link href="/dashboard/profile" />}>
              Complete profile
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 normal-case tracking-normal">
              <CalendarDays className="h-4 w-4" /> Events
            </CardTitle>
            <CardDescription>Register, check the schedule, and mark attendance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" render={<Link href="/events" />}>
              Browse events
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 normal-case tracking-normal">
              <UserRound className="h-4 w-4" /> Profile
            </CardTitle>
            <CardDescription>Update your bio, avatar, and linked accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" render={<Link href="/dashboard/profile" />}>
              Edit profile
            </Button>
          </CardContent>
        </Card>

        {isCoordinator && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 normal-case tracking-normal">
                <Plus className="h-4 w-4" /> New event
              </CardTitle>
              <CardDescription>Spin up a workshop, talk, or hackathon.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" render={<Link href="/events/new" />}>
                Create event
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
