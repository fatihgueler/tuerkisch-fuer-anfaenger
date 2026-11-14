import { cn } from "@/lib/utils";

/** Wochen-Stempel („Mühür“) – eigene Gestaltung. */
export function Muehur({ woche, className, leer }: { woche: number; className?: string; leer?: boolean }) {
  const id = `m-bogen-${woche}`;
  if (leer) {
    return (
      <svg viewBox="0 0 100 100" aria-hidden="true" className={cn("size-16", className)}>
        <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border)" strokeWidth="2.5" strokeDasharray="5 5" />
        <text x="50" y="58" textAnchor="middle" fontSize="24" fill="var(--muted-foreground)" fontFamily="var(--font-fraunces)">
          {woche}
        </text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={`Stempel Woche ${woche}`} className={cn("size-16", className)}>
      <defs>
        <path id={id} d="M50 50 m-33 0 a33 33 0 1 1 66 0 a33 33 0 1 1 -66 0" />
      </defs>
      <g fill="none" stroke="var(--accent)" strokeWidth="3" opacity="0.92">
        <circle cx="50" cy="50" r="45" />
        <circle cx="50" cy="50" r="39" strokeWidth="1.5" />
      </g>
      <text fontSize="10" fontWeight="700" letterSpacing="2.4" fill="var(--accent)" fontFamily="var(--font-figtree)">
        <textPath href={`#${id}`} startOffset="0">
          MÜHÜR · HAFTA {woche} · MÜHÜR ·
        </textPath>
      </text>
      <g transform="translate(50 52)" fill="var(--accent)">
        <path d="M0 14 L0 2" stroke="var(--accent)" strokeWidth="2" />
        <path d="M0 4 C-7 3 -9 -3 -8 -11 C-5 -8 -2 -7 0 -13 C2 -7 5 -8 8 -11 C9 -3 7 3 0 4Z" />
      </g>
    </svg>
  );
}
