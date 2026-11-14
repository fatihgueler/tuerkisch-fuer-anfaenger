import { sherin } from "@/config/sherin";

export const LETZTE_WOCHE = 26;
const TAG_MS = 86_400_000;

/** Heutiges Datum in Europe/Berlin als YYYY-MM-DD */
export function heuteISO(jetzt: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(jetzt);
}

export function stundeBerlin(jetzt: Date = new Date()): number {
  return Number(new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", hour: "numeric", hourCycle: "h23" }).format(jetzt));
}

function zuTag(iso: string): number {
  const [j, m, t] = iso.split("-").map(Number);
  return Date.UTC(j, m - 1, t) / TAG_MS;
}
function vonTag(n: number): string {
  return new Date(n * TAG_MS).toISOString().slice(0, 10);
}
export function plusTage(iso: string, n: number): string {
  return vonTag(zuTag(iso) + n);
}
export function tageZwischen(von: string, bis: string): number {
  return zuTag(bis) - zuTag(von);
}

/** Tag: 1 = Montag … 6 = Samstag, 7 = Sonntag */
export type Position = { woche: number; tag: number };

export function positionFuer(iso: string): Position {
  const d = tageZwischen(sherin.startDatum, iso);
  if (d <= 0) return { woche: 0, tag: 6 };
  if (d === 1) return { woche: 0, tag: 7 };
  const k = d - 2;
  const woche = Math.floor(k / 7) + 1;
  if (woche > LETZTE_WOCHE) return { woche: LETZTE_WOCHE, tag: 7 };
  return { woche, tag: (k % 7) + 1 };
}

export function datumFuer(woche: number, tag: number): string {
  if (woche === 0) return plusTage(sherin.startDatum, tag === 7 ? 1 : 0);
  return plusTage(sherin.startDatum, 2 + (woche - 1) * 7 + (tag - 1));
}

/** Montag (bzw. Startsamstag für Woche 0) der Kalenderwoche eines Datums – für den Joker */
export function wochenSchluessel(iso: string): number {
  return positionFuer(iso).woche;
}

export const TAG_NAMEN = ["", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
export const TAG_KURZ = ["", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function datumLesbar(iso: string, mitWochentag = true): string {
  const [j, m, t] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "UTC",
    weekday: mitWochentag ? "long" : undefined,
    day: "numeric",
    month: "long",
  }).format(new Date(Date.UTC(j, m - 1, t)));
}

export function istGeburtstag(iso: string): boolean {
  return iso.slice(5) === sherin.geburtstag;
}
