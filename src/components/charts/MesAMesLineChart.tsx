"use client";

import type { MesAMesData } from "@/types";
import { formatCurrency, formatMes } from "@/lib/utils";
import { useChartTheme } from "@/hooks/useChartTheme";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const INGRESOS_COLOR = "#16a34a";
const GASTOS_COLOR = "#dc2626";
const CHART_HEIGHT = 240;

const SERIE_LABELS: Record<string, string> = {
  ingresos: "Ingresos",
  gastos: "Gastos",
};

export interface MesAMesLineChartProps {
  data: MesAMesData[];
}

interface ChartDatum {
  mes: string;
  ingresos: number;
  gastos: number;
}

interface TooltipPayload {
  dataKey?: string;
  value?: number;
  color?: string;
}

function MesAMesTooltip({
  active,
  payload,
  label,
  theme,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  theme: ReturnType<typeof useChartTheme>;
}) {
  if (!active || !payload?.length) {
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
      {label && (
        <p
          className="mb-1 font-medium"
          style={{ color: theme.tooltip.title }}
        >
          {formatMes(label)}
        </p>
      )}
      <ul className="space-y-0.5">
        {payload.map((entry) => {
          const key = entry.dataKey ?? "";
          const serieLabel = SERIE_LABELS[key] ?? key;
          const value = entry.value ?? 0;

          return (
            <li
              key={key}
              className="flex items-center gap-2"
              style={{ color: theme.tooltip.body }}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>
                {serieLabel}: {formatCurrency(value)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function getMesesFromData(data: MesAMesData[]): ChartDatum[] {
  const byMes = new Map<string, ChartDatum>();

  for (const block of data) {
    for (const item of block.meses) {
      byMes.set(item.mes, {
        mes: item.mes,
        ingresos: item.ingresos,
        gastos: item.gastos,
      });
    }
  }

  return Array.from(byMes.values()).sort((a, b) => a.mes.localeCompare(b.mes));
}

export function MesAMesLineChart({ data }: MesAMesLineChartProps) {
  const chartTheme = useChartTheme();
  const chartData = getMesesFromData(data);

  if (chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 dark:border-border dark:bg-surface-muted dark:text-muted"
        style={{ height: CHART_HEIGHT }}
      >
        Sin datos históricos
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-border dark:bg-surface-muted">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart
          data={chartData}
          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartTheme.grid}
            vertical={false}
          />
          <XAxis
            dataKey="mes"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: chartTheme.tick }}
            tickFormatter={(value: string) => formatMes(value)}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: chartTheme.tick }}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
            }
            width={40}
          />
          <Tooltip content={<MesAMesTooltip theme={chartTheme} />} />
          <Line
            type="monotone"
            dataKey="ingresos"
            stroke={INGRESOS_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="gastos"
            stroke={GASTOS_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
