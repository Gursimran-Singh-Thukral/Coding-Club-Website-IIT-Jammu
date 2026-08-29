"use client";

import { useEffect, useState } from "react";
import { TOTP, Secret } from "otpauth";

const PERIOD = 30;

/** Matches the server's otplib defaults exactly: SHA1 / 6 digits / 30s step. */
function buildTotp(base32Secret: string, label: string) {
  return new TOTP({
    issuer: "Coding Club IIT Jammu",
    label,
    algorithm: "SHA1",
    digits: 6,
    period: PERIOD,
    secret: Secret.fromBase32(base32Secret),
  });
}

function secondsRemaining() {
  const epoch = Math.floor(Date.now() / 1000);
  return PERIOD - (epoch % PERIOD);
}

/** Computes a live, rotating TOTP code straight from the event's secret —
 * the same algorithm the backend uses to validate it, running client-side. */
export function useLiveTotp(secret: string | null, label: string) {
  const [code, setCode] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(secondsRemaining());

  useEffect(() => {
    if (!secret) return;

    let totp: TOTP;
    try {
      totp = buildTotp(secret, label);
    } catch {
      return;
    }

    const tick = () => {
      setCode(totp.generate());
      setRemaining(secondsRemaining());
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [secret, label]);

  return { code, remaining, period: PERIOD };
}
