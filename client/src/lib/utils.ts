import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatEventTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function getEventStatus(event: { event_date: string; event_end: string | null }): "past" | "live" | "upcoming" {
  const now = Date.now()
  const start = new Date(event.event_date).getTime()
  // Events without an end time (legacy rows) are treated as instantaneous.
  const end = event.event_end ? new Date(event.event_end).getTime() : start

  if (now < start) return "upcoming"
  if (now > end) return "past"
  return "live"
}

export function formatEventTimeRange(event: { event_date: string; event_end: string | null }) {
  if (!event.event_end) return formatEventTime(event.event_date)
  return `${formatEventTime(event.event_date)} – ${formatEventTime(event.event_end)}`
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function describeUserAgent(ua: string | null) {
  if (!ua) return "Unknown device";

  let browser = "Unknown browser";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/chrome\//i.test(ua)) browser = "Chrome";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/safari\//i.test(ua)) browser = "Safari";

  let os = "Unknown OS";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/iphone|ipad/i.test(ua)) os = "iOS";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/linux/i.test(ua)) os = "Linux";

  return `${browser} on ${os}`;
}

export function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
