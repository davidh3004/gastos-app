import type { Meta, ResumenMes } from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  getProgresoRecurrente,
  getRecomendacionRecurrente,
  getValorRecurrenteDisplay,
} from "@/lib/metas-utils";
import { textMuted } from "@/lib/ui-classes";

interface MetasRecurrentesListProps {
  metas: Meta[];
  resumen: ResumenMes;
}

export function MetasRecurrentesList({
  metas,
  resumen,
}: MetasRecurrentesListProps) {
  if (metas.length === 0) {
    return (
      <p className={`text-sm ${textMuted}`}>
        No tienes metas recurrentes configuradas.
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {metas.map((meta) => {
        const display = getValorRecurrenteDisplay(meta, resumen);
        const progreso = getProgresoRecurrente(meta, resumen);

        return (
          <li
            key={meta.id}
            className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-border dark:bg-surface-muted"
          >
            <h3 className="font-semibold text-gray-900 dark:text-foreground">
              {meta.nombre}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-muted">
              {display.actual} vs {display.objetivo}
            </p>
            <div className="mt-4">
              <ProgressBar
                label="Avance"
                actual={progreso.actual}
                objetivo={progreso.objetivo}
              />
            </div>
            <p className="mt-3 text-sm text-gray-700 dark:text-foreground">
              {getRecomendacionRecurrente(meta, resumen)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
