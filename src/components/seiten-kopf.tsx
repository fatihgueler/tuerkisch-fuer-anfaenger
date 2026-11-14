import Link from "next/link";
import { Settings } from "lucide-react";
import { IznikBand } from "@/components/iznik";

export function SeitenKopf({ titel, unter }: { titel: React.ReactNode; unter?: React.ReactNode }) {
  return (
    <header className="relative">
      <IznikBand />
      <div className="mx-auto flex max-w-xl items-start justify-between gap-3 px-4 pt-5" style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}>
        <div className="min-w-0">
          {unter && <p className="text-sm font-medium text-muted-foreground">{unter}</p>}
          <h1 className="text-[1.9rem] leading-tight font-semibold text-balance">{titel}</h1>
        </div>
        <Link
          href="/einstellungen"
          aria-label="Einstellungen"
          className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Settings className="size-6" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}

export function Seite({ children }: { children: React.ReactNode }) {
  return <main className="pb-nav mx-auto w-full max-w-xl px-4">{children}</main>;
}
