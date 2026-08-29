"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { SessionUser } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleSuccess(credentialResponse: CredentialResponse) {
    setError(null);
    if (!credentialResponse.credential) return;

    try {
      const res = await api.post<{ status: string; user: SessionUser }>("/api/auth/google", {
        credential: credentialResponse.credential,
      });
      setUser(res.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign-in failed. Please try again.");
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="mb-10 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to home
      </Link>

      <div className="panel flex w-full max-w-sm flex-col items-center gap-6 rounded-md p-8 text-center">
        <Image src="/logo.png" alt="Coding Club IIT Jammu" width={48} height={48} />
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">Sign in to the club</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Use your @iitjammu.ac.in Google account.</p>
        </div>

        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError("Sign-in failed. Please try again.")}
          theme="outline"
          shape="rectangular"
        />

        {error && (
          <Alert variant="destructive" className="text-left">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
