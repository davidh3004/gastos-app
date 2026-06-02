import { cache } from "react";
import {
  getAlertas,
  getCategoriasMes,
  getMesAMes,
  getMetas,
  getPatrimonio,
  getResumenMes,
} from "@/lib/api";
import type {
  Alerta,
  CategoriaMes,
  Meta,
  MesAMesData,
  PatrimonioData,
  ResumenMes,
} from "@/types";

export function getMesActual(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
}

export interface HomeData {
  mes: string;
  resumen: ResumenMes;
  categoriasMes: CategoriaMes;
  alertas: Alerta[];
  metas: Meta[];
  patrimonio: PatrimonioData;
  mesAMes: MesAMesData;
}

export const loadHomeData = cache(async (): Promise<HomeData> => {
  const mes = getMesActual();

  const [resumen, categoriasMes, alertas, metas, patrimonio, mesAMes] =
    await Promise.all([
      getResumenMes(mes),
      getCategoriasMes(mes),
      getAlertas(),
      getMetas(),
      getPatrimonio(),
      getMesAMes(),
    ]);

  return {
    mes,
    resumen,
    categoriasMes,
    alertas,
    metas,
    patrimonio,
    mesAMes,
  };
});
