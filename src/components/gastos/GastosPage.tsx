import { Suspense } from "react";
import { loadGastosData, getMesesOrdenados } from "@/lib/gastos-data";
import { isTodosMeses } from "@/lib/gastos-data";
import {
  buildCategoriasFilas,
  calcularTotalGastado,
  formatPeriodoGastos,
  getTopCategoria,
} from "@/lib/gastos-utils";
import { formatCurrency } from "@/lib/utils";
import { GastosBarChart } from "@/components/charts/GastosBarChart";
import { MetricCard } from "@/components/ui/MetricCard";
import { MesSelector } from "@/components/gastos/MesSelector";
import { CategoriasTable } from "@/components/gastos/CategoriasTable";
import { TransaccionesTable } from "@/components/gastos/TransaccionesTable";
import { HomeErrorState } from "@/components/home/HomeErrorState";
import { card, pageTitle, sectionTitle, textMuted } from "@/lib/ui-classes";

interface GastosPageProps {
  mesParam?: string;
}

export async function GastosPage({ mesParam }: GastosPageProps) {
  try {
    const data = await loadGastosData(mesParam);
    const meses = getMesesOrdenados(data.mesAMes);
    const periodoLabel = formatPeriodoGastos(data.mes);
    const totalGastado = calcularTotalGastado(data.categoriasMes.categorias);
    const topCategoria = getTopCategoria(data.categoriasMes.categorias);
    const filasCategorias = buildCategoriasFilas(
      data.categoriasMes,
      isTodosMeses(data.mes) ? null : data.categoriasMesAnterior
    );
    const cantidadGastos = data.transacciones.filter(
      (t) => t.tipo === "Gasto"
    ).length;

    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-8">
        <header className="flex flex-col gap-4 px-4 sm:flex-row sm:items-end sm:justify-between md:px-0">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className={pageTitle}>Gastos</h1>
            <p className={`text-sm ${textMuted}`}>
              <span className="font-semibold tabular-nums text-red-600 dark:text-red-400">
                {formatCurrency(totalGastado)}
              </span>
              <span className="mx-1.5 text-gray-300 dark:text-border">·</span>
              <span>{periodoLabel}</span>
            </p>
          </div>
          <Suspense
            fallback={
              <div
                className="h-11 w-44 animate-pulse rounded-lg bg-gray-200 dark:bg-surface-muted"
                aria-hidden
              />
            }
          >
            <MesSelector
              meses={meses}
              mesActual={data.mes}
              mostrarTodos
            />
          </Suspense>
        </header>

        <div className="mx-auto w-full max-w-4xl px-4 md:px-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard
              label="Total gastado"
              value={formatCurrency(totalGastado)}
              sub={periodoLabel}
              className="items-center text-center"
              valueClassName="text-red-600 dark:text-red-400"
            />
            <MetricCard
              label="Mayor categoría"
              value={
                topCategoria
                  ? formatCurrency(topCategoria.total)
                  : formatCurrency(0)
              }
              sub={topCategoria?.nombre ?? "—"}
              className="items-center text-center"
            />
            <MetricCard
              label={isTodosMeses(data.mes) ? "Transacciones" : "Gastos del período"}
              value={String(cantidadGastos)}
              sub={
                isTodosMeses(data.mes)
                  ? "Todos los movimientos de gasto"
                  : `${data.transacciones.length} movimientos en el mes`
              }
              className="items-center text-center"
            />
          </div>
        </div>

        <section className={`mx-4 md:mx-0 ${card}`}>
          <h2 className={`mb-1 ${sectionTitle}`}>Por categoría</h2>
          <p className={`mb-4 text-sm ${textMuted}`}>{periodoLabel}</p>
          <GastosBarChart
            data={[data.categoriasMes]}
            mes={data.mes}
            limite={null}
          />
          <div className="mt-6">
            <CategoriasTable
              filas={filasCategorias}
              mesAnterior={data.mesAnterior}
            />
          </div>
        </section>

        <section className={`mx-4 md:mx-0 ${card}`}>
          <h2 className={`mb-1 ${sectionTitle}`}>Transacciones</h2>
          <p className={`mb-4 text-sm ${textMuted}`}>{periodoLabel}</p>
          {data.transacciones.length === 0 ? (
            <p className={`text-sm ${textMuted}`}>
              No hay gastos registrados en este período.
            </p>
          ) : (
            <TransaccionesTable transacciones={data.transacciones} />
          )}
        </section>
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return (
      <div className="py-4 md:py-8">
        <HomeErrorState message={message} />
      </div>
    );
  }
}
