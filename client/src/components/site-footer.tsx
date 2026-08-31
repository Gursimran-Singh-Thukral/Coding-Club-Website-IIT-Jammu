import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-8xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <span className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Coding Club IIT Jammu" width={28} height={28} className="size-7 object-contain" />
          <span className="font-heading text-sm font-bold tracking-tight">
            Coding Club <span className="font-medium text-muted">/ IIT Jammu</span>
          </span>
        </span>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-xs tracking-widest text-muted uppercase">
          <Link href="/events" className="transition-colors hover:text-accent">
            Events
          </Link>
          <Link href="/team" className="transition-colors hover:text-accent">
            Team
          </Link>
          <Link href="/login" className="transition-colors hover:text-accent">
            Member sign-in
          </Link>
        </nav>
        <p className="font-mono text-xs text-muted">© {new Date().getFullYear()} · Coding Club, IIT Jammu</p>
      </div>
    </footer>
  );
}
