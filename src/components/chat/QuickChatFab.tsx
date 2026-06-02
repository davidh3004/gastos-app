"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { QuickChatPanel } from "@/components/chat/QuickChatPanel";

export function QuickChatFab() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  if (pathname.startsWith("/chat")) {
    return null;
  }

  return (
    <>
      {!abierto && (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95 bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] right-4 md:bottom-6"
          aria-label="Abrir chat rápido"
        >
          <MessageCircle className="h-6 w-6" aria-hidden />
        </button>
      )}

      <QuickChatPanel abierto={abierto} onCerrar={() => setAbierto(false)} />
    </>
  );
}
