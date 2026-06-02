import { ArrowDown, ArrowUp } from "lucide-react";
import { clsx } from "clsx";
import { cardMuted } from "@/lib/ui-classes";

export interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  valueClassName?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  sub,
  trend,
  valueClassName,
  className,
}: MetricCardProps) {
  const showTrend = sub && trend && trend !== "neutral";

  return (
    <div className={clsx(cardMuted, "flex flex-col", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-muted">
        {label}
      </p>
      <p
        className={clsx(
          "mt-1 text-2xl font-semibold tabular-nums",
          valueClassName ?? "text-gray-900 dark:text-foreground"
        )}
      >
        {value}
      </p>
      {sub && (
        <div className="mt-1 flex items-center gap-1">
          {showTrend && trend === "up" && (
            <ArrowUp
              className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400"
              aria-hidden
            />
          )}
          {showTrend && trend === "down" && (
            <ArrowDown
              className="h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400"
              aria-hidden
            />
          )}
          <p
            className={clsx(
              "text-sm text-gray-600 dark:text-muted",
              showTrend && trend === "up" && "text-green-600 dark:text-green-400",
              showTrend && trend === "down" && "text-red-600 dark:text-red-400"
            )}
          >
            {sub}
          </p>
        </div>
      )}
    </div>
  );
}
