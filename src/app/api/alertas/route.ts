import { getAlertas } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const alertas = await getAlertas();
    return Response.json({ ok: true, alertas });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cargar alertas";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
