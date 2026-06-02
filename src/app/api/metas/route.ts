import { postToAppsScript } from "@/lib/apps-script-post";
import { revalidateSheetData } from "@/lib/revalidate-sheet";
import type { ActualizarMetaInput } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ActualizarMetaInput>;

    if (!body.id || !body.nombre) {
      return Response.json(
        { error: "Faltan campos obligatorios de la meta." },
        { status: 400 }
      );
    }

    const json = await postToAppsScript({
      accion: "actualizar_meta",
      id: body.id,
      nombre: body.nombre,
      objetivo: Number(body.objetivo),
      fecha_limite: body.fecha_limite ?? "",
      actual: Number(body.actual),
      notas: body.notas ?? "",
    });

    revalidateSheetData();

    return Response.json({
      ok: true,
      mensaje:
        (typeof json.mensaje === "string" && json.mensaje) ||
        "Meta actualizada correctamente",
    });
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : "Error interno del servidor";
    return Response.json({ ok: false, error: mensaje }, { status: 500 });
  }
}
