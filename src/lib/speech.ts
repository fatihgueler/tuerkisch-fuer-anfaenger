"use client";

import { useEffect, useState } from "react";

export const TEMPO_NORMAL = 0.9;
export const TEMPO_LANGSAM = 0.6;

let stimmeCache: SpeechSynthesisVoice | null | undefined;

function stimmen(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices();
}

export function findeTrStimme(): SpeechSynthesisVoice | null {
  const alle = stimmen();
  const tr = alle.filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith("tr"));
  if (!tr.length) return null;
  // Bevorzugt: lokale, nicht-komprimierte Stimme, sonst die erste
  return tr.find((v) => v.localService) ?? tr[0];
}

export type StimmenStatus = "laden" | "ok" | "fehlt" | "nicht-unterstuetzt";

export function useTrStimme(): StimmenStatus {
  const [status, setStatus] = useState<StimmenStatus>("laden");
  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setStatus("nicht-unterstuetzt");
      return;
    }
    const pruefen = () => {
      const s = findeTrStimme();
      stimmeCache = s;
      if (s) setStatus("ok");
      else if (stimmen().length) setStatus("fehlt");
    };
    pruefen();
    window.speechSynthesis.addEventListener("voiceschanged", pruefen);
    const t = setTimeout(() => {
      pruefen();
      setStatus((alt) => (alt === "laden" ? "fehlt" : alt));
    }, 2500);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pruefen);
      clearTimeout(t);
    };
  }, []);
  return status;
}

let grundTempo = TEMPO_NORMAL;
export function setzeGrundTempo(t: number) {
  grundTempo = t;
}

export function stopp() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

/** Spricht Türkisch. Löst auf, wenn fertig (oder abgebrochen). */
export function sprich(text: string, opt: { langsam?: boolean; tonhoehe?: number; abbrechen?: boolean } = {}): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve();
    const synth = window.speechSynthesis;
    if (opt.abbrechen !== false) synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/…/g, ", "));
    const stimme = stimmeCache ?? findeTrStimme();
    if (stimme) u.voice = stimme;
    u.lang = stimme?.lang ?? "tr-TR";
    u.rate = opt.langsam ? TEMPO_LANGSAM : grundTempo;
    u.pitch = opt.tonhoehe ?? 1;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    synth.speak(u);
    // iOS-Safari pausiert manchmal still – Sicherheitsnetz
    setTimeout(resolve, 2000 + text.length * 180);
  });
}
