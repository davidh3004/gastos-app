"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";
import type { TipoTransaccion, Transaccion } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  compararTransaccionesPorFechaReciente,
  formatFechaTransaccion,
  getCategoriaBadgeClasses,
  getMontoAbsoluto,
} from "@/lib/gastos-utils";
import { inputBase } from "@/lib/ui-classes";

const PAGE_SIZE = 20;

type FiltroTipo = "Todos" | TipoTransaccion;
type OrdenCampo = "fecha" | "monto";

interface TransaccionesTableProps {
  transacciones: Transaccion[];
}

export function TransaccionesTable({ transacciones }: TransaccionesTableProps) {
  const [categoria, setCategoria] = useState<string>("Todas");
  const [tipo, setTipo] = useState<FiltroTipo>("Gasto");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<OrdenCampo>("fecha");
  const [pagina, setPagina] = useState(1);

  const categorias = useMemo(() => {
    const unicas = new Set(transacciones.map((t) => t.categoria));
    return ["Todas", ...Array.from(unicas).sort((a, b) => a.localeCompare(b))];
  }, [transacciones]);

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return transacciones.filter((t) => {
      if (categoria !== "Todas" && t.categoria !== categoria) {
        return false;
      }
      if (tipo !== "Todos" && t.tipo !== tipo) {
        return false;
      }
      if (termino && !t.descripcion.toLowerCase().includes(termino)) {
        return false;
      }
      return true;
    });
  }, [transacciones, categoria, tipo, busqueda]);

  const ordenadas = useMemo(() => {
    const copia = [...filtradas];
    copia.sort((a, b) => {
      if (orden === "monto") {
        const diff = getMontoAbsoluto(b) - getMontoAbsoluto(a);
        if (diff !== 0) return diff;
        return compararTransaccionesPorFechaReciente(a, b);
      }
      return compararTransaccionesPorFechaReciente(a, b);
    });
    return copia;
  }, [filtradas, orden]);

  const totalPaginas = Math.max(1, Math.ceil(ordenadas.length / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = ordenadas.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE
  );

  function resetPagina() {
    setPagina(1);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground">
            Buscar
          </span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              resetPagina();
            }}
            placeholder="Descripción..."
            className={inputBase}
            aria-label="Buscar por descripción"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground">
            Categoría
          </span>
          <select
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value);
              resetPagina();
            }}
            className={`${inputBase} cursor-pointer py-2`}
            aria-label="Filtrar por categoría"
          >
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground">
            Tipo
          </span>
          <select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value as FiltroTipo);
              resetPagina();
            }}
            className={`${inputBase} cursor-pointer py-2`}
            aria-label="Filtrar por tipo"
          >
            <option value="Todos">Todos</option>
            <option value="Ingreso">Ingreso</option>
            <option value="Gasto">Gasto</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-600 dark:text-muted">
          {ordenadas.length} transacción
          {ordenadas.length !== 1 ? "es" : ""}
        </p>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-muted">
          Ordenar por
          <select
            value={orden}
            onChange={(e) => {
              setOrden(e.target.value as OrdenCampo);
              resetPagina();
            }}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900 dark:border-border dark:bg-surface dark:text-foreground"
            aria-label="Ordenar transacciones"
          >
            <option value="fecha">Fecha (más reciente)</option>
            <option value="monto">Monto</option>
          </select>
        </label>
      </div>

      {visibles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-border dark:text-muted-foreground">
          No hay transacciones con estos filtros.
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-border">
                  <th className="py-2 pr-4 font-medium text-gray-600 dark:text-muted">
                    Fecha
                  </th>
                  <th className="py-2 pr-4 font-medium text-gray-600 dark:text-muted">
                    Descripción
                  </th>
                  <th className="py-2 pr-4 font-medium text-gray-600 dark:text-muted">
                    Categoría
                  </th>
                  <th className="py-2 text-right font-medium text-gray-600 dark:text-muted">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((t) => (
                  <TransaccionRow key={t.id} transaccion={t} variant="table" />
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-3 md:hidden">
            {visibles.map((t) => (
              <li key={t.id}>
                <TransaccionRow transaccion={t} variant="card" />
              </li>
            ))}
          </ul>
        </>
      )}

      {ordenadas.length > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-2 border-t border-gray-200 pt-4 dark:border-border">
          <button
            type="button"
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={paginaActual <= 1}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-border dark:text-foreground dark:hover:bg-surface-muted"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600 dark:text-muted">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            type="button"
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual >= totalPaginas}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 dark:border-border dark:text-foreground dark:hover:bg-surface-muted"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

function TransaccionRow({
  transaccion,
  variant,
}: {
  transaccion: Transaccion;
  variant: "table" | "card";
}) {
  const esIngreso = transaccion.tipo === "Ingreso";
  const montoClass = esIngreso
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";
  const badgeClass = getCategoriaBadgeClasses(transaccion.categoria);

  if (variant === "card") {
    return (
      <article className="rounded-xl border border-gray-200 bg-white p-4 dark:border-border dark:bg-surface">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-gray-900 dark:text-foreground">
              {transaccion.descripcion}
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-muted-foreground">
              {formatFechaTransaccion(transaccion.fecha)}
            </p>
          </div>
          <p className={clsx("shrink-0 font-semibold tabular-nums", montoClass)}>
            {formatCurrency(transaccion.monto)}
          </p>
        </div>
        <span
          className={clsx(
            "mt-3 inline-flex rounded-lg border px-2 py-0.5 text-xs font-medium",
            badgeClass
          )}
        >
          {transaccion.categoria}
        </span>
      </article>
    );
  }

  return (
    <tr className="border-b border-gray-100 last:border-0 dark:border-border/60">
      <td className="py-3 pr-4 whitespace-nowrap text-gray-600 dark:text-muted">
        {formatFechaTransaccion(transaccion.fecha)}
      </td>
      <td className="py-3 pr-4 text-gray-900 dark:text-foreground">
        {transaccion.descripcion}
      </td>
      <td className="py-3 pr-4">
        <span
          className={clsx(
            "inline-flex rounded-lg border px-2 py-0.5 text-xs font-medium",
            badgeClass
          )}
        >
          {transaccion.categoria}
        </span>
      </td>
      <td
        className={clsx(
          "py-3 text-right font-medium tabular-nums",
          montoClass
        )}
      >
        {formatCurrency(transaccion.monto)}
      </td>
    </tr>
  );
}
