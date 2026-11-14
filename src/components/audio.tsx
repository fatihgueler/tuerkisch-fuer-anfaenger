"use client";

import { useState } from "react";
import { Turtle, Volume2 } from "lucide-react";
import { sprich, useTrStimme } from "@/lib/speech";
import { cn } from "@/lib/utils";

export function AudioKnopf({
  text,
  langsam,
  className,
  label,
  gross,
}: {
  text: string;
  langsam?: boolean;
  className?: string;
  label?: string;
  gross?: boolean;
}) {
  const [spielt, setSpielt] = useState(false);
  const Icon = langsam ? Turtle : Volume2;
  return (
    <button
      type="button"
      aria-label={label ?? (langsam ? `Langsam anhören: ${text}` : `Anhören: ${text}`)}
      onClick={async (e) => {
        e.stopPropagation();
        setSpielt(true);
        await sprich(text, { langsam });
        setSpielt(false);
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150",
        gross ? "size-14" : "size-11",
        spielt ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-primary hover:bg-secondary",
        className
      )}
    >
      <Icon className={gross ? "size-7" : "size-5"} aria-hidden="true" />
    </button>
  );
}

/** Wort/Satz mit Audio + Schildkröte */
export function AudioPaar({ text, gross }: { text: string; gross?: boolean }) {
  return (
    <span className="inline-flex gap-2">
      <AudioKnopf text={text} gross={gross} />
      <AudioKnopf text={text} langsam gross={gross} />
    </span>
  );
}

export function StimmeHinweis({ immer }: { immer?: boolean }) {
  const status = useTrStimme();
  if (status === "ok" && !immer) return null;
  if (status === "laden" && !immer) return null;
  return (
    <div role="note" className="rounded-xl border-2 border-dashed border-safran bg-safran-soft/60 p-4 text-[0.95rem]">
      <p className="mb-2 font-semibold">
        {status === "ok" ? "Türkische Stimme gefunden – alles bereit." : "Keine türkische Stimme gefunden"}
      </p>
      {status !== "ok" && (
        <>
          <p className="mb-2">Damit du die Wörter hören kannst, installiere einmalig eine türkische Stimme:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>iPhone:</strong> Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Türkisch → eine Stimme
              laden (z. B. „Yelda“).
            </li>
            <li>
              <strong>Android:</strong> Einstellungen → Google Sprachausgabe (Text-in-Sprache) → Sprachdaten installieren → Türkisch.
            </li>
          </ul>
          <p className="mt-2 text-muted-foreground">Danach die Seite neu laden.</p>
        </>
      )}
    </div>
  );
}
