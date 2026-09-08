"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Trophy, Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaderboardEntry {
  student_id: string;
  full_name: string;
  score: number;
}

export function CtfLeaderboard({ eventId }: { eventId: string }) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Poll leaderboard every 30 seconds
  useEffect(() => {
    function fetchLeaderboard() {
      api.get<{ data: LeaderboardEntry[] }>(`/api/events/${eventId}/ctf/leaderboard`)
        .then(res => setLeaderboard(res.data))
        .finally(() => setLoading(false));
    }
    
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  if (loading || leaderboard.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" /> Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <div key={entry.student_id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? "bg-yellow-100 text-yellow-700" :
                  index === 1 ? "bg-gray-200 text-gray-700" :
                  index === 2 ? "bg-orange-100 text-orange-700" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {index < 3 ? <Medal className="h-4 w-4" /> : `#${index + 1}`}
                </div>
                <span className="font-medium">{entry.full_name}</span>
              </div>
              <span className="font-mono font-semibold">{entry.score} pts</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
