import { buildSystemPrompt } from "@/lib/chat-context";
import type { ChatRequestBody, ChatMessage } from "@/types/chat";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1024;

function toAnthropicMessages(
  historial: ChatMessage[],
  mensaje: string
): { role: "user" | "assistant"; content: string }[] {
  const previos = historial.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
  return [...previos, { role: "user" as const, content: mensaje }];
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error:
            "ANTHROPIC_API_KEY no está configurada. Agrégala en .env.local.",
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as ChatRequestBody;

    if (!body.mensaje?.trim()) {
      return Response.json(
        { error: "El mensaje no puede estar vacío." },
        { status: 400 }
      );
    }

    if (!body.contexto) {
      return Response.json(
        { error: "Falta el contexto financiero." },
        { status: 400 }
      );
    }

    const system = buildSystemPrompt(body.contexto);
    const messages = toAnthropicMessages(
      body.historial ?? [],
      body.mensaje.trim()
    );

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system,
        messages,
      }),
    });

    const data = (await response.json()) as {
      error?: { message?: string };
      content?: { type: string; text?: string }[];
    };

    if (!response.ok) {
      const detalle =
        data.error?.message ?? `Error ${response.status} de Anthropic`;
      return Response.json({ error: detalle }, { status: response.status });
    }

    const texto = data.content
      ?.filter((block) => block.type === "text")
      .map((block) => block.text ?? "")
      .join("\n")
      .trim();

    if (!texto) {
      return Response.json(
        { error: "La API no devolvió una respuesta de texto." },
        { status: 502 }
      );
    }

    return Response.json({ respuesta: texto });
  } catch (error) {
    const mensaje =
      error instanceof Error ? error.message : "Error interno del servidor";
    return Response.json({ error: mensaje }, { status: 500 });
  }
}
