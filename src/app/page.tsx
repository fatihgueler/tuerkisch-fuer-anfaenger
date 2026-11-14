import { SeitenKopf, Seite } from "@/components/seiten-kopf";

export default function Heute() {
  return (
    <>
      <SeitenKopf titel="Merhaba, Sherin" unter="Heute" />
      <Seite>
        <p className="mt-6">Gleich geht&apos;s los.</p>
      </Seite>
    </>
  );
}
