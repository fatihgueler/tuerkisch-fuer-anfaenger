"use client";

const ZEICHEN = ["ç", "ş", "ğ", "ı", "İ", "ö", "ü"];

/** Leiste über Tippfeldern – fügt das Zeichen an der Cursorposition ein. */
export function SonderzeichenLeiste({
  ziel,
  onEinfuegen,
}: {
  ziel: React.RefObject<HTMLInputElement | null>;
  onEinfuegen: (neu: string) => void;
}) {
  return (
    <div role="group" aria-label="Türkische Sonderzeichen" className="flex flex-wrap gap-1.5">
      {ZEICHEN.map((z) => (
        <button
          key={z}
          type="button"
          // verhindert, dass das Eingabefeld den Fokus verliert (Tastatur bleibt offen)
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => {
            const el = ziel.current;
            if (!el) return;
            const start = el.selectionStart ?? el.value.length;
            const ende = el.selectionEnd ?? el.value.length;
            const neu = el.value.slice(0, start) + z + el.value.slice(ende);
            onEinfuegen(neu);
            requestAnimationFrame(() => {
              el.focus();
              el.setSelectionRange(start + 1, start + 1);
            });
          }}
          className="min-h-11 min-w-11 rounded-lg border-2 border-border bg-card font-serif text-xl hover:bg-secondary active:bg-secondary"
        >
          {z}
        </button>
      ))}
    </div>
  );
}
