import type { Meta, ResumenMes } from "@/types";
import { calcularProgreso, formatCurrency } from "@/lib/utils";

export type EstadoMetaBadge = "sin_iniciar" | "atencion" | "en_camino";

const MESES_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

export function formatFechaLimite(fecha: string): string {
  const soloFecha = fecha.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const parsed = soloFecha
    ? new Date(+soloFecha[1], +soloFecha[2] - 1, +soloFecha[3])
    : new Date(fecha);
  if (Number.isNaN(parsed.getTime())) {
    return fecha;
  }
  return parsed.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getFaltante(meta: Meta): number {
  return Math.max(0, meta.objetivo - meta.actual);
}

export function calcularMesesProyeccion(
  meta: Meta,
  ahorroMensual: number
): number | null {
  const faltante = getFaltante(meta);
  if (faltante <= 0) {
    return 0;
  }
  if (ahorroMensual <= 0) {
    return null;
  }
  return Math.ceil(faltante / ahorroMensual);
}

export function addMesesDesdeHoy(cantidadMeses: number): Date {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() + cantidadMeses);
  return fecha;
}

export function formatMesAnio(fecha: Date): string {
  const mes = MESES_ES[fecha.getMonth()];
  const anio = fecha.getFullYear();
  return `${mes} ${anio}`;
}

export function getEstadoMeta(
  meta: Meta,
  ahorroMensual: number
): EstadoMetaBadge {
  const porcentaje = calcularProgreso(meta.actual, meta.objetivo);

  if (meta.actual <= 0 || porcentaje === 0) {
    return "sin_iniciar";
  }

  if (porcentaje < 50) {
    return "atencion";
  }

  const mesesProyeccion = calcularMesesProyeccion(meta, ahorroMensual);
  const _lf = meta.fecha_limite.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const limite = _lf
    ? new Date(+_lf[1], +_lf[2] - 1, +_lf[3])
    : new Date(meta.fecha_limite);

  if (
    !Number.isNaN(limite.getTime()) &&
    mesesProyeccion !== null &&
    mesesProyeccion > 0
  ) {
    const hoy = new Date();
    const mesesHastaLimite =
      (limite.getFullYear() - hoy.getFullYear()) * 12 +
      (limite.getMonth() - hoy.getMonth());

    if (mesesProyeccion > mesesHastaLimite) {
      return "atencion";
    }
  }

  return porcentaje >= 50 ? "en_camino" : "atencion";
}

export const ESTADO_META_LABELS: Record<EstadoMetaBadge, string> = {
  sin_iniciar: "Sin iniciar",
  atencion: "Atención",
  en_camino: "En camino",
};

export const ESTADO_META_STYLES: Record<
  EstadoMetaBadge,
  { text: string; bg: string; border: string }
> = {
  sin_iniciar: {
    text: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-900/50",
    border: "border-gray-200 dark:border-gray-700",
  },
  atencion: {
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    border: "border-amber-200 dark:border-amber-800",
  },
  en_camino: {
    text: "text-green-700 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/50",
    border: "border-green-200 dark:border-green-800",
  },
};

export function getTextoProyeccion(
  meta: Meta,
  ahorroMensual: number
): string {
  const faltante = getFaltante(meta);
  if (faltante <= 0) {
    return "¡Meta alcanzada!";
  }

  const meses = calcularMesesProyeccion(meta, ahorroMensual);
  if (meses === null) {
    return "Con tu flujo neto actual no hay ahorro mensual para proyectar.";
  }

  if (meses === 0) {
    return "¡Meta alcanzada!";
  }

  const etiqueta = meses === 1 ? "1 mes" : `${meses} meses`;
  return `A tu ritmo actual de ahorro, lo logras en ${etiqueta}`;
}

export function esMetaPorcentaje(meta: Meta): boolean {
  return (
    meta.objetivo > 0 &&
    meta.objetivo <= 100 &&
    /ahorro|tasa|%/i.test(meta.nombre)
  );
}

export function getValorRecurrenteDisplay(
  meta: Meta,
  resumen: ResumenMes
): { actual: string; objetivo: string } {
  if (esMetaPorcentaje(meta)) {
    return {
      actual: `${resumen.tasa_ahorro}% actual`,
      objetivo: `${meta.objetivo}% meta`,
    };
  }

  return {
    actual: formatCurrency(meta.actual),
    objetivo: formatCurrency(meta.objetivo),
  };
}

export function getProgresoRecurrente(
  meta: Meta,
  resumen: ResumenMes
): { actual: number; objetivo: number } {
  if (esMetaPorcentaje(meta)) {
    return { actual: resumen.tasa_ahorro, objetivo: meta.objetivo };
  }
  return { actual: meta.actual, objetivo: meta.objetivo };
}

export function getRecomendacionRecurrente(
  meta: Meta,
  resumen: ResumenMes
): string {
  if (esMetaPorcentaje(meta)) {
    const diff = meta.objetivo - resumen.tasa_ahorro;
    if (diff <= 0) {
      return "¡Vas por buen camino! Mantén este ritmo de ahorro.";
    }
    const extra = Math.round(resumen.ingresos * (diff / 100));
    return `Necesitas ahorrar ${formatCurrency(extra)} más por mes para llegar al ${meta.objetivo}%`;
  }

  const faltante = getFaltante(meta);
  if (faltante <= 0) {
    return "¡Meta cumplida! Sigue con el mismo hábito.";
  }

  return `Te faltan ${formatCurrency(faltante)} para alcanzar el objetivo de esta meta.`;
}

export interface TimelinePaso {
  etiqueta: string;
  monto: number;
  porcentaje: number;
}

export function buildTimelineProyectada(
  meta: Meta,
  ahorroMensual: number,
  maxPasos = 8
): TimelinePaso[] {
  const faltante = getFaltante(meta);
  if (faltante <= 0 || ahorroMensual <= 0) {
    return [];
  }

  const mesesTotales = calcularMesesProyeccion(meta, ahorroMensual) ?? 0;
  if (mesesTotales <= 0) {
    return [];
  }

  const pasosTimeline: TimelinePaso[] = [
    {
      etiqueta: "Hoy",
      monto: meta.actual,
      porcentaje: calcularProgreso(meta.actual, meta.objetivo),
    },
  ];

  const cantidadIntermedios = Math.min(maxPasos - 2, mesesTotales);
  const intervalo = Math.max(
    1,
    Math.ceil(mesesTotales / Math.max(cantidadIntermedios, 1))
  );

  for (
    let mes = intervalo;
    mes < mesesTotales && pasosTimeline.length < maxPasos - 1;
    mes += intervalo
  ) {
    const acumulado = Math.min(
      meta.objetivo,
      meta.actual + ahorroMensual * mes
    );
    pasosTimeline.push({
      etiqueta: formatMesAnio(addMesesDesdeHoy(mes)),
      monto: acumulado,
      porcentaje: calcularProgreso(acumulado, meta.objetivo),
    });
  }

  pasosTimeline.push({
    etiqueta: formatMesAnio(addMesesDesdeHoy(mesesTotales)),
    monto: meta.objetivo,
    porcentaje: 100,
  });

  return pasosTimeline;
}
