// src/utils/launch.js
import { useEffect, useMemo, useState } from "react";

/** ONE SOURCE OF TRUTH for launch time (UTC) */
export const SALE_START_ISO = "2025-10-04T15:00:00Z";

/** Simple countdown hook that always ticks once per second */
export function useCountdown(targetIso = SALE_START_ISO) {
  const target = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    finished: diff <= 0,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/** Generate an ICS calendar reminder for Wave 1 and trigger a download. */
export function downloadSaleReminder({
  title = "Golden Cowrie Token $GCT — First Wave",
  details = "The tide rises. Follow in-app for live details.",
  startIso = SALE_START_ISO,
  durationMinutes = 60,
  filename = "7goldencowries-wave1.ics",
}) {
  if (typeof window === "undefined") return;
  const start = new Date(startIso);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const format = (d) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const escapeText = (text) =>
    String(text || "").replace(/\n/g, "\\n").replace(/[;,]/g, (m) => `\\${m}`);
  const now = new Date();
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//7GoldenCowries//Token Sale//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${format(start)}@7goldencowries.com`,
    `DTSTAMP:${format(now)}`,
    `DTSTART:${format(start)}`,
    `DTEND:${format(end)}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Share/invite with Web Share API, fall back to clipboard */
export async function inviteFriend({
  url = window.location.origin + "/token-sale",
  title = "Golden Cowrie Token — First Wave",
  text = "Set your sail — $GCT First Wave starts soon. Join me.",
}) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch {
      /* user cancelled; ignore */
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
