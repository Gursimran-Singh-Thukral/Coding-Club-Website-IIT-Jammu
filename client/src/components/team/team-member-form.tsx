"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { fileToCompressedDataUrl } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initials } from "@/lib/utils";
import { TEAM_TIERS, TEAM_DOMAINS, type TeamMember, type TeamTier, type TeamDomain } from "@/lib/types";

const DOMAIN_TIERS = new Set<TeamTier>(["Field Specialist", "Team Member"]);

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  title: z.string().min(2, "Title is required"),
  image_url: z.string().optional(),
  github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  display_order: z
    .string()
    .refine((v) => v === "" || !Number.isNaN(Number(v)), "Must be a number"),
  tier: z.enum(["Technical Secretary", "Coordinator", "Field Specialist", "Team Member"]),
  domain: z.enum(["Competitive Programming", "Web Development", "AI/ML", "Game Development", "Cybersecurity"]).nullable(),
}).refine((v) => !DOMAIN_TIERS.has(v.tier) || v.domain !== null, {
  message: "Pick a domain for this tier",
  path: ["domain"],
});

type FormValues = z.infer<typeof schema>;

export function TeamMemberForm({
  member,
  onSuccess,
}: {
  member?: TeamMember;
  onSuccess: (member: TeamMember) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
          tier: member.tier,
          domain: member.domain,
        }
      : { display_order: "0", tier: "Team Member", domain: null },
  });

  const name = watch("name");
  const imageUrl = watch("image_url");
  const tier = watch("tier");
  const needsDomain = DOMAIN_TIERS.has(tier);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setValue("image_url", dataUrl, { shouldDirty: true });
    } catch {
      toast.error("Couldn't process that image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        ...values,
        display_order: values.display_order === "" ? 0 : Number(values.display_order),
        domain: DOMAIN_TIERS.has(values.tier) ? values.domain : null,
      };
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Hierarchy tier</Label>
          <Select value={tier} onValueChange={(v) => setValue("tier", v as TeamTier, { shouldValidate: true })}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEAM_TIERS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-muted-foreground">Controls where they appear on the public team page.</p>
        </div>
        {needsDomain && (
          <div>
            <Label>Domain</Label>
            <Select
              value={watch("domain") ?? ""}
              onValueChange={(v) => setValue("domain", v as TeamDomain, { shouldValidate: true })}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select a domain" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_DOMAINS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.domain && <p className="mt-1 text-xs text-destructive">{errors.domain.message}</p>}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="photo">Photo</Label>
        <div className="mt-1 flex items-center gap-3">
          <Avatar>
            <AvatarImage src={imageUrl || undefined} alt={name || "Preview"} />
            <AvatarFallback className="text-lg">{initials(name || "?")}</AvatarFallback>
          </Avatar>
          <div>
            <Button type="button" variant="outline" size="sm" disabled={uploading} render={<label htmlFor="photo" />}>
              <Upload className="h-3.5 w-3.5" /> {uploading ? "Processing…" : imageUrl ? "Replace photo" : "Upload photo"}
            </Button>
            <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            <p className="mt-1 text-xs text-muted-foreground">Stored directly - resized to a small square automatically.</p>
          </div>
        </div>
        <input type="hidden" {...register("image_url")} />
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
