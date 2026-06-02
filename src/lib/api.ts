import {
  getRevalidateSeconds,
  SHEET_DATA_TAG,
} from "@/lib/data-cache";
import type {
  Alerta,
  CategoriaMes,
  Meta,
  MesAMesData,
  PatrimonioData,
  ResumenMes,
  TipoTransaccion,
  Transaccion,
} from "@/types";

export { SHEET_DATA_TAG };

/** Nombres de `accion` del Apps Script (snake_case) */
type Accion =
  | "resumen_mes"
  | "categorias_mes"
  | "transacciones"
  | "metas"
  | "patrimonio"
  | "alertas"
  | "mes_a_mes";

interface ApiErrorResponse {
  ok: false;
  error?: string;
  mensaje?: string;
  message?: string;
}

function getScriptUrl(): string {
  const url = process.env.NEXT_PUBLIC_SCRIPT_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SCRIPT_URL no está configurada");
  }
  return url;
}

function getToken(): string {
  const token = process.env.NEXT_PUBLIC_TOKEN;
  if (!token) {
    throw new Error("NEXT_PUBLIC_TOKEN no está configurada");
  }
  return token;
}

function getErrorMessage(body: ApiErrorResponse): string {
  return (
    body.error ??
    body.mensaje ??
    body.message ??
    "Error desconocido en la API"
  );
}

function unwrapPayload<T>(
  json: Record<string, unknown>,
  listKey?: string
): T {
  if (json.ok === false) {
    throw new Error(
      getErrorMessage({
        ok: false,
        error: typeof json.error === "string" ? json.error : undefined,
        mensaje:
          typeof json.mensaje === "string" ? json.mensaje : undefined,
        message:
          typeof json.message === "string" ? json.message : undefined,
      })
    );
  }

  if (json.data !== undefined) {
    return json.data as T;
  }

  if (listKey !== undefined && Array.isArray(json[listKey])) {
    return json[listKey] as T;
  }

  const rest = { ...json };
  delete rest.ok;
  delete rest.error;
  delete rest.mensaje;
  delete rest.message;
  return rest as T;
}

async function fetchAccion<T>(
  accion: Accion,
  mes?: string,
  listKey?: string
): Promise<T> {
  const url = new URL(getScriptUrl());
  url.searchParams.set("token", getToken());
  url.searchParams.set("accion", accion);
  if (mes) {
    url.searchParams.set("mes", mes);
  }

  const revalidate = getRevalidateSeconds();
  const cacheInit: RequestInit =
    revalidate === 0
      ? { cache: "no-store", next: { tags: [SHEET_DATA_TAG] } }
      : { next: { revalidate, tags: [SHEET_DATA_TAG] } };

  const response = await fetch(url.toString(), cacheInit);

  const bodyText = await response.text();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  let json: Record<string, unknown>;

  try {
    json = JSON.parse(bodyText) as Record<string, unknown>;
  } catch {
    if (bodyText.includes("doGet")) {
      throw new Error(
        "Apps Script sin doGet desplegado. Copia google-apps-script/Code.gs, despliega como Web App y actualiza NEXT_PUBLIC_SCRIPT_URL. Ver google-apps-script/README.md"
      );
    }
    throw new Error(
      "La API no devolvió JSON. Verifica la URL del script y que esté desplegada como aplicación web."
    );
  }

  return unwrapPayload<T>(json, listKey);
}

export async function getResumenMes(mes?: string): Promise<ResumenMes> {
  return fetchAccion<ResumenMes>("resumen_mes", mes);
}

export async function getCategoriasMes(mes?: string): Promise<CategoriaMes> {
  return fetchAccion<CategoriaMes>("categorias_mes", mes);
}

export async function getTransacciones(mes?: string): Promise<Transaccion[]> {
  return fetchAccion<Transaccion[]>("transacciones", mes, "transacciones");
}

export async function getMetas(): Promise<Meta[]> {
  return fetchAccion<Meta[]>("metas", undefined, "metas");
}

export async function getPatrimonio(): Promise<PatrimonioData> {
  return fetchAccion<PatrimonioData>("patrimonio");
}

export async function getAlertas(): Promise<Alerta[]> {
  return fetchAccion<Alerta[]>("alertas", undefined, "alertas");
}

export async function getMesAMes(): Promise<MesAMesData> {
  return fetchAccion<MesAMesData>("mes_a_mes");
}

export interface ActualizarMetaInput {
  id: string;
  nombre: string;
  objetivo: number;
  fecha_limite: string;
  actual: number;
  notas: string;
}

async function postApiRoute<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let json: Record<string, unknown>;
  try {
    json = (await response.json()) as Record<string, unknown>;
  } catch {
    throw new Error("No se pudo leer la respuesta del servidor.");
  }

  if (!response.ok || json.ok === false) {
    const error =
      (typeof json.error === "string" && json.error) ||
      `Error ${response.status}`;
    throw new Error(error);
  }

  return json as T;
}

/** POST — actualizar meta vía API route (evita CORS). */
export async function actualizarMeta(input: ActualizarMetaInput): Promise<void> {
  await postApiRoute("/api/metas", {
    accion: "actualizar_meta",
    ...input,
  });
}

/** POST — sugiere categoría (Reglas en Apps Script + fallback local en UI). */
export async function categorizarDescripcion(
  descripcion: string
): Promise<string> {
  const json = await postApiRoute<{ categoria: string }>("/api/transacciones", {
    accion: "categorizar",
    descripcion: descripcion.trim(),
  });
  return json.categoria ?? "Sin categorizar";
}

export interface GuardarTransaccionInput {
  descripcion: string;
  tipo: TipoTransaccion;
  monto: number;
  fecha: string;
  categoria: string;
}

/** POST — guarda transacción vía API route (evita CORS). */
export async function guardarTransaccion(
  input: GuardarTransaccionInput
): Promise<string> {
  const json = await postApiRoute<{ mensaje?: string }>("/api/transacciones", {
    accion: "guardar",
    descripcion: input.descripcion.trim(),
    tipo: input.tipo,
    monto: input.monto,
    fecha: input.fecha,
    categoria: input.categoria,
  });
  return json.mensaje ?? "Transacción guardada";
}
