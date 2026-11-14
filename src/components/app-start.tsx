"use client";

import { useEffect } from "react";
import { setzeGrundTempo } from "@/lib/speech";
import { useFortschritt } from "@/store/fortschritt";

/** Einmalige Aufgaben beim Start: dauerhaften Speicher anfragen, Theme & Tempo anwenden. */
export function AppStart() {
  const theme = useFortschritt((s) => s.einstellungen.theme);
  const tempo = useFortschritt((s) => s.einstellungen.tempo);

  useEffect(() => {
    navigator.storage?.persist?.().catch(() => {});
  }, []);

  useEffect(() => setzeGrundTempo(tempo), [tempo]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const anwenden = () => {
      const dunkel = theme === "dunkel" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dunkel);
    };
    anwenden();
    mq.addEventListener("change", anwenden);
    return () => mq.removeEventListener("change", anwenden);
  }, [theme]);

  return null;
}
