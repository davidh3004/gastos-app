"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, X } from "lucide-react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import type { ContextoFinanciero } from "@/types/chat";

interface QuickChatPanelProps {
  abierto: boolean;
  onCerrar: () => void;
}

export function QuickChatPanel({ abierto, onCerrar }: QuickChatPanelProps) {
  const [contexto, setContexto] = useState<ContextoFinanciero | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarContexto = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await fetch("/api/chat/context");
      const data = (await response.json()) as {
        ok?: boolean;
        contexto?: ContextoFinanciero;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.contexto) {
        throw new Error(data.error ?? "No se pudo cargar el asistente");
      }

      setContexto(data.contexto);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al iniciar el chat"
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!abierto) return;

    if (!contexto && !cargando && !error) {
      void cargarContexto();
    }
  }, [abierto, contexto, cargando, error, cargarContexto]);

  useEffect(() => {
    if (!abierto) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCerrar();
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [abierto, onCerrar]);

  if (!abierto) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[55] bg-black/40"
        aria-label="Cerrar chat"
        onClick={onCerrar}
      />

      <div
        role="dialog"
        aria-label="Chat rápido"
        className="fixed z-[60] flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-border dark:bg-background bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px)+4rem)] right-4 h-[min(70dvh,32rem)] w-[min(calc(100vw-2rem),24rem)] md:bottom-24"
      >
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-3 py-2.5 dark:border-border">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-gray-900 dark:text-foreground">
              Chat IA
            </h2>
            <p className="text-xs text-gray-500 dark:text-muted-foreground">
              Asistente financiero
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/chat"
              onClick={onCerrar}
              className="flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium text-primary hover:bg-gray-100 dark:hover:bg-surface-muted"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden sm:inline">Pantalla completa</span>
            </Link>
            <button
              type="button"
              onClick={onCerrar}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-muted dark:hover:bg-surface-muted"
              aria-label="Cerrar chat"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          {cargando && (
            <p className="flex flex-1 items-center justify-center text-sm text-gray-500 dark:text-muted">
              Cargando asistente…
            </p>
          )}

          {!cargando && error && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              <button
                type="button"
                onClick={() => void cargarContexto()}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white"
              >
                Reintentar
              </button>
            </div>
          )}

          {!cargando && !error && contexto && (
            <ChatInterface contexto={contexto} embedded />
          )}
        </div>
      </div>
    </>
  );
}
