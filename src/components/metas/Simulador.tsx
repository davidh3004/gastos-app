"use client";

import { useMemo, useState } from "react";
import type { Meta } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { inputBase } from "@/lib/ui-classes";
import {
  addMesesDesdeHoy,
  buildTimelineProyectada,
  calcularMesesProyeccion,
  formatMesAnio,
  getFaltante,
} from "@/lib/metas-utils";

interface SimuladorProps {
  metasAcumuladas: Meta[];
}

const MIN_AHORRO = 500;
const MAX_AHORRO = 15000;
const STEP_AHORRO = 500;

export function Simulador({ metasAcumuladas }: SimuladorProps) {
  const [ahorroMensual, setAhorroMensual] = useState(3000);
  const [metaId, setMetaId] = useState(metasAcumuladas[0]?.id ?? "");

  const metaSeleccionada = useMemo(
    () => metasAcumuladas.find((meta) => meta.id === metaId) ?? null,
    [metasAcumuladas, metaId]
  );

  const resultado = useMemo(() => {
    if (!metaSeleccionada) {
      return null;
    }

    const meses = calcularMesesProyeccion(metaSeleccionada, ahorroMensual);
    const faltante = getFaltante(metaSeleccionada);

    if (faltante <= 0) {
      return {
        meses: 0,
        fechaMeta: new Date(),
        timeline: buildTimelineProyectada(metaSeleccionada, ahorroMensual),
        completada: true,
      };
    }

    if (meses === null) {
      return {
        meses: null,
        fechaMeta: null,
        timeline: [],
        completada: false,
      };
    }

    return {
      meses,
      fechaMeta: addMesesDesdeHoy(meses),
      timeline: buildTimelineProyectada(metaSeleccionada, ahorroMensual),
      completada: false,
    };
  }, [metaSeleccionada, ahorroMensual]);

  if (metasAcumuladas.length === 0) {
    return (
      <p className="text-sm text-gray-600 dark:text-muted">
        Agrega metas de acumulación para usar el simulador.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-foreground">
            ¿Cuánto puedes ahorrar por mes?
          </span>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={MIN_AHORRO}
              max={MAX_AHORRO}
              step={STEP_AHORRO}
              value={ahorroMensual}
              onChange={(e) => setAhorroMensual(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-[#1F4E78] dark:accent-primary"
              aria-label="Ahorro mensual"
            />
            <span className="shrink-0 text-sm font-semibold tabular-nums text-[#1F4E78] dark:text-primary">
              {formatCurrency(ahorroMensual)}
            </span>
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-foreground">
            ¿Para qué meta?
          </span>
          <select
            value={metaId}
            onChange={(e) => setMetaId(e.target.value)}
            className={`${inputBase} cursor-pointer py-2`}
            aria-label="Seleccionar meta"
          >
            {metasAcumuladas.map((meta) => (
              <option key={meta.id} value={meta.id}>
                {meta.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {metaSeleccionada && resultado && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-border dark:bg-surface-muted">
          {resultado.completada ? (
            <p className="text-base font-medium text-green-600 dark:text-green-400">
              ¡Ya alcanzaste esta meta!
            </p>
          ) : resultado.meses === null ? (
            <p className="text-sm text-gray-600 dark:text-muted">
              Ajusta el ahorro mensual a un monto mayor a cero para ver la
              proyección.
            </p>
          ) : (
            <>
              <p className="text-base font-semibold text-gray-900 dark:text-foreground">
                En {resultado.meses === 1 ? "1 mes" : `${resultado.meses} meses`}{" "}
                alcanzas tu meta
              </p>
              {resultado.fechaMeta && (
                <p className="mt-1 text-sm text-gray-600 dark:text-muted">
                  Eso sería en {formatMesAnio(resultado.fechaMeta)}
                </p>
              )}
            </>
          )}

          {resultado.timeline.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-muted-foreground">
                Proyección mes a mes
              </p>
              <ol className="relative flex flex-col gap-0 sm:flex-row sm:items-end sm:justify-between sm:gap-2">
                {resultado.timeline.map((paso, index) => (
                  <li
                    key={`${paso.etiqueta}-${index}`}
                    className="relative flex flex-1 flex-col items-center gap-2 pb-2 sm:pb-0"
                  >
                    {index < resultado.timeline.length - 1 && (
                      <span
                        className="absolute left-1/2 top-3 hidden h-0.5 w-full bg-gray-200 dark:bg-border sm:block"
                        aria-hidden
                      />
                    )}
                    <span
                      className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#1F4E78] bg-white text-[10px] font-bold text-[#1F4E78] dark:border-primary dark:bg-surface dark:text-primary"
                      aria-hidden
                    >
                      {paso.porcentaje}%
                    </span>
                    <div className="text-center">
                      <p className="text-xs font-medium capitalize text-gray-900 dark:text-foreground">
                        {paso.etiqueta}
                      </p>
                      <p className="text-[11px] tabular-nums text-gray-500 dark:text-muted-foreground">
                        {formatCurrency(paso.monto)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
