"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/lib/types";

const schema = z.object({
  bio: z.string().max(280, "Keep it under 280 characters").optional().or(z.literal("")),
  avatar_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github_handle: z.string().optional().or(z.literal("")),
  codeforces_handle: z.string().optional().or(z.literal("")),
  leetcode_handle: z.string().optional().or(z.literal("")),
  kaggle_handle: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function ProfileEditForm({ profile }: { profile: Profile | null }) {
  const { refresh } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      bio: profile?.bio ?? "",
      avatar_url: profile?.avatar_url ?? "",
      github_handle: profile?.github_handle ?? "",
      codeforces_handle: profile?.codeforces_handle ?? "",
      leetcode_handle: profile?.leetcode_handle ?? "",
      kaggle_handle: profile?.kaggle_handle ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await api.post("/api/profile", values);
      await refresh();
      toast.success("Profile updated — live stats will refresh shortly.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update profile");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" rows={3} placeholder="What are you building?" {...register("bio")} className="mt-1" />
        {errors.bio && <p className="mt-1 text-xs text-destructive">{errors.bio.message}</p>}
      </div>

      <div>
        <Label htmlFor="avatar_url">Avatar URL</Label>
        <Input id="avatar_url" placeholder="https://…" {...register("avatar_url")} className="mt-1" />
        {errors.avatar_url && <p className="mt-1 text-xs text-destructive">{errors.avatar_url.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="github_handle">GitHub handle</Label>
          <Input id="github_handle" placeholder="octocat" {...register("github_handle")} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="codeforces_handle">Codeforces handle</Label>
          <Input id="codeforces_handle" {...register("codeforces_handle")} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="leetcode_handle">LeetCode handle</Label>
          <Input id="leetcode_handle" {...register("leetcode_handle")} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="kaggle_handle">Kaggle handle</Label>
          <Input id="kaggle_handle" {...register("kaggle_handle")} className="mt-1" />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2 self-start">
        {isSubmitting ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
