"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, RadioTower } from "lucide-react";
import { useLiveTotp } from "@/lib/totp";
import { api, ApiError } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LiveCodeDisplay({ eventId }: { eventId: string }) {
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enlarged, setEnlarged] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get<{ status: string; data: { totp_secret: string } }>(`/api/events/${eventId}/secret`)
      .then((res) => setSecret(res.data.totp_secret))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load the attendance code."));
  }, [eventId]);

  const { code, remaining, period } = useLiveTotp(secret, eventId);

  const exitEnlarged = useCallback(() => {
    setEnlarged(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  // Requests real (OS-level) fullscreen once the overlay has actually
  // mounted. If the browser blocks it, the full-viewport overlay still
  // works on its own - fullscreen is a bonus, not a requirement.
  useEffect(() => {
    if (enlarged && overlayRef.current && !document.fullscreenElement) {
      overlayRef.current.requestFullscreen?.().catch(() => {});
    }
  }, [enlarged]);

  useEffect(() => {
    function handleFullscreenChange() {
      if (!document.fullscreenElement) setEnlarged(false);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!enlarged) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") exitEnlarged();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [enlarged, exitEnlarged]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RadioTower className="h-4 w-4" /> Live attendance code
          </CardTitle>
          <CardDescription>
            Project this screen. It rotates every {period}s straight from the event&apos;s secret — a screenshot goes
            stale before it can be shared.
          </CardDescription>
          {code && (
            <CardAction>
              <Button variant="outline" size="icon-sm" onClick={() => setEnlarged(true)} aria-label="Enlarge">
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </CardAction>
          )}
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          {code ? (
            <>
              <p className="font-mono text-6xl font-bold tracking-[0.3em]">{code}</p>
              <p className="text-xs text-muted-foreground">resets in {remaining}s</p>
            </>
          ) : (
            <Skeleton className="h-24 w-56" />
          )}
        </CardContent>
      </Card>

      {enlarged && (
        <div
          ref={overlayRef}
          className="rules fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-background p-8"
        >
          <Button
            variant="outline"
            size="icon"
            className="absolute top-6 right-6"
            onClick={exitEnlarged}
            aria-label="Exit enlarged view"
          >
            <Minimize2 />
          </Button>
          <p className="font-mono text-sm tracking-widest text-primary uppercase">Live attendance code</p>
          <p className="font-mono text-[4.5rem] leading-none font-bold tracking-[0.12em] sm:text-[7rem] lg:text-[9rem]">
            {code}
          </p>
          <div className="flex w-full max-w-md flex-col items-center gap-2">
            <div className="h-2 w-full overflow-hidden rounded-md bg-surface-2">
              <div
                className="h-full rounded-md bg-primary transition-[width] duration-1000 ease-linear"
                style={{ width: `${(remaining / period) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">resets in {remaining}s</p>
          </div>
        </div>
      )}
    </>
  );
}
