import { PinForm } from "./pin-form";
import { IznikBand, Tulpe } from "@/components/iznik";

export default async function PinSeite({ searchParams }: { searchParams: Promise<{ weiter?: string }> }) {
  const { weiter } = await searchParams;
  return (
    <main className="flex min-h-dvh flex-col">
      <IznikBand />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-10">
        <Tulpe className="mb-4 h-12 w-10" />
        <p className="font-hand text-2xl text-accent">Merhaba!</p>
        <h1 className="mb-2 text-3xl font-semibold">Sherin&apos;in Türkçe Defteri</h1>
        <p className="mb-8 text-muted-foreground">Bitte gib deine PIN ein.</p>
        <PinForm weiter={weiter ?? "/"} />
      </div>
    </main>
  );
}
