import { postToAppsScript } from "@/lib/apps-script-post";
import { revalidateSheetData } from "@/lib/revalidate-sheet";
import type { TipoTransaccion } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const accion = body.accion;

    if (accion === "categorizar") {
      const descripcion =
        typeof body.descripcion === "string" ? body.descripcion.trim() : "";

      if (!descripcion) {
        return Response.json(
          { error: "La descripción es obligatoria." },
          { status: 400 }
        );
      }

      const json = await postToAppsScript({
        accion: "categorizar",
        descripcion,
      });

      const categoria =
        typeof json.categoria === "string"
          ? json.categoria
          : "Sin categorizar";

      return Response.json({ ok: true, categoria });
    }

    if (accion === "guardar") {
      const descripcion =
        typeof body.descripcion === "string" ? body.descripcion.trim() : "";
      const tipo = body.tipo as TipoTransaccion;
      const monto = Number(body.monto);
      const fecha = typeof body.fecha === "string" ? body.fecha : "";
      const categoria =
        typeof body.categoria === "string" ? body.categoria.trim() : "";

      if (!descripcion || !fecha || !categoria) {
        return Response.json(
          { error: "Faltan campos obligatorios." },
          { status: 400 }
        );
      }

      if (tipo !== "Ingreso" && tipo !== "Gasto") {
        return Response.json({ error: "Tipo inválido." }, { status: 400 });
      }

      if (!Number.isFinite(monto) || monto <= 0) {
        return Response.json({ error: "Monto inválido." }, { status: 400 });
      }

      const json = await postToAppsScript({
        accion: "guardar",
        descripcion,
        tipo,
        monto,
        fecha,
        categoria,
      });

      revalidateSheetData();

      return Response.json({
        ok: true,
        mensaje:
          (typeof json.mensaje === "string" && json.mensaje) ||
          "Transacción guardada",
      });
    }

    return Response.json({ error: "Acción no reconocida." }, { status: 400 });
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : "Error interno del servidor";
    return Response.json({ ok: false, error: mensaje }, { status: 500 });
  }
}
