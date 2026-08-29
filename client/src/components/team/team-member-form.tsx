"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import type { TeamMember } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  title: z.string().min(2, "Title is required"),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  display_order: z
    .string()
    .refine((v) => v === "" || !Number.isNaN(Number(v)), "Must be a number"),
});

type FormValues = z.infer<typeof schema>;

export function TeamMemberForm({
  member,
  onSuccess,
}: {
  member?: TeamMember;
  onSuccess: (member: TeamMember) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: member
      ? {
          name: member.name,
          title: member.title,
          image_url: member.image_url ?? "",
          github: member.github ?? "",
          linkedin: member.linkedin ?? "",
          display_order: String(member.display_order),
        }
      : { display_order: "0" },
  });

  async function onSubmit(values: FormValues) {
    try {
      const payload = { ...values, display_order: values.display_order === "" ? 0 : Number(values.display_order) };
      const res = member
        ? await api.put<{ data: TeamMember }>(`/api/team/${member.id}`, payload)
        : await api.post<{ data: TeamMember }>("/api/team", payload);
      toast.success(member ? "Team member updated" : "Team member added");
      onSuccess(res.data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} className="mt-1" />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="President, Web Dev Lead…" {...register("title")} className="mt-1" />
          {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="image_url">Photo URL</Label>
        <Input id="image_url" placeholder="https://…" {...register("image_url")} className="mt-1" />
        {errors.image_url && <p className="mt-1 text-xs text-destructive">{errors.image_url.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="github">GitHub URL</Label>
          <Input id="github" placeholder="https://github.com/…" {...register("github")} className="mt-1" />
          {errors.github && <p className="mt-1 text-xs text-destructive">{errors.github.message}</p>}
        </div>
        <div>
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input id="linkedin" placeholder="https://linkedin.com/in/…" {...register("linkedin")} className="mt-1" />
          {errors.linkedin && <p className="mt-1 text-xs text-destructive">{errors.linkedin.message}</p>}
        </div>
      </div>

      <div className="max-w-[10rem]">
        <Label htmlFor="display_order">Display order</Label>
        <Input id="display_order" type="number" {...register("display_order")} className="mt-1" />
        <p className="mt-1 text-xs text-muted-foreground">Lower shows first.</p>
      </div>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : member ? "Save changes" : "Add member"}
        </Button>
      </DialogFooter>
    </form>
  );
}
