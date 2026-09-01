import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { GoogleAuthProvider } from "@/components/google-auth-provider";
import { AuthProvider } from "@/lib/auth-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Coding Club · IIT Jammu",
  description:
    "The builders, breakers, and problem-solvers of IIT Jammu. Ship real software, compete, and learn in the open.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        "dark h-full antialiased",
        inter.variable,
        spaceGrotesk.variable,
        jetbrainsMono.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col bg-background">
        <GoogleAuthProvider>
          <AuthProvider>
            <TooltipProvider delay={150}>
              {children}
              <Toaster position="bottom-right" />
            </TooltipProvider>
          </AuthProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
