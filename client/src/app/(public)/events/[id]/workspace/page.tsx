"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import CodeMirror from "@uiw/react-codemirror";
import type { Extension } from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { buildSandboxedPreview } from "@/lib/sandbox-preview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { EventSubmission } from "@/lib/types";

const LANGUAGE_EXTENSIONS: Record<"html" | "css" | "js", Extension[]> = {
  html: [html()],
  css: [css()],
  js: [javascript()],
};

type Code = Pick<EventSubmission, "html" | "css" | "js">;

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { loading: authLoading, user } = useAuth();

  const [status, setStatus] = useState<"loading" | "ready" | "blocked" | "error">("loading");
  const [blockedMessage, setBlockedMessage] = useState("");
  const [code, setCode] = useState<Code>({ html: "", css: "", js: "" });
  const [pane, setPane] = useState<"html" | "css" | "js">("html");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Self-reported integrity signals - shown to judges alongside the score.
  // Client-side only: a determined student can defeat this via devtools, so
  // treat it as a soft signal, not a security boundary.
  const tabSwitches = useRef(0);
  const pasteAttempts = useRef(0);

  useEffect(() => {
    if (authLoading || !user) return;
    api
      .get<{ data: EventSubmission }>(`/api/events/${id}/submission`)
      .then((res) => {
        setCode({ html: res.data.html, css: res.data.css, js: res.data.js });
        setSavedAt(res.data.updated_at);
        setStatus("ready");
      })
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
          setBlockedMessage(err.message);
          setStatus("blocked");
        } else {
          setStatus("error");
        }
      });
  }, [id, authLoading, user]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "hidden") tabSwitches.current += 1;
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const save = useCallback(
    async (next: Code) => {
      setSaving(true);
      try {
        const res = await api.put<{ data: EventSubmission }>(`/api/events/${id}/submission`, {
          ...next,
          tab_switch_count: tabSwitches.current,
          paste_attempt_count: pasteAttempts.current,
        });
        setSavedAt(res.data.updated_at);
      } catch {
        // Silent - autosave failures shouldn't interrupt typing; the manual Save button surfaces errors.
      } finally {
        setSaving(false);
      }
    },
    [id]
  );

  function updateCode(field: "html" | "css" | "js", value: string) {
    const next = { ...code, [field]: value };
    setCode(next);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => save(next), 3000);
  }

  async function handleManualSave() {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    try {
      setSaving(true);
      const res = await api.put<{ data: EventSubmission }>(`/api/events/${id}/submission`, {
        ...code,
        tab_switch_count: tabSwitches.current,
        paste_attempt_count: pasteAttempts.current,
      });
      setSavedAt(res.data.updated_at);
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function blockPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    e.stopPropagation();
    pasteAttempts.current += 1;
    toast.error("Paste is disabled in the workspace - type your own code.");
  }

  if (authLoading || status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Skeleton className="h-[70vh] w-full" />
      </div>
    );
  }

  if (status === "blocked" || status === "error") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>{status === "blocked" ? blockedMessage : "Something went wrong loading your workspace."}</AlertDescription>
        </Alert>
        <Button className="mt-6" render={<Link href={`/events/${id}`} />}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to event
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
        <Button variant="outline" size="sm" render={<Link href={`/events/${id}`} />}>
          <ArrowLeft className="h-3.5 w-3.5" /> Event
        </Button>
        <span className="text-xs text-muted-foreground">
          {saving ? "Saving…" : savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}` : "Not saved yet"}
        </span>
        <Button size="sm" onClick={handleManualSave} disabled={saving}>
          <Save className="h-3.5 w-3.5" /> Save
        </Button>
      </div>

      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
        <div
          className="flex flex-col overflow-hidden border-b border-border lg:border-r lg:border-b-0"
          onPasteCapture={blockPaste}
          onCutCapture={blockPaste}
          onContextMenu={(e) => e.preventDefault()}
        >
          <Tabs value={pane} onValueChange={(v) => setPane(v as "html" | "css" | "js")}>
            <TabsList className="mx-4 mt-3 w-fit">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="js">JS</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex-1 overflow-auto">
            <CodeMirror
              value={code[pane]}
              height="100%"
              theme={oneDark}
              extensions={LANGUAGE_EXTENSIONS[pane]}
              onChange={(value) => updateCode(pane, value)}
              className="h-full text-sm"
            />
          </div>
        </div>

        <iframe
          title="Preview"
          sandbox="allow-scripts"
          srcDoc={buildSandboxedPreview(code)}
          className="h-full w-full bg-white"
        />
      </div>
    </div>
  );
}
