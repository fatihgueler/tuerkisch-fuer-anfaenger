"use client";

import { heuteISO } from "@/lib/datum";
import { backupErstellen, useFortschritt } from "@/store/fortschritt";

export function backupHerunterladen() {
  const s = useFortschritt.getState();
  const heute = heuteISO();
  const blob = new Blob([JSON.stringify(backupErstellen(s), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sherin-turkce-backup-${heute}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  s.hinweisSetzen({ backupAm: heute });
}
