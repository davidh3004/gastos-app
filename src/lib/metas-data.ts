import { getMetas, getResumenMes } from "@/lib/api";
import type { Meta, ResumenMes } from "@/types";

export interface MetasPageData {
  metas: Meta[];
  resumen: ResumenMes;
  metasAcumuladas: Meta[];
  metasRecurrentes: Meta[];
  ahorroMensual: number;
}

export async function loadMetasData(): Promise<MetasPageData> {
  const [metas, resumen] = await Promise.all([getMetas(), getResumenMes()]);

  const metasAcumuladas = metas.filter((meta) => meta.tipo === "Acumulada");
  const metasRecurrentes = metas.filter((meta) => meta.tipo === "Recurrente");
  const ahorroMensual = Math.max(0, resumen.flujo_neto);

  return {
    metas,
    resumen,
    metasAcumuladas,
    metasRecurrentes,
    ahorroMensual,
  };
}
