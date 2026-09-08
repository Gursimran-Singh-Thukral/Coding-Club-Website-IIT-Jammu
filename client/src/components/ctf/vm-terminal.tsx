"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { api, API_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Play, SquareTerminal, StopCircle, Trophy, Radio } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function VmTerminal() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const { isCoordinator, user } = useAuth();
  const [isLivestreaming, setIsLivestreaming] = useState(false);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
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

    // Connect directly to VM runner WebSocket for reliable zero-latency streaming
    const vmBase = (process.env.NEXT_PUBLIC_VM_RUNNER_URL || API_URL || "http://localhost:8080").replace(/\/$/, "");
    const wsBase = vmBase.replace(/^http/, "ws");
    const wsUrl = `${wsBase}/ws/session/${session.id}`;
    
    let isCleanedUp = false;
    let wsInstance: WebSocket | null = null;
    let bootComplete = false;
    let outputBuffer = "";
    let skippedBootMenu = false;
    let pokeInterval: NodeJS.Timeout | null = null;

    const connectWS = () => {
      if (isCleanedUp) return;
      const newWs = new WebSocket(wsUrl);
      wsRef.current = newWs;
      wsInstance = newWs;

      newWs.onopen = () => {
        toast.success("Connected to VM");
        terminal.writeln("\r\n\x1b[32m[System] Connected to VM runtime.\x1b[0m");
        terminal.writeln("\x1b[33m[System] Booting Alpine Linux kernel (waiting for login prompt)...\x1b[0m");
        terminal.focus();
      };

      newWs.onclose = () => {
        if (!isCleanedUp) {
          terminal.writeln("\r\n\x1b[33m[System] Reconnecting to VM console...\x1b[0m");
          setTimeout(connectWS, 1500);
        }
      };

      newWs.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === "vm_output") {
            const chunk = msg.payload || "";
            terminal.write(chunk);
            outputBuffer += chunk;

            // 1. Auto-press enter when ISOLINUX shows "boot:"
            if (!skippedBootMenu && outputBuffer.includes("boot:")) {
              skippedBootMenu = true;
              terminal.writeln("\r\n\x1b[36m[System] Starting kernel...\x1b[0m");
              if (newWs.readyState === WebSocket.OPEN) {
                newWs.send(JSON.stringify({ type: "input", payload: "\r" }));
              }
              // Start a periodic poke to wake getty as soon as the kernel finishes booting
              if (!pokeInterval) {
                pokeInterval = setInterval(() => {
                  if (!bootComplete && newWs.readyState === WebSocket.OPEN) {
                    newWs.send(JSON.stringify({ type: "input", payload: "\r" }));
                  }
                }, 4000);
              }
            }

            // 2. Detect login prompt (only once when booting completes)
            if (!bootComplete && (outputBuffer.includes("login:") || outputBuffer.includes("localhost login") || outputBuffer.includes("Welcome to Alpine"))) {
              bootComplete = true;
              if (pokeInterval) {
                clearInterval(pokeInterval);
                pokeInterval = null;
              }
              terminal.writeln("\r\n\x1b[32m[System] Boot complete! Username: 'root' (press Enter to begin)\x1b[0m\r\n");
            }
          } else if (msg.type === "flag_found") {
            toast.success("Flag accepted!");
          } else if (msg.type === "error") {
            terminal.writeln(`\r\n[ERROR] ${msg.payload}\r\n`);
          }
        } catch (e) {
          // ignore parsing error
        }
      };
    };

    connectWS();

    const dataDisposable = terminal.onData(data => {
      // Allow typing once the boot sequence has started (or after 5s), so user can press enter
      if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
        wsInstance.send(JSON.stringify({ type: "input", payload: data }));
      }
    });

    return () => {
      isCleanedUp = true;
      if (pokeInterval) clearInterval(pokeInterval);
      if (wsInstance) wsInstance.close();
      clearTimeout(fitTimeout);
      resizeObserver.disconnect();
      dataDisposable.dispose();
      terminal.dispose();
      xtermRef.current = null;
      fitAddonRef.current = null;
    };
  }, [session?.id]);

  const startSession = async (challenge: any) => {
    toast.info("Starting VM session…");

    // ── Strategy: call the VM runner DIRECTLY (it sets CORS: *) ──────────────
    // Render's edge proxy has a hard 30 s gateway timeout, so going via the
    // Express proxy (/api/sessions → vm-runner) reliably 504s while QEMU boots.
    // Calling the vm-runner directly skips that proxy layer entirely.
    const vmRunnerBase = (process.env.NEXT_PUBLIC_VM_RUNNER_URL || "http://localhost:8080").replace(/\/$/, "");

    let payload: any = null;

    // 1️⃣ Try direct call to vm-runner (no proxy, no gateway timeout).
    try {
      const res = await fetch(`${vmRunnerBase}/api/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VMRunner-User": user?.email || "guest",
          "X-VMRunner-Role": "user",
        },
        body: JSON.stringify({ challenge_id: challenge.id }),
        signal: AbortSignal.timeout(90_000), // 90 s – enough for QEMU cold start
      });
      if (res.ok) {
        payload = await res.json();
      } else {
        console.warn(`Direct vm-runner POST returned ${res.status}; falling back to proxy.`);
      }
    } catch (directErr) {
      console.warn("Direct vm-runner call failed; falling back to proxy.", directErr);
    }

    // 2️⃣ Fall back to Express proxy (works locally or when Render cold-start is fast)
    if (!payload) {
      try {
        payload = await api.post<any>("/api/sessions", { challenge_id: challenge.id });
      } catch (proxyErr) {
        toast.error("Could not start VM session – the server may be waking up. Please retry in 30 s.");
        console.error("Proxy fallback also failed:", proxyErr);
        return;
      }
    }

    const newSession = payload.session || payload;
    setSession(newSession);
    setSelectedChallenge(challenge);
    // The WebSocket will be connected by the useEffect watching session.id
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
            {isCoordinator && eventId && (
              <Button 
                variant={isLivestreaming ? "destructive" : "secondary"} 
                size="sm" 
                className="h-7 text-xs"
                onClick={async () => {
                  try {
                    if (isLivestreaming) {
                      await api.post(`/api/events/${eventId}/livestream/stop`);
                      setIsLivestreaming(false);
                      toast.success("Livestream stopped");
                    } else {
                      await api.post(`/api/events/${eventId}/livestream/start`, { session_id: session.id });
                      setIsLivestreaming(true);
                      toast.success("Livestream started");
                    }
                  } catch (err) {
                    toast.error("Failed to toggle livestream");
                  }
                }}
              >
                <Radio className="h-3 w-3 mr-1" />
                {isLivestreaming ? "Stop Livestream" : "Start Livestream"}
              </Button>
            )}
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
