"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart, Plus, Target, type LucideIcon } from "lucide-react";
import { clsx } from "clsx";

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
}[] = [
  { href: "/", label: "Inicio", icon: Home, match: (p) => p === "/" },
  {
    href: "/gastos",
    label: "Gastos",
    icon: PieChart,
    match: (p) => p.startsWith("/gastos"),
  },
  {
    href: "/metas",
    label: "Metas",
    icon: Target,
    match: (p) => p.startsWith("/metas"),
  },
  {
    href: "/agregar",
    label: "Agregar",
    icon: Plus,
    match: (p) => p.startsWith("/agregar"),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white md:hidden dark:border-border dark:bg-surface"
      aria-label="Navegación principal"
    >
      <ul className="flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const isActive = match ? match(pathname) : pathname === href;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={clsx(
                  "flex flex-col items-center gap-0.5 px-2 py-2.5 text-xs font-medium transition-colors",
                  isActive
                    ? "text-[#1F4E78] dark:text-primary"
                    : "text-gray-500 dark:text-muted"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
