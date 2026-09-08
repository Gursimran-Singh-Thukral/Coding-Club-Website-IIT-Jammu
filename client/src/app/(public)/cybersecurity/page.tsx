import { Suspense } from "react";
import { VmTerminal } from "@/components/ctf/vm-terminal-wrapper";

export const metadata = { title: "Cybersecurity · Coding Club IIT Jammu" };

export default function CybersecurityPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 flex flex-col h-[calc(100vh-4rem)]">
      <div>
        <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{"// cybersecurity"}</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight">VM Runner CTFs</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Launch a dedicated virtual machine to solve these challenges.
        </p>
      </div>

      <div className="mt-8 flex-1 border rounded-lg overflow-hidden bg-background flex">
        <Suspense fallback={<div className="p-8">Loading Terminal...</div>}>
          <VmTerminal />
        </Suspense>
      </div>
    </div>
  );
}
