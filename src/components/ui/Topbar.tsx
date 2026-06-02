"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { clsx } from "clsx";
import { AlertsBell } from "@/components/ui/AlertsBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Inicio", match: (p: string) => p === "/" },
  {
    href: "/gastos",
    label: "Gastos",
    match: (p: string) => p.startsWith("/gastos"),
  },
  {
    href: "/metas",
    label: "Metas",
    match: (p: string) => p.startsWith("/metas"),
  },
  {
    href: "/chat",
    label: "Chat IA",
    match: (p: string) => p.startsWith("/chat"),
  },
] as const;

export function Topbar() {
  const pathname = usePathname();

  return (
    <header className="hidden h-14 shrink-0 border-b border-gray-200 bg-white md:block dark:border-border dark:bg-surface">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4 px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-[#1F4E78] dark:text-primary"
        >
          <TrendingUp className="h-5 w-5" aria-hidden />
          <span>Finanzas</span>
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label="Navegación principal">
            <ul className="flex items-center gap-1">
              {NAV_LINKS.map(({ href, label, match }) => {
                const isActive = match(pathname);

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={clsx(
                        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-gray-100 text-[#1F4E78] dark:bg-surface-muted dark:text-primary"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-muted dark:hover:bg-surface-muted dark:hover:text-foreground"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <AlertsBell />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
