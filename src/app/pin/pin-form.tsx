"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { pinPruefen } from "./actions";

export function PinForm({ weiter }: { weiter: string }) {
  const [zustand, aktion, laeuft] = useActionState(pinPruefen, {});
  return (
    <form action={aktion} className="space-y-4">
      <input type="hidden" name="weiter" value={weiter} />
      <label htmlFor="pin" className="block text-sm font-medium">
        PIN
      </label>
      <input
        id="pin"
        name="pin"
        type="password"
        inputMode="numeric"
        autoComplete="current-password"
        autoFocus
        required
        aria-invalid={zustand.fehler ? true : undefined}
        aria-describedby={zustand.fehler ? "pin-fehler" : undefined}
        className="h-14 w-full rounded-xl border-2 border-input bg-card px-4 text-center text-2xl tracking-[0.4em] focus:border-primary focus:outline-none"
      />
      {zustand.fehler && (
        <p id="pin-fehler" role="alert" className="text-sm font-medium text-destructive">
          {zustand.fehler}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={laeuft}>
        {laeuft ? "Prüfe …" : "Öffnen"}
      </Button>
    </form>
  );
}
