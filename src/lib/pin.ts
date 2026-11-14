export const PIN_COOKIE = "sherin_zugang";

/** SHA-256 Hex – funktioniert in Edge-Middleware und Node. */
export async function pinHash(pin: string): Promise<string> {
  const daten = new TextEncoder().encode(`sherin-turkce:${pin}`);
  const hash = await crypto.subtle.digest("SHA-256", daten);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
