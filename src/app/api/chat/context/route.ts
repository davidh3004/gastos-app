import { loadChatContext } from "@/lib/chat-context";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const contexto = await loadChatContext();
    return Response.json({ ok: true, contexto });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al cargar contexto";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
