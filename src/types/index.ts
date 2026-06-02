/** Transacción del Sheet — mes en formato yyyy-MM */
export type TipoTransaccion = "Ingreso" | "Gasto";

export interface Transaccion {
  id: string;
  fecha: string;
  descripcion: string;
  tipo: TipoTransaccion;
  monto: number;
  categoria: string;
  mes: string;
}

/** Meta de ahorro o gasto recurrente */
export type TipoMeta = "Acumulada" | "Recurrente";

export interface Meta {
  id: string;
  nombre: string;
  tipo: TipoMeta;
  objetivo: number;
  fecha_limite: string;
  actual: number;
  notas: string;
}

/** Cuenta dentro del patrimonio */
export interface Cuenta {
  cuenta: string;
  tipo: string;
  saldo: number;
  notas: string;
}

export interface HistorialPatrimonio {
  fecha: string;
  total: number;
}

/** Respuesta del endpoint de patrimonio */
export interface PatrimonioData {
  total: number;
  cuentas: Cuenta[];
  historial: HistorialPatrimonio[];
  ultima_actualizacion: string;
}

/** Alerta calculada por categoría */
export type NivelAlerta = "ok" | "atencion" | "critico";

export interface Alerta {
  categoria: string;
  gastado: number;
  limite: number;
  porcentaje: number;
  nivel: NivelAlerta;
}

/** Límite de gasto por categoría (configuración en el Sheet) */
export interface ConfiguracionAlerta {
  categoria: string;
  limite: number;
}

/** Resumen financiero de un mes */
export interface ResumenMes {
  mes: string;
  ingresos: number;
  gastos: number;
  flujo_neto: number;
  tasa_ahorro: number;
}

export interface CategoriaItem {
  nombre: string;
  total: number;
}

/** Totales por categoría en un mes */
export interface CategoriaMes {
  mes: string;
  categorias: CategoriaItem[];
}

export interface MesAMesItem {
  mes: string;
  ingresos: number;
  gastos: number;
  flujo: number;
}

/** Comparativa ingresos/gastos mes a mes */
export interface MesAMesData {
  meses: MesAMesItem[];
}
