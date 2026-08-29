"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api, ApiError } from "@/lib/api";

export function CodeEntryForm({ eventId }: { eventId: string }) {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("submitting");
    try {
      await api.post("/api/attendance", { event_id: eventId, code });
      setStatus("success");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-8">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
          <div>
            <p className="font-heading font-semibold">You&apos;re marked present.</p>
            <p className="text-sm text-muted-foreground">Attendance recorded for this event.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 normal-case tracking-normal">
          <ShieldCheck className="h-4 w-4" /> Mark attendance
        </CardTitle>
        <CardDescription>Enter the 6-digit code currently shown on the organizer&apos;s screen.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="code">Attendance code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-1 text-center font-mono text-2xl tracking-[0.5em]"
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={status === "submitting" || code.length !== 6}>
            {status === "submitting" ? "Verifying…" : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
