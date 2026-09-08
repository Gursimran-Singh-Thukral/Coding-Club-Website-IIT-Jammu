"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import CodeMirror from "@uiw/react-codemirror";
import type { Extension } from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { acceptCompletion } from "@codemirror/autocomplete";
import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { ArrowLeft, Save, ShieldAlert, ImagePlus, Loader2, Play } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { buildSandboxedPreview } from "@/lib/sandbox-preview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { EventSubmission, ClubEvent, WorkspaceType } from "@/lib/types";

// CodeMirror's default completion keymap only accepts the selected suggestion
// on Enter - this adds Tab as a second accept key (VS Code-style). Falls
// through to normal Tab-indent behavior when no completion popup is open,
// since acceptCompletion returns false in that case. Must be Prec.highest:
// @uiw/react-codemirror wires up its own `indentWithTab` keymap ahead of any
// extensions passed in via the `extensions` prop, and that binding runs
// unconditionally (it doesn't check for an open completion), so at default
// precedence it would always win the race for the Tab key before this does.
const acceptCompletionWithTab = Prec.highest(keymap.of([{ key: "Tab", run: acceptCompletion }]));

const LANGUAGE_EXTENSIONS: Record<string, Extension[]> = {
  html: [html(), acceptCompletionWithTab],
  css: [css(), acceptCompletionWithTab],
  js: [javascript(), acceptCompletionWithTab],
  cpp: [cpp(), acceptCompletionWithTab],
  python: [python(), acceptCompletionWithTab],
};

type Code = Pick<EventSubmission, "html" | "css" | "js">;

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { loading: authLoading, user } = useAuth();

  const [status, setStatus] = useState<"loading" | "ready" | "blocked" | "error">("loading");
  const [blockedMessage, setBlockedMessage] = useState("");
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType | null>(null);
  const [code, setCode] = useState<Code>({ html: "", css: "", js: "" });
  const [pane, setPane] = useState<"html" | "css" | "js">("html");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Self-reported integrity signals - shown to judges alongside the score.
  // Client-side only: a determined student can defeat this via devtools, so
  // treat it as a soft signal, not a security boundary.
  const tabSwitches = useRef(0);
  const pasteAttempts = useRef(0);

  useEffect(() => {
    if (authLoading || !user) return;
    
    api.get<{ data: ClubEvent[] }>("/api/events")
      .then(res => {
        const ev = res.data.find(e => e.id === id);
        if (ev) setWorkspaceType(ev.workspace_type);
      }).catch(() => {});

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

  const runCode = async () => {
    if (workspaceType !== "cpp" && workspaceType !== "python") return;
    setIsRunning(true);
    setOutput("Executing...");
    
    const language = workspaceType === "cpp" ? "c++" : "python";
    const version = workspaceType === "cpp" ? "10.2.0" : "3.10.0";
    
    try {
      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          version,
          files: [{ name: workspaceType === "cpp" ? "main.cpp" : "main.py", content: code.html }],
          stdin: "",
          args: [],
          compile_timeout: 10000,
          run_timeout: 3000,
          compile_memory_limit: -1,
          run_memory_limit: -1
        })
      });
      
      const data = await res.json();
      if (data.run?.output) {
        setOutput(data.run.output);
      } else if (data.compile?.output) {
        setOutput("Compilation Error:\n" + data.compile.output);
      } else {
        setOutput(data.message || "Unknown error occurred.");
      }
    } catch (err) {
      setOutput("Failed to reach execution API.");
    } finally {
      setIsRunning(false);
    }
  };

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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post<{ url: string }>(`/api/events/${id}/workspace/upload`, formData);
      
      // Copy URL to clipboard
      await navigator.clipboard.writeText(res.url);
      toast.success("Image uploaded! URL copied to clipboard.", {
        description: "You can now use it in your HTML: <img src=\"...\" />",
        duration: 5000,
      });
      
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
        <span className="text-xs text-muted-foreground ml-auto">
          {saving ? "Saving…" : savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}` : "Not saved yet"}
        </span>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp, image/gif"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />} 
            Upload Image
          </Button>
          <Button size="sm" onClick={handleManualSave} disabled={saving}>
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
        {(workspaceType === "cpp" || workspaceType === "python") ? (
          <>
            <div
              className="flex flex-col overflow-hidden border-b border-border lg:border-r lg:border-b-0"
              onPasteCapture={blockPaste}
              onCutCapture={blockPaste}
              onContextMenu={(e) => e.preventDefault()}
            >
              <div className="bg-muted px-4 py-2 text-sm font-medium border-b flex justify-between">
                <span>{workspaceType === "cpp" ? "C++" : "Python"} Editor</span>
              </div>
              <div className="flex flex-1 flex-col relative w-full h-full">
                <CodeMirror
                  value={code.html}
                  height="100%"
                  theme={oneDark}
                  extensions={LANGUAGE_EXTENSIONS[workspaceType]}
                  onChange={(value) => updateCode("html", value)}
                  className="flex-1 overflow-auto text-sm"
                  basicSetup={{ lineNumbers: true, highlightActiveLineGutter: true }}
                />
                <div className="h-1/3 border-t bg-[#1e1e1e] text-green-400 p-4 overflow-auto font-mono text-sm relative shrink-0">
                   <div className="absolute top-2 right-2 flex gap-2">
                     <Button size="sm" onClick={runCode} disabled={isRunning} variant="secondary">
                       <Play className="h-3.5 w-3.5 mr-2" /> Run
                     </Button>
                   </div>
                   <pre className="mt-6 whitespace-pre-wrap">{output || "Output will appear here..."}</pre>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center bg-muted/30 border-l border-border text-muted-foreground p-8 text-center">
              <div>
                <p className="font-semibold text-lg">Execution Environment</p>
                <p className="mt-2 text-sm">Your code runs on Piston. Terminal output is displayed in the panel below the editor.</p>
              </div>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
