"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PIN_COOKIE, pinHash } from "@/lib/pin";

export async function pinPruefen(_vorher: { fehler?: string }, form: FormData): Promise<{ fehler?: string }> {
  const soll = process.env.APP_PIN;
  const eingabe = String(form.get("pin") ?? "").trim();
  const weiter = String(form.get("weiter") ?? "/");
  if (soll && eingabe !== soll) {
    await new Promise((r) => setTimeout(r, 600));
    return { fehler: "Die PIN stimmt nicht. Versuch es noch einmal." };
  }
  if (soll) {
    (await cookies()).set(PIN_COOKIE, await pinHash(soll), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 180,
      path: "/",
    });
  }
  redirect(weiter.startsWith("/") && !weiter.startsWith("//") ? weiter : "/");
}
