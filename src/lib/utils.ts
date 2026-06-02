import type { NivelAlerta } from "@/types";

export interface ColorStyles {
  text: string;
  bg: string;
  border: string;
}

const MESES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

const NIVEL_COLORS: Record<NivelAlerta, ColorStyles> = {
  ok: {
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/50",
    border: "border-green-200 dark:border-green-800",
  },
  atencion: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    border: "border-amber-200 dark:border-amber-800",
  },
  critico: {
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/50",
    border: "border-red-200 dark:border-red-800",
  },
};

const PROGRESO_COLORS = {
  bajo: {
    text: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  medio: {
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  alto: {
    text: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
} satisfies Record<string, ColorStyles>;

export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const absolute = Math.abs(amount);
  const formatted = absolute.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });

  return isNegative ? `- RD$ ${formatted}` : `RD$ ${formatted}`;
}

export function formatMes(mesCode: string): string {
  const [year, month] = mesCode.split("-");
  const monthIndex = Number(month) - 1;

  if (!year || monthIndex < 0 || monthIndex > 11) {
    return mesCode;
  }

  return `${MESES_ES[monthIndex]} ${year}`;
}

export function getColorByNivel(nivel: NivelAlerta): ColorStyles {
  return NIVEL_COLORS[nivel];
}

export function calcularProgreso(actual: number, objetivo: number): number {
  if (objetivo <= 0) {
    return 0;
  }

  const porcentaje = (actual / objetivo) * 100;
  return Math.min(100, Math.max(0, Math.round(porcentaje)));
}

function getProgresoColorStyles(porcentaje: number): ColorStyles {
  const clamped = Math.min(100, Math.max(0, porcentaje));

  if (clamped <= 30) {
    return PROGRESO_COLORS.bajo;
  }
  if (clamped <= 70) {
    return PROGRESO_COLORS.medio;
  }
  return PROGRESO_COLORS.alto;
}

/** Retorna la clase Tailwind de texto según el porcentaje de progreso. */
export function getColorByProgreso(porcentaje: number): string {
  return getProgresoColorStyles(porcentaje).text;
}
