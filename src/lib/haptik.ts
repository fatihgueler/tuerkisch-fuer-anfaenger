/** Kurzes Vibrieren (Android). iOS-Safari ignoriert das still. */
export function fuehlen(art: "richtig" | "falsch" | "tipp" = "tipp") {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const muster = { richtig: [18], falsch: [30, 60, 30], tipp: [8] }[art];
  try {
    navigator.vibrate(muster);
  } catch {
    /* egal */
  }
}
