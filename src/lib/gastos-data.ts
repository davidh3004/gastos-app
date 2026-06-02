import {
  getCategoriasMes,
  getMesAMes,
  getTransacciones,
} from "@/lib/api";
import {
  buildCategoriasMesFromTransacciones,
  TODOS_MESES,
} from "@/lib/gastos-utils";
import type { CategoriaMes, MesAMesData, Transaccion } from "@/types";

export { TODOS_MESES };

export interface GastosData {
  mes: string;
  mesAMes: MesAMesData;
  categoriasMes: CategoriaMes;
  categoriasMesAnterior: CategoriaMes | null;
  mesAnterior: string | null;
  transacciones: Transaccion[];
}

const MES_CODE_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export function getMesActual(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export function isValidMesCode(mes: string): boolean {
  return MES_CODE_REGEX.test(mes);
}

export function isTodosMeses(mes: string): boolean {
  return mes === TODOS_MESES;
}

export function getMesesOrdenados(mesAMes: MesAMesData): string[] {
  return [...mesAMes.meses]
    .map((item) => item.mes)
    .sort((a, b) => b.localeCompare(a));
}

export function resolveMes(
  mesParam: string | undefined,
  mesAMes: MesAMesData
): string {
  if (mesParam === TODOS_MESES) {
    return TODOS_MESES;
  }

  if (mesParam && isValidMesCode(mesParam)) {
    const disponibles = new Set(getMesesOrdenados(mesAMes));
    if (disponibles.size === 0 || disponibles.has(mesParam)) {
      return mesParam;
    }
  }

  const ordenados = getMesesOrdenados(mesAMes);
  return ordenados[0] ?? getMesActual();
}

export function getMesAnterior(
  meses: MesAMesData["meses"],
  mes: string
): string | null {
  const ordenados = [...meses]
    .map((item) => item.mes)
    .sort((a, b) => a.localeCompare(b));
  const index = ordenados.indexOf(mes);
  if (index <= 0) {
    return null;
  }
  return ordenados[index - 1] ?? null;
}

export async function loadGastosData(mesParam?: string): Promise<GastosData> {
  const mesAMes = await getMesAMes();
  const mes = resolveMes(mesParam, mesAMes);

  if (isTodosMeses(mes)) {
    const todas = await getTransacciones();
    const transacciones = todas.filter((t) => t.tipo === "Gasto");
    const categoriasMes = buildCategoriasMesFromTransacciones(
      TODOS_MESES,
      transacciones
    );

    return {
      mes: TODOS_MESES,
      mesAMes,
      categoriasMes,
      categoriasMesAnterior: null,
      mesAnterior: null,
      transacciones,
    };
  }

  const mesAnterior = getMesAnterior(mesAMes.meses, mes);
  const [categoriasMes, transacciones, categoriasMesAnterior] = await Promise.all([
    getCategoriasMes(mes),
    getTransacciones(mes),
    mesAnterior ? getCategoriasMes(mesAnterior) : Promise.resolve(null),
  ]);

  return {
    mes,
    mesAMes,
    categoriasMes,
    categoriasMesAnterior,
    mesAnterior,
    transacciones,
  };
}
