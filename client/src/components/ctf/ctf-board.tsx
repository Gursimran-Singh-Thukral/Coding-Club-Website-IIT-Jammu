"use client";

import { useState, useEffect } from "react";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flag, ExternalLink, CheckCircle } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  target_url?: string;
  created_at: string;
}

export function CtfBoard({ eventId }: { eventId: string }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [solved, setSolved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api.get<{ data: Challenge[] }>(`/api/events/${eventId}/ctf/challenges`)
      .then(res => {
        setChallenges(res.data);
      })
      .catch(err => {
        toast.error("Failed to load challenges");
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  async function handleSubmit(challengeId: string) {
    const flag = flags[challengeId];
    if (!flag) return;

    setSubmitting(challengeId);
    try {
      await api.post(`/api/events/${eventId}/ctf/challenges/${challengeId}/submit`, { flag });
      toast.success("Flag correct! Points awarded.");
      setSolved(prev => ({ ...prev, [challengeId]: true }));
      setFlags(prev => ({ ...prev, [challengeId]: "" }));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Incorrect flag.");
    } finally {
      setSubmitting(null);
    }
  }

  if (loading) return null;
  if (challenges.length === 0) return (
    <Card>
      <CardContent className="py-10 text-center text-muted-foreground text-sm">
        No challenges have been posted yet.
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {challenges.map(challenge => (
        <Card key={challenge.id} className={solved[challenge.id] ? "border-green-500 bg-green-50/50 dark:bg-green-950/20" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              <div className="font-mono text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
                {challenge.points} pts
              </div>
            </div>
            {challenge.target_url && (
              <CardDescription>
                <a href={challenge.target_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline mt-1">
                  Target <ExternalLink className="h-3 w-3" />
                </a>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{challenge.description}</p>
            {solved[challenge.id] ? (
              <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                <CheckCircle className="h-4 w-4" /> Solved
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="flag{...}"
                  value={flags[challenge.id] || ""}
                  onChange={e => setFlags({ ...flags, [challenge.id]: e.target.value })}
                  className="font-mono"
                />
                <Button 
                  onClick={() => handleSubmit(challenge.id)}
                  disabled={submitting === challenge.id || !flags[challenge.id]}
                >
                  <Flag className="h-4 w-4 mr-2" /> Submit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
