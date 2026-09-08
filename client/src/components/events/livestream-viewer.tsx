"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import type { ClubEvent } from "@/lib/types";

export function LivestreamViewer({ event }: { event: ClubEvent }) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!event.livestream_session_id || !terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: false,
      disableStdin: true,
      theme: {
        background: "#000000",
        foreground: "#ffffff",
      },
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    const vmBase = (process.env.NEXT_PUBLIC_VM_RUNNER_URL || "https://vm-runner-61rp.onrender.com").replace(/\/$/, "");
    const wsBase = vmBase.replace(/^http/, "ws");
    const wsUrl = `${wsBase}/ws/session/${event.livestream_session_id}?readonly=true`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "vm_output" && data.payload) {
          term.write(data.payload);
        }
      } catch (err) {
        // ignore
      }
    };

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(terminalRef.current);

    return () => {
      ws.close();
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [event.livestream_session_id]);

  if (!event.livestream_session_id) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
        Admin Livestream
      </h2>
      <div className="rounded-lg border bg-black p-4">
        <div ref={terminalRef} className="h-[400px] w-full overflow-hidden" />
      </div>
    </div>
  );
}
