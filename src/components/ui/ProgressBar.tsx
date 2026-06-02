import {
  calcularProgreso,
  formatCurrency,
  getColorByProgreso,
} from "@/lib/utils";
import { clsx } from "clsx";

export interface ProgressBarProps {
  label: string;
  actual: number;
  objetivo: number;
  showAmounts?: boolean;
}

function getBarFillClass(porcentaje: number): string {
  return getColorByProgreso(porcentaje).replace("text-", "bg-");
}

export function ProgressBar({
  label,
  actual,
  objetivo,
  showAmounts = false,
}: ProgressBarProps) {
  const porcentaje = calcularProgreso(actual, objetivo);
  const fillClass = getBarFillClass(porcentaje);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-900 dark:text-foreground">
          {label}
        </span>
        <span className="text-sm font-medium text-gray-600 dark:text-muted">
          {porcentaje}%
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-surface-muted">
        <div
          className={clsx("h-full rounded-lg transition-all", fillClass)}
          style={{ width: `${porcentaje}%` }}
          role="progressbar"
          aria-valuenow={porcentaje}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>

      {showAmounts && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-muted-foreground">
          {formatCurrency(actual)} / {formatCurrency(objetivo)}
        </p>
      )}
    </div>
  );
}
