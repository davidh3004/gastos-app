import { cache } from "react";
import {
  getCategoriasMes,
  getMesAMes,
  getMetas,
  getPatrimonio,
  getResumenMes,
} from "@/lib/api";
import { getMesActual } from "@/lib/home-data";
import { formatCurrency, formatMes } from "@/lib/utils";
import type { ContextoFinanciero } from "@/types/chat";
import type { Meta } from "@/types";

export const loadChatContext = cache(async (): Promise<ContextoFinanciero> => {
  const mes = getMesActual();

  const [resumen, categoriasMes, metas, patrimonio, mesAMes] =
    await Promise.all([
      getResumenMes(mes),
      getCategoriasMes(mes),
      getMetas(),
      getPatrimonio(),
      getMesAMes(),
    ]);

  return {
    mes,
    resumen,
    categoriasMes,
    metas,
    patrimonio,
    mesAMes,
  };
});

function formatMeta(meta: Meta): string {
  const progreso =
    meta.objetivo > 0
      ? Math.round((meta.actual / meta.objetivo) * 100)
      : 0;
  return `- ${meta.nombre} (${meta.tipo}): ${formatCurrency(meta.actual)} de ${formatCurrency(meta.objetivo)} (${progreso}%), límite ${meta.fecha_limite}${meta.notas ? ` — ${meta.notas}` : ""}`;
}

export function buildSystemPrompt(contexto: ContextoFinanciero): string {
  const { resumen, categoriasMes, metas, patrimonio, mesAMes, mes } =
    contexto;

  const categoriasOrdenadas = [...categoriasMes.categorias]
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
    .map(
      (cat) =>
        `- ${cat.nombre}: ${formatCurrency(Math.abs(cat.total))}`
    )
    .join("\n");

  const metasTexto = metas.map(formatMeta).join("\n") || "- Sin metas registradas";

  const cuentasTexto = patrimonio.cuentas
    .map(
      (c) =>
        `- ${c.cuenta} (${c.tipo}): ${formatCurrency(c.saldo)}`
    )
    .join("\n");

  const historialMeses = [...mesAMes.meses]
    .sort((a, b) => b.mes.localeCompare(a.mes))
    .slice(0, 6)
    .map(
      (item) =>
        `- ${formatMes(item.mes)}: ingresos ${formatCurrency(item.ingresos)}, gastos ${formatCurrency(item.gastos)}, flujo ${formatCurrency(item.flujo)}`
    )
    .join("\n");

  return `Eres un asistente financiero personal de David Henriquez, un joven profesional en Santo Domingo, República Dominicana.
Tienes acceso a sus datos financieros reales:

RESUMEN DEL MES ACTUAL (${formatMes(mes)}):
- Ingresos: ${formatCurrency(resumen.ingresos)}
- Gastos: ${formatCurrency(resumen.gastos)}
- Flujo neto: ${formatCurrency(resumen.flujo_neto)}
- Tasa de ahorro: ${resumen.tasa_ahorro}%

TOP CATEGORÍAS DE GASTO:
${categoriasOrdenadas || "- Sin categorías registradas"}

METAS FINANCIERAS:
${metasTexto}

PATRIMONIO ACTUAL:
- Total: ${formatCurrency(patrimonio.total)}
- Última actualización: ${patrimonio.ultima_actualizacion}
Cuentas:
${cuentasTexto || "- Sin cuentas"}

HISTORIAL RECIENTE (mes a mes):
${historialMeses || "- Sin historial"}

Responde siempre en español. Sé directo, específico con los números reales de David, y da recomendaciones accionables. Usa RD$ para los montos.
Máximo 3 párrafos por respuesta. Nunca inventes datos que no estén en el contexto.`;
}
