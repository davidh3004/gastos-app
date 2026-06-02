import type { Alerta, NivelAlerta } from "@/types";
import { formatCurrency, getColorByNivel } from "@/lib/utils";
import {
  Car,
  Gamepad2,
  GraduationCap,
  Heart,
  Home,
  LayoutGrid,
  ShoppingBag,
  Tag,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { clsx } from "clsx";

const NIVEL_LABELS: Record<NivelAlerta, string> = {
  ok: "OK",
  atencion: "Atención",
  critico: "Crítico",
};

const CATEGORIA_ICONOS: Record<string, LucideIcon> = {
  comida: Utensils,
  alimentacion: Utensils,
  transporte: Car,
  vivienda: Home,
  hogar: Home,
  compras: ShoppingBag,
  salud: Heart,
  educacion: GraduationCap,
  servicios: Zap,
  entretenimiento: Gamepad2,
  ocio: Gamepad2,
  otros: Tag,
};

function normalizeCategoria(categoria: string): string {
  return categoria
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getIconoCategoria(categoria: string): LucideIcon {
  return CATEGORIA_ICONOS[normalizeCategoria(categoria)] ?? LayoutGrid;
}

export interface AlertItemProps {
  alerta: Alerta;
}

export function AlertItem({ alerta }: AlertItemProps) {
  const colors = getColorByNivel(alerta.nivel);
  const Icon = getIconoCategoria(alerta.categoria);

  return (
    <div
      className={clsx(
        "flex gap-3 rounded-xl border p-4",
        colors.bg,
        colors.border
      )}
    >
      <div
        className={clsx(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-white dark:bg-surface",
          colors.border
        )}
      >
        <Icon className={clsx("h-5 w-5", colors.text)} aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-gray-900 dark:text-foreground">
            {alerta.categoria}
          </h3>
          <span
            className={clsx(
              "rounded-lg px-2 py-0.5 text-xs font-medium",
              colors.bg,
              colors.text,
              "border",
              colors.border
            )}
          >
            {NIVEL_LABELS[alerta.nivel]}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-muted">
          {formatCurrency(alerta.gastado)} de {formatCurrency(alerta.limite)} (
          {alerta.porcentaje}%)
        </p>
      </div>
    </div>
  );
}
