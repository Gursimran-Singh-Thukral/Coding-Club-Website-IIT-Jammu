"use client";

import dynamic from "next/dynamic";

export const VmTerminal = dynamic(
  () => import("@/components/ctf/vm-terminal").then(mod => mod.VmTerminal),
  { ssr: false }
);
