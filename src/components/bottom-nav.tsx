"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, CalendarDays, Lightbulb, Map, Repeat2 } from "lucide-react";
import { cn } from "@/lib/utils";

const punkte = [
  { href: "/", label: "Heute", icon: BookOpenText },
  { href: "/woche", label: "Woche", icon: CalendarDays },
  { href: "/wiederholen", label: "Wiederholen", icon: Repeat2 },
  { href: "/plan", label: "Plan", icon: Map },
  { href: "/tipps", label: "Tipps", icon: Lightbulb },
];

const versteckt = ["/pin", "/lektion", "/sonntag"];

export function BottomNav() {
  const pfad = usePathname();
  if (versteckt.some((v) => pfad.startsWith(v))) return null;
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-xl">
        {punkte.map(({ href, label, icon: Icon }) => {
          const aktiv = href === "/" ? pfad === "/" : pfad.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={aktiv ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-0.5 text-[0.72rem] font-medium transition-colors",
                  aktiv ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-full transition-colors duration-200",
                    aktiv && "bg-secondary"
                  )}
                >
                  <Icon className="size-[22px]" strokeWidth={aktiv ? 2.4 : 1.9} aria-hidden="true" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
