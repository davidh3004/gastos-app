"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { TODOS_MESES } from "@/lib/gastos-utils";
import { formatMes } from "@/lib/utils";
import { inputBase } from "@/lib/ui-classes";

interface MesSelectorProps {
  meses: string[];
  mesActual: string;
  /** Muestra la opción agregada de todos los gastos históricos */
  mostrarTodos?: boolean;
}

function etiquetaMes(mes: string): string {
  if (mes === TODOS_MESES) {
    return "Todos los gastos";
  }
  return formatMes(mes);
}

export function MesSelector({
  meses,
  mesActual,
  mostrarTodos = false,
}: MesSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(mes: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mes", mes);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex shrink-0 flex-col gap-1 sm:items-end">
      <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground">
        Período
      </span>
      <select
        value={mesActual}
        onChange={(event) => handleChange(event.target.value)}
        className={`${inputBase} min-w-[11.5rem] cursor-pointer py-2`}
        aria-label="Seleccionar período de gastos"
      >
        {mostrarTodos && (
          <option value={TODOS_MESES}>Todos los gastos</option>
        )}
        {meses.map((mes) => (
          <option key={mes} value={mes}>
            {etiquetaMes(mes)}
          </option>
        ))}
      </select>
    </label>
  );
}
