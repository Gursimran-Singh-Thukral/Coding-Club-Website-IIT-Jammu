"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { api, API_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Play, SquareTerminal, StopCircle, Trophy } from "lucide-react";

export function VmTerminal() {
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [ctfs, setCtfs] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [flagInput, setFlagInput] = useState("");
  
  // Load CTFs
  useEffect(() => {
    // Note: since our proxy handles /api/ctfs, we fetch directly there
    api.get<any[]>("/api/ctfs")
      .then(data => {
        if (Array.isArray(data)) {
            setCtfs(data);
        }
      })
      .catch(err => {
        console.error("Failed to load CTFs", err);
        toast.error("Failed to load VM Challenges");
      });
  }, []);

  // Initialize Terminal when a session is active
  useEffect(() => {
    if (!session || !terminalContainerRef.current) return;

    const terminal = new Terminal({
      cursorBlink: true,
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: 14,
      theme: {
        background: '#0a0a0a',
        foreground: '#f3f4f6'
      }
    });
    
    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    terminal.loadAddon(fitAddon);
    
    terminal.open(terminalContainerRef.current);
    
    const safeFit = () => {
      try {
        if (terminal.element && terminalContainerRef.current && terminalContainerRef.current.clientWidth > 0) {
          fitAddon.fit();
        }
      } catch (e) {
        console.warn("xterm fit error", e);
      }
    };
    
    const fitTimeout = setTimeout(safeFit, 100);

    const resizeObserver = new ResizeObserver(() => {
      safeFit();
    });
    resizeObserver.observe(terminalContainerRef.current);

    xtermRef.current = terminal;

    // Connect WebSocket AFTER terminal is ready
    const wsProtocol = API_URL.startsWith("https") ? "wss:" : "ws:";
    const wsHost = API_URL.replace(/^https?:\/\//, "");
    const wsUrl = `${wsProtocol}//${wsHost}/ws/session/${session.id}`;
    
    const newWs = new WebSocket(wsUrl);
    wsRef.current = newWs;
    setWs(newWs);

    newWs.onopen = () => {
      toast.success("Connected to VM");
      terminal.clear();
      terminal.writeln("Connected to VM runtime environment.");
      terminal.writeln("\x1b[33m[System] The VM is booting. This may take 30-60 seconds.\x1b[0m");
      terminal.writeln("\x1b[33m[System] Note: The screen may go blank during boot. Please wait for the login prompt!\x1b[0m");
      terminal.focus();
    };

    newWs.onclose = () => {
      terminal.writeln("\r\n\x1b[31m[System] Connection to VM lost or closed.\x1b[0m");
    };

    let bootComplete = false;
    let outputBuffer = "";
    let skippedBootMenu = false;

    newWs.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.type === "vm_output") {
        terminal.write(msg.payload || "");
        if (!bootComplete) {
          outputBuffer += msg.payload || "";
          
          // Auto-skip the ISOLINUX bootloader delay (saves ~45s)
          if (!skippedBootMenu && outputBuffer.includes("boot:")) {
            skippedBootMenu = true;
            if (newWs.readyState === WebSocket.OPEN) {
              newWs.send(JSON.stringify({ type: "input", payload: "\r" }));
            }
          }
          
          if (outputBuffer.includes("login:")) {
            bootComplete = true;
            terminal.writeln("\r\n\x1b[32m[System] Boot complete! Type 'root' and press Enter to log in.\x1b[0m");
          }
        }
      } else if (msg.type === "flag_found") {
        toast.success("Flag accepted!");
      } else if (msg.type === "error") {
        terminal.writeln(`\r\n[ERROR] ${msg.payload}\r\n`);
      }
    };

    const dataDisposable = terminal.onData(data => {
      if (!bootComplete) {
        return; // Ignore input while booting to prevent halting ISOLINUX
      }
      if (newWs.readyState === WebSocket.OPEN) {
        newWs.send(JSON.stringify({ type: "input", payload: data }));
      }
    });

    return () => {
      newWs.close();
      clearTimeout(fitTimeout);
      resizeObserver.disconnect();
      dataDisposable.dispose();
      terminal.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [session?.id]);

  const startSession = async (challenge: any) => {
    try {
      toast.info("Starting VM session...");
      const payload = await api.post<any>("/api/sessions", { challenge_id: challenge.id });
      
      const newSession = payload.session || payload;
      setSession(newSession);
      setSelectedChallenge(challenge);
      
      // The WebSocket will be connected by the useEffect
    } catch (err) {
      toast.error("Error starting VM session.");
      console.error(err);
    }
  };

  const stopSession = async () => {
    if (!session) return;
    try {
      // Cleanup is handled by the useEffect and session=null
      setSession(null);
      toast.success("Session stopped.");
    } catch (err) {
      toast.error("Failed to stop session.");
    }
  };

  const submitFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !flagInput.trim()) return;
    
    try {
      const data = await api.post<any>(`/api/sessions/${session.id}/submit-answer`, { answer: flagInput });
      if (data && data.is_correct) {
        toast.success("Correct Flag! Challenge solved.");
        setFlagInput("");
      } else {
        toast.error(data.error || "Incorrect flag.");
      }
    } catch (err) {
      toast.error("Error submitting flag.");
    }
  };

  return (
    <div className="flex w-full h-full">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b font-semibold flex items-center gap-2">
          <SquareTerminal className="h-4 w-4" />
          Challenges
        </div>
        <div className="flex-1 overflow-auto p-2">
          {ctfs.map(ctf => (
            <div key={ctf.id} className="mb-4">
              <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {ctf.title}
              </h3>
              {ctf.challenges?.map((ch: any) => (
                <button
                  key={ch.id}
                  onClick={() => startSession(ch)}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between ${selectedChallenge?.id === ch.id ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"}`}
                >
                  <span className="truncate">{ch.title}</span>
                  {selectedChallenge?.id === ch.id && session && <Play className="h-3 w-3 text-green-500 animate-pulse" />}
                </button>
              ))}
            </div>
          ))}
          {ctfs.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No VM Challenges found.
            </div>
          )}
        </div>
      </div>
      
      {/* Main Terminal Area */}
      <div className="flex-1 flex flex-col relative min-h-0 bg-black">
        {session && (
          <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 text-zinc-300">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm">{selectedChallenge?.title}</span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs">Running</span>
            </div>
            <div className="flex items-center gap-4">
              <form onSubmit={submitFlag} className="flex items-center gap-2">
                <Input 
                  value={flagInput} 
                  onChange={e => setFlagInput(e.target.value)} 
                  placeholder="flag{...}" 
                  className="h-8 w-48 bg-zinc-950 border-zinc-700 text-sm focus-visible:ring-1 focus-visible:ring-zinc-500" 
                />
                <Button type="submit" size="sm" variant="secondary" className="h-8">
                  <Trophy className="h-3 w-3 mr-1" /> Submit
                </Button>
              </form>
              <Button size="sm" variant="destructive" onClick={stopSession} className="h-8">
                <StopCircle className="h-4 w-4 mr-1" /> Stop VM
              </Button>
            </div>
          </div>
        )}
          
          <div className="flex-1 min-h-0 relative">
            {!session ? (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500 flex-col gap-4 z-10 bg-[#0a0a0a]">
                <SquareTerminal className="h-12 w-12 opacity-20" />
                <p>Select a challenge to start the VM</p>
              </div>
            ) : (
              <div ref={terminalContainerRef} className="absolute inset-0 p-2" />
            )}
          </div>
      </div>
    </div>
  );
}
