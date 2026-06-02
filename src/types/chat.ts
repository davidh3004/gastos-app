import type {
  CategoriaMes,
  Meta,
  MesAMesData,
  PatrimonioData,
  ResumenMes,
} from "@/types";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ContextoFinanciero {
  mes: string;
  resumen: ResumenMes;
  categoriasMes: CategoriaMes;
  metas: Meta[];
  patrimonio: PatrimonioData;
  mesAMes: MesAMesData;
}

export interface ChatRequestBody {
  mensaje: string;
  historial: ChatMessage[];
  contexto: ContextoFinanciero;
}
