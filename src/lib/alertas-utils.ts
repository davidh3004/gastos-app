import type { Alerta, NivelAlerta } from "@/types";

const NIVEL_ORDER: Record<NivelAlerta, number> = {
  critico: 0,
  atencion: 1,
  ok: 2,
};

export function getAlertasActivas(alertas: Alerta[]): Alerta[] {
  return alertas
    .filter(
      (alerta) => alerta.nivel === "critico" || alerta.nivel === "atencion"
    )
    .sort((a, b) => NIVEL_ORDER[a.nivel] - NIVEL_ORDER[b.nivel]);
}
