import { formatMes } from "@/lib/utils";
import type { CategoriaItem, CategoriaMes, Transaccion } from "@/types";

/** Valor de query `?mes=` para ver todos los gastos históricos */
export const TODOS_MESES = "todos";

export interface CategoriaFila {
  nombre: string;
  total: number;
  porcentaje: number;
  totalAnterior: number | null;
  diferencia: number | null;
}

const BADGE_COLORS = [
  {
    text: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/50",
    border: "border-blue-200 dark:border-blue-800",
  },
  {
    text: "text-violet-700 dark:text-violet-300",
    bg: "bg-violet-50 dark:bg-violet-950/50",
    border: "border-violet-200 dark:border-violet-800",
  },
  {
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  {
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    border: "border-amber-200 dark:border-amber-800",
  },
  {
    text: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/50",
    border: "border-rose-200 dark:border-rose-800",
  },
  {
    text: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-50 dark:bg-cyan-950/50",
    border: "border-cyan-200 dark:border-cyan-800",
  },
] as const;

export function getCategoriaBadgeClasses(categoria: string): string {
  let hash = 0;
  for (let i = 0; i < categoria.length; i += 1) {
    hash = (hash + categoria.charCodeAt(i)) % 2147483647;
  }
  const palette = BADGE_COLORS[hash % BADGE_COLORS.length];
  return `${palette.bg} ${palette.text} ${palette.border}`;
}

export function getMontoAbsoluto(transaccion: Transaccion): number {
  return Math.abs(transaccion.monto);
}

export function formatPeriodoGastos(mes: string): string {
  if (mes === TODOS_MESES) {
    return "Todos los gastos";
  }
  return formatMes(mes);
}

export function buildCategoriasMesFromTransacciones(
  mes: string,
  transacciones: Transaccion[]
): CategoriaMes {
  const acumulado = new Map<string, number>();

  for (const t of transacciones) {
    if (t.tipo !== "Gasto") continue;
    const monto = Math.abs(t.monto);
    acumulado.set(t.categoria, (acumulado.get(t.categoria) ?? 0) + monto);
  }

  const categorias = [...acumulado.entries()]
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total);

  return { mes, categorias };
}

export function calcularTotalGastado(categorias: CategoriaItem[]): number {
  return categorias.reduce((sum, item) => sum + Math.abs(item.total), 0);
}

export function getTopCategoria(
  categorias: CategoriaItem[]
): { nombre: string; total: number } | null {
  if (categorias.length === 0) {
    return null;
  }

  const top = [...categorias].sort(
    (a, b) => Math.abs(b.total) - Math.abs(a.total)
  )[0];

  return { nombre: top.nombre, total: Math.abs(top.total) };
}

export function buildCategoriasFilas(
  categoriasMes: CategoriaMes,
  categoriasMesAnterior: CategoriaMes | null
): CategoriaFila[] {
  const total = calcularTotalGastado(categoriasMes.categorias);
  const mapaAnterior = new Map(
    (categoriasMesAnterior?.categorias ?? []).map((item) => [
      item.nombre,
      Math.abs(item.total),
    ])
  );

  return [...categoriasMes.categorias]
    .map((item) => {
      const monto = Math.abs(item.total);
      const totalAnterior = mapaAnterior.get(item.nombre) ?? null;
      const diferencia =
        totalAnterior !== null ? monto - totalAnterior : null;

      return {
        nombre: item.nombre,
        total: monto,
        porcentaje: total > 0 ? Math.round((monto / total) * 100) : 0,
        totalAnterior,
        diferencia,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export function formatFechaTransaccion(fecha: string): string {
  // Date-only strings (YYYY-MM-DD) must be parsed as local time, not UTC.
  // new Date("2026-06-02") → UTC midnight → renders as June 1 in UTC-4.
  const soloFecha = fecha.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const parsed = soloFecha
    ? new Date(+soloFecha[1], +soloFecha[2] - 1, +soloFecha[3])
    : new Date(fecha);
  if (Number.isNaN(parsed.getTime())) {
    return fecha;
  }
  return parsed.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Timestamp para ordenar (soporta yyyy-MM-dd y ISO con hora). */
export function parseFechaOrden(fecha: string): number {
  const trimmed = fecha.trim();
  if (!trimmed) return 0;

  const soloFecha = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (soloFecha) {
    return new Date(
      parseInt(soloFecha[1], 10),
      parseInt(soloFecha[2], 10) - 1,
      parseInt(soloFecha[3], 10),
      23,
      59,
      59,
      999
    ).getTime();
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

/** Más reciente primero; mismo día → mayor id (última fila en Sheet). */
export function compararTransaccionesPorFechaReciente(
  a: Transaccion,
  b: Transaccion
): number {
  const dateDiff = parseFechaOrden(b.fecha) - parseFechaOrden(a.fecha);
  if (dateDiff !== 0) return dateDiff;

  const idA = Number.parseInt(String(a.id), 10);
  const idB = Number.parseInt(String(b.id), 10);
  if (!Number.isNaN(idA) && !Number.isNaN(idB)) {
    return idB - idA;
  }

  return String(b.id).localeCompare(String(a.id));
}

