"use client";

import { useEffect } from "react";

/** Einmalige Aufgaben beim Start: dauerhaften Speicher anfragen. */
export function AppStart() {
  useEffect(() => {
    navigator.storage?.persist?.().catch(() => {});
  }, []);
  return null;
}
