import { cn } from "@/lib/utils";

/** Eigene İznik-inspirierte Kachel: Rosette mit vier Tulpenblättern,
 *  Viertelbögen in den Ecken, die sich zu einem Netz verbinden. */
export function IznikBand({ className, id = "iznik" }: { className?: string; id?: string }) {
  return (
    <svg aria-hidden="true" className={cn("block h-6 w-full", className)} preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="48" height="24" patternUnits="userSpaceOnUse">
          <rect width="48" height="24" fill="var(--primary)" />
          {/* Bögen */}
          <path d="M0 24 A12 12 0 0 1 24 24 A12 12 0 0 1 48 24" fill="none" stroke="var(--background)" strokeWidth="1.4" opacity=".55" />
          <path d="M-12 0 A12 12 0 0 0 12 0 A12 12 0 0 0 36 0 A12 12 0 0 0 60 0" fill="none" stroke="var(--background)" strokeWidth="1.4" opacity=".55" />
          {/* Rosette */}
          <g transform="translate(24 12)">
            <path d="M0 -8 C3 -5 3 -2 0 0 C-3 -2 -3 -5 0 -8Z" fill="var(--background)" />
            <path d="M0 8 C3 5 3 2 0 0 C-3 2 -3 5 0 8Z" fill="var(--background)" />
            <path d="M-8 0 C-5 3 -2 3 0 0 C-2 -3 -5 -3 -8 0Z" fill="var(--background)" opacity=".85" />
            <path d="M8 0 C5 3 2 3 0 0 C2 -3 5 -3 8 0Z" fill="var(--background)" opacity=".85" />
            <circle r="2.2" fill="var(--accent)" />
          </g>
          {/* Saffran-Punkte zwischen den Rosetten */}
          <circle cx="0" cy="12" r="1.8" fill="var(--safran)" />
          <circle cx="48" cy="12" r="1.8" fill="var(--safran)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/** Kleine Tulpe als Zierelement */
export function Tulpe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" aria-hidden="true" className={cn("h-6 w-5", className)}>
      <path d="M12 31 C12 24 12 20 12 16" stroke="var(--primary)" strokeWidth="1.6" fill="none" />
      <path d="M12 24 C8 22 6 19 6 16 C9 17 11 19 12 22" fill="var(--primary)" opacity=".7" />
      <path d="M12 16 C6 15 4 10 5 3 C8 6 10 7 12 2 C14 7 16 6 19 3 C20 10 18 15 12 16Z" fill="var(--accent)" />
      <path d="M12 16 C10 12 10 7 12 2 C14 7 14 12 12 16Z" fill="var(--background)" opacity=".25" />
    </svg>
  );
}
