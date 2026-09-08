"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { useAuth } from "@/lib/auth-context";
import { buildSandboxedPreview } from "@/lib/sandbox-preview";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Play, Terminal as TerminalIcon, ArrowLeft } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { API_URL, api } from "@/lib/api";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import type { ClubEvent, WorkspaceType } from "@/lib/types";

type ViewMode = "split" | "instructor" | "sandbox";
type WebCode = { html: string; css: string; js: string };

export function LiveWorkshopEnvironment() {
  const { id } = useParams<{ id: string }>();
  const { isCoordinator, user } = useAuth();
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  
  // State for Web Sandbox
  const [instructorWeb, setInstructorWeb] = useState<WebCode>({ html: "", css: "", js: "" });
  const [studentWeb, setStudentWeb] = useState<WebCode>({ html: "", css: "", js: "" });
  const [webPane, setWebPane] = useState<"html" | "css" | "js">("html");

  // State for C++/Python
  const [instructorText, setInstructorText] = useState<string>("");
  const [studentText, setStudentText] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch workspace type
    api.get<{ data: ClubEvent[] }>("/api/events")
      .then(res => {
        const ev = res.data.find(e => e.id === id);
        if (ev) setWorkspaceType(ev.workspace_type);
      });

    // Setup socket
    const socket = io(API_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-workshop", id);
    });

    socket.on("live-code-update", (data: any) => {
      if (!isCoordinator) {
        if (data.type === "web") setInstructorWeb(data.code);
        if (data.type === "text") setInstructorText(data.code);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, isCoordinator]);

  // Cybersec Terminal Mock Initialization
  useEffect(() => {
    if (workspaceType === "cybersec" && terminalRef.current) {
      const term = new Terminal({ theme: { background: '#1e1e1e' } });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();
      term.writeln('Welcome to the Cybersecurity VM Workspace.');
      term.writeln('Connecting to remote environment...');
      setTimeout(() => {
        term.writeln('Connected. (Mock Terminal)');
        term.write('user@cybersec-vm:~$ ');
      }, 1000);

      term.onData(e => {
        if (e === '\r') {
          term.writeln('');
          term.write('user@cybersec-vm:~$ ');
        } else if (e === '\u007F') {
          term.write('\b \b');
        } else {
          term.write(e);
        }
      });
      return () => term.dispose();
    }
  }, [workspaceType]);

  const handleWebChange = (val: string, isInstructor: boolean) => {
    if (isInstructor && isCoordinator) {
      const next = { ...instructorWeb, [webPane]: val };
      setInstructorWeb(next);
      socketRef.current?.emit("live-code-update", { eventId: id, type: "web", code: next });
    } else if (!isInstructor) {
      setStudentWeb(prev => ({ ...prev, [webPane]: val }));
    }
  };

  const handleTextChange = (val: string, isInstructor: boolean) => {
    if (isInstructor && isCoordinator) {
      setInstructorText(val);
      socketRef.current?.emit("live-code-update", { eventId: id, type: "text", code: val });
    } else if (!isInstructor) {
      setStudentText(val);
    }
  };

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
          files: [{ name: workspaceType === "cpp" ? "main.cpp" : "main.py", content: studentText }],
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

  if (!workspaceType) return <div className="p-8">Loading workspace...</div>;

  const showInstructor = viewMode === "split" || viewMode === "instructor";
  const showStudent = viewMode === "split" || viewMode === "sandbox";
  
  // Render Builders
  
  const renderWebPane = (isInstructor: boolean) => {
    const code = isInstructor ? instructorWeb : studentWeb;
    const srcDoc = buildSandboxedPreview(code);
    return (
      <div className="flex flex-1 flex-col relative w-full h-full">
        <CodeMirror
          value={code[webPane]}
          onChange={(val) => handleWebChange(val, isInstructor)}
          extensions={[
            webPane === "html" ? html() : webPane === "css" ? css() : javascript()
          ]}
          theme={oneDark}
          readOnly={isInstructor && !isCoordinator}
          className="flex-1 overflow-auto text-sm"
          height="100%"
          basicSetup={{ lineNumbers: true, highlightActiveLineGutter: true }}
        />
        <div className="h-1/2 border-t bg-white">
          <iframe title="Preview" srcDoc={srcDoc} className="h-full w-full bg-white" sandbox="allow-scripts" />
        </div>
      </div>
    );
  };

  const renderTextPane = (isInstructor: boolean) => {
    const code = isInstructor ? instructorText : studentText;
    const langExt = workspaceType === "cpp" ? cpp() : python();
    return (
      <div className="flex flex-1 flex-col relative w-full h-full">
        <CodeMirror
          value={code}
          onChange={(val) => handleTextChange(val, isInstructor)}
          extensions={[langExt]}
          theme={oneDark}
          readOnly={isInstructor && !isCoordinator}
          className="flex-1 overflow-auto text-sm"
          height="100%"
          basicSetup={{ lineNumbers: true, highlightActiveLineGutter: true }}
        />
        {!isInstructor && (
          <div className="h-1/3 border-t bg-[#1e1e1e] text-green-400 p-4 overflow-auto font-mono text-sm relative">
             <div className="absolute top-2 right-2 flex gap-2">
               <Button size="sm" onClick={runCode} disabled={isRunning} variant="secondary">
                 <Play className="h-3.5 w-3.5 mr-2" /> Run
               </Button>
             </div>
             <pre className="mt-6 whitespace-pre-wrap">{output || "Output will appear here..."}</pre>
          </div>
        )}
      </div>
    );
  };

  if (workspaceType === "cybersec") {
    return (
      <div className="flex h-screen flex-col bg-background text-foreground">
        <header className="flex h-14 items-center border-b px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => window.location.href = `/events/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold flex items-center gap-2"><TerminalIcon className="h-5 w-5" /> Cybersecurity Environment</h1>
        </header>
        <div className="flex-1 bg-[#1e1e1e] p-4">
           <div ref={terminalRef} className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => window.location.href = `/events/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold capitalize">Live Workshop: {workspaceType}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {(workspaceType === "web" || workspaceType === "gamedev") && (
            <Tabs value={webPane} onValueChange={(v) => setWebPane(v as any)}>
              <TabsList>
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="js">JS</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {!isCoordinator && (
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="View Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="split">Split Screen</SelectItem>
                <SelectItem value="instructor">Instructor Only</SelectItem>
                <SelectItem value="sandbox">My Sandbox Only</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {showInstructor && (
          <div className={`flex flex-col border-r ${showStudent && !isCoordinator ? 'w-1/2' : 'w-full'}`}>
            <div className="bg-muted px-4 py-2 text-sm font-medium border-b flex justify-between">
              <span>Instructor's Screen {isCoordinator && "(You)"}</span>
            </div>
            {(workspaceType === "web" || workspaceType === "gamedev") ? renderWebPane(true) : renderTextPane(true)}
          </div>
        )}

        {showStudent && !isCoordinator && (
          <div className={`flex flex-col ${showInstructor ? 'w-1/2' : 'w-full'}`}>
            <div className="bg-muted px-4 py-2 text-sm font-medium border-b flex justify-between">
              <span>My Sandbox</span>
            </div>
            {(workspaceType === "web" || workspaceType === "gamedev") ? renderWebPane(false) : renderTextPane(false)}
          </div>
        )}
      </div>
    </div>
  );
}
