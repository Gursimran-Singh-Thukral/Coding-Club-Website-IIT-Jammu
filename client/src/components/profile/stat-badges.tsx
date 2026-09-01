import { Star, Trophy, Code2 } from "lucide-react";
import { GithubIcon } from "@/components/icons";
import type { ProfileStats } from "@/lib/types";

export function StatBadges({ stats }: { stats: ProfileStats | undefined | null }) {
  if (!stats) return null;

  const items: { icon: React.ReactNode; label: string }[] = [];

  if (stats.github_repos !== undefined) {
    items.push({ icon: <GithubIcon className="h-3.5 w-3.5" />, label: `${stats.github_repos} repos` });
  }
  if (stats.github_followers !== undefined) {
    items.push({ icon: <Star className="h-3.5 w-3.5" />, label: `${stats.github_followers} followers` });
  }
  if (stats.codeforces_rating !== undefined) {
    items.push({
      icon: <Trophy className="h-3.5 w-3.5" />,
      label: `CF ${stats.codeforces_rating}${stats.codeforces_rank ? ` · ${stats.codeforces_rank}` : ""}`,
    });
  }
  if (stats.leetcode_solved !== undefined) {
    items.push({ icon: <Code2 className="h-3.5 w-3.5" />, label: `${stats.leetcode_solved} solved` });
  }

  if (!items.length) return null;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {item.icon}
          {item.label}
        </span>
      ))}
    </div>
  );
}
