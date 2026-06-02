import { clsx } from "clsx";
import type { Meta } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { card } from "@/lib/ui-classes";
import {
  ESTADO_META_LABELS,
  ESTADO_META_STYLES,
  formatFechaLimite,
  getEstadoMeta,
  getFaltante,
  getTextoProyeccion,
} from "@/lib/metas-utils";

interface MetaAcumuladaCardProps {
  meta: Meta;
  ahorroMensual: number;
}

export function MetaAcumuladaCard({ meta, ahorroMensual }: MetaAcumuladaCardProps) {
  const estado = getEstadoMeta(meta, ahorroMensual);
  const estilos = ESTADO_META_STYLES[estado];
  const faltante = getFaltante(meta);

  return (
    <article className={clsx(card, "flex flex-col gap-4")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-foreground">
          {meta.nombre}
        </h3>
        <span
          className={clsx(
            "rounded-lg border px-2 py-0.5 text-xs font-medium",
            estilos.bg,
            estilos.text,
            estilos.border
          )}
        >
          {ESTADO_META_LABELS[estado]}
        </span>
      </div>

      <ProgressBar
        label="Progreso"
        actual={meta.actual}
        objetivo={meta.objetivo}
        showAmounts
      />

      <p className="text-sm text-gray-500 dark:text-muted-foreground">
        Fecha límite: {formatFechaLimite(meta.fecha_limite)}
      </p>

      {faltante > 0 ? (
        <p className="text-sm text-gray-600 dark:text-muted">
          Te faltan {formatCurrency(faltante)}
        </p>
      ) : (
        <p className="text-sm font-medium text-green-600 dark:text-green-400">
          Meta completada
        </p>
      )}

      <p className="text-sm text-gray-600 dark:text-muted">
        {getTextoProyeccion(meta, ahorroMensual)}
      </p>

      {meta.notas.trim() && (
        <p className="text-xs text-gray-500 dark:text-muted-foreground">
          {meta.notas}
        </p>
      )}
    </article>
  );
}
