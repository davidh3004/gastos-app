import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { clsx } from "clsx";
import { formatCurrency } from "@/lib/utils";
import type { CategoriaFila } from "@/lib/gastos-utils";
import { textMuted } from "@/lib/ui-classes";

interface CategoriasTableProps {
  filas: CategoriaFila[];
  mesAnterior: string | null;
}

export function CategoriasTable({ filas, mesAnterior }: CategoriasTableProps) {
  if (filas.length === 0) {
    return (
      <p className={`text-sm ${textMuted}`}>
        Sin categorías de gasto para este mes.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-border">
            <th className="py-2 pr-4 font-medium text-gray-600 dark:text-muted">
              Categoría
            </th>
            <th className="py-2 pr-4 text-right font-medium text-gray-600 dark:text-muted">
              Monto
            </th>
            <th className="py-2 pr-4 text-right font-medium text-gray-600 dark:text-muted">
              % del total
            </th>
            <th className="py-2 text-right font-medium text-gray-600 dark:text-muted">
              {mesAnterior ? "vs mes anterior" : "Comparativa"}
            </th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr
              key={fila.nombre}
              className="border-b border-gray-100 last:border-0 dark:border-border/60"
            >
              <td className="py-3 pr-4 font-medium text-gray-900 dark:text-foreground">
                {fila.nombre}
              </td>
              <td className="py-3 pr-4 text-right tabular-nums text-gray-900 dark:text-foreground">
                {formatCurrency(fila.total)}
              </td>
              <td className="py-3 pr-4 text-right tabular-nums text-gray-600 dark:text-muted">
                {fila.porcentaje}%
              </td>
              <td className="py-3 text-right">
                <ComparativaCelda
                  diferencia={fila.diferencia}
                  tieneMesAnterior={mesAnterior !== null}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComparativaCelda({
  diferencia,
  tieneMesAnterior,
}: {
  diferencia: number | null;
  tieneMesAnterior: boolean;
}) {
  if (!tieneMesAnterior) {
    return (
      <span className="text-gray-400 dark:text-muted-foreground">—</span>
    );
  }

  if (diferencia === null) {
    return (
      <span
        className={clsx(
          "inline-flex items-center justify-end gap-1 text-xs font-medium",
          "text-gray-500 dark:text-muted-foreground"
        )}
      >
        <Minus className="h-3.5 w-3.5" aria-hidden />
        Nueva
      </span>
    );
  }

  if (diferencia === 0) {
    return (
      <span className="text-gray-500 dark:text-muted-foreground tabular-nums">
        Sin cambio
      </span>
    );
  }

  const subio = diferencia > 0;

  return (
    <span
      className={clsx(
        "inline-flex items-center justify-end gap-1 font-medium tabular-nums",
        subio
          ? "text-red-600 dark:text-red-400"
          : "text-green-600 dark:text-green-400"
      )}
    >
      {subio ? (
        <ArrowUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
      ) : (
        <ArrowDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
      )}
      {formatCurrency(Math.abs(diferencia))}
    </span>
  );
}
