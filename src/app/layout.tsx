import type { Metadata, Viewport } from "next";
import { Caveat, Figtree, Fraunces } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";
import { AppStart } from "@/components/app-start";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin", "latin-ext"], display: "swap" });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin", "latin-ext"], display: "swap" });

export const metadata: Metadata = {
  title: "Sherin'in Türkçesi",
  description: "Sherins persönliches Türkisch-Notizbuch",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  appleWebApp: { capable: true, title: "Türkçe", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f766e" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1d22" },
  ],
};

// Setzt das Theme vor dem ersten Zeichnen (kein Aufblitzen).
const themeSkript = `try{var s=JSON.parse(localStorage.getItem('sherin-turkce-v1')||'{}');var t=s&&s.state&&s.state.einstellungen&&s.state.einstellungen.theme||'system';var d=t==='dunkel'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" suppressHydrationWarning className={`${fraunces.variable} ${figtree.variable} ${caveat.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeSkript }} />
      </head>
      <body>
        <AppStart />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
