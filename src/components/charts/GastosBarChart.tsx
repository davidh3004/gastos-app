"use client";

import type { CategoriaMes } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useChartTheme } from "@/hooks/useChartTheme";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_HEIGHT = 320;
const TOP_CATEGORIAS = 7;

export interface GastosBarChartProps {
  data: CategoriaMes[];
  mes: string;
  /** Máximo de categorías en el gráfico. Por defecto 7. `null` = todas. */
  limite?: number | null;
}

interface ChartDatum {
  nombre: string;
  total: number;
}

interface TooltipPayload {
  payload?: ChartDatum;
  value?: number;
}

function GastosTooltip({
  active,
  payload,
  theme,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  theme: ReturnType<typeof useChartTheme>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;
  const value = payload[0].value;

  if (!item || value === undefined) {
    return null;
  }

  return (
    <div
      className="rounded-lg border px-3 py-2 text-sm"
      style={{
        backgroundColor: theme.tooltip.background,
        borderColor: theme.tooltip.border,
      }}
    >
      <p className="font-medium" style={{ color: theme.tooltip.title }}>
        {item.nombre}
      </p>
      <p style={{ color: theme.tooltip.body }}>{formatCurrency(value)}</p>
    </div>
  );
}

function getCategoriasForMes(
  data: CategoriaMes[],
  mes: string,
  limite: number | null
): ChartDatum[] {
  const entry = data.find((item) => item.mes === mes) ?? data[0];

  if (!entry?.categorias?.length) {
    return [];
  }

  const sorted = [...entry.categorias].sort((a, b) => b.total - a.total);
  const limited =
    limite === null ? sorted : sorted.slice(0, limite ?? TOP_CATEGORIAS);

  return limited.map(({ nombre, total }) => ({ nombre, total }));
}

export function GastosBarChart({
  data,
  mes,
  limite = TOP_CATEGORIAS,
}: GastosBarChartProps) {
  const chartTheme = useChartTheme();
  const chartData = getCategoriasForMes(data, mes, limite);

  if (chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 dark:border-border dark:bg-surface-muted dark:text-muted"
        style={{ height: CHART_HEIGHT }}
      >
        Sin datos para este período
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-border dark:bg-surface-muted">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: chartTheme.tick }}
            tickFormatter={(value: number) => formatCurrency(value)}
          />
          <YAxis
            type="category"
            dataKey="nombre"
            width={96}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: chartTheme.label }}
          />
          <Tooltip
            content={<GastosTooltip theme={chartTheme} />}
            cursor={{ fill: chartTheme.cursor }}
          />
          <Bar
            dataKey="total"
            fill={chartTheme.bar}
            radius={[0, 4, 4, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
