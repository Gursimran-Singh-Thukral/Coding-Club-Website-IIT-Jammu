"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogOut, LayoutDashboard, UserRound, CalendarCog, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isManager, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/profile", label: "My Profile", icon: UserRound },
    ...(isManager
      ? [
          { href: "/events", label: "Manage Events", icon: CalendarCog },
          { href: "/dashboard/team", label: "Manage Team", icon: Users },
        ]
      : []),
  ];

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Coding Club IIT Jammu" width={28} height={28} />
            <span className="font-heading text-sm font-semibold tracking-tight">Dashboard</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4 pb-2 sm:px-6">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
