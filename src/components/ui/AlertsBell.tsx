"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { clsx } from "clsx";
import { AlertItem } from "@/components/ui/AlertItem";
import { getAlertasActivas } from "@/lib/alertas-utils";
import type { Alerta } from "@/types";

export function AlertsBell() {
  const [abierto, setAbierto] = useState(false);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const activas = getAlertasActivas(alertas);
  const criticas = activas.filter((a) => a.nivel === "critico").length;

  const cargarAlertas = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await fetch("/api/alertas");
      const data = (await response.json()) as {
        ok?: boolean;
        alertas?: Alerta[];
        error?: string;
      };

      if (!response.ok || !data.ok || !data.alertas) {
        throw new Error(data.error ?? "No se pudieron cargar las alertas");
      }

      setAlertas(data.alertas);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar alertas"
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarAlertas();
  }, [cargarAlertas]);

  useEffect(() => {
    function onDataRefresh() {
      void cargarAlertas();
    }
    window.addEventListener("finanzas:data-refresh", onDataRefresh);
    return () => {
      window.removeEventListener("finanzas:data-refresh", onDataRefresh);
    };
  }, [cargarAlertas]);

  useEffect(() => {
    if (!abierto) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(event.target as Node)
      ) {
        setAbierto(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAbierto(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [abierto]);

  function togglePanel() {
    setAbierto((prev) => {
      const next = !prev;
      if (next) {
        void cargarAlertas();
      }
      return next;
    });
  }

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        onClick={togglePanel}
        className={clsx(
          "relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 dark:border-border dark:bg-surface dark:text-foreground dark:hover:bg-surface-muted",
          abierto && "ring-2 ring-primary/25"
        )}
        aria-label={
          activas.length > 0
            ? `Alertas activas (${activas.length})`
            : "Ver alertas"
        }
        aria-expanded={abierto}
        aria-haspopup="dialog"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {activas.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {activas.length > 9 ? "9+" : activas.length}
          </span>
        )}
      </button>

      {abierto && (
        <div
          role="dialog"
          aria-label="Alertas activas"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-border dark:bg-surface"
        >
          <div className="border-b border-gray-200 px-4 py-3 dark:border-border">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-foreground">
                Alertas activas
              </h2>
              {criticas > 0 && (
                <span className="rounded-lg bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
                  {criticas} crítica{criticas !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          <div className="max-h-[min(60dvh,20rem)] overflow-y-auto p-3">
            {cargando && (
              <p className="py-6 text-center text-sm text-gray-500 dark:text-muted">
                Cargando alertas…
              </p>
            )}

            {!cargando && error && (
              <p className="py-4 text-center text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            {!cargando && !error && activas.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-500 dark:text-muted">
                No hay alertas activas. Todo en orden.
              </p>
            )}

            {!cargando && !error && activas.length > 0 && (
              <ul className="space-y-2">
                {activas.map((alerta) => (
                  <li key={alerta.categoria}>
                    <AlertItem alerta={alerta} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
