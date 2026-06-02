"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Send } from "lucide-react";
import { clsx } from "clsx";
import { ChatMarkdown } from "@/lib/chat-markdown";
import { chipButton, inputBase } from "@/lib/ui-classes";
import type { ChatMessage, ContextoFinanciero } from "@/types/chat";

const SUGGESTED_QUESTIONS = [
  "¿En qué categoría gasto de más?",
  "¿Cuándo voy a llegar a mi fondo de emergencia?",
  "¿Qué puedo hacer para ahorrar más este mes?",
] as const;

interface ChatInterfaceProps {
  contexto: ContextoFinanciero;
  preguntaInicial?: string;
  /** Vista compacta dentro del popup flotante */
  embedded?: boolean;
}

function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 dark:bg-surface-muted"
      aria-label="El asistente está escribiendo"
    >
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-2 w-2 animate-typing-dot rounded-full bg-gray-400 dark:bg-muted"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

export function ChatInterface({
  contexto,
  preguntaInicial,
  embedded = false,
}: ChatInterfaceProps) {
  const [mensajes, setMensajes] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mensajesRef = useRef<ChatMessage[]>([]);
  const escribiendoRef = useRef(false);
  const inicialEnviadaRef = useRef(false);

  mensajesRef.current = mensajes;
  escribiendoRef.current = escribiendo;

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes, escribiendo, scrollToBottom]);

  const enviarMensaje = useCallback(
    async (texto: string) => {
      const trimmed = texto.trim();
      if (!trimmed || escribiendoRef.current) {
        return;
      }

      const mensajeUsuario: ChatMessage = {
        role: "user",
        content: trimmed,
      };

      const historialActual = mensajesRef.current;

      setMensajes((prev) => [...prev, mensajeUsuario]);
      setInput("");
      setEscribiendo(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mensaje: trimmed,
            historial: historialActual,
            contexto,
          }),
        });

        const data = (await response.json()) as {
          respuesta?: string;
          error?: string;
        };

        if (!response.ok || data.error) {
          throw new Error(
            data.error ??
              "No pude conectar con el asistente. Intenta de nuevo en un momento."
          );
        }

        setMensajes((prev) => [
          ...prev,
          { role: "assistant", content: data.respuesta ?? "" },
        ]);
      } catch (error) {
        const mensajeAmigable =
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado. Por favor intenta de nuevo.";

        setMensajes((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ **No pude responder ahora**\n\n${mensajeAmigable}\n\nSi el problema persiste, verifica que \`ANTHROPIC_API_KEY\` esté configurada en \`.env.local\`.`,
          },
        ]);
      } finally {
        setEscribiendo(false);
      }
    },
    [contexto]
  );

  useEffect(() => {
    if (!preguntaInicial?.trim() || inicialEnviadaRef.current) {
      return;
    }
    inicialEnviadaRef.current = true;
    void enviarMensaje(preguntaInicial);
    // Solo al montar con ?q=
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preguntaInicial]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void enviarMensaje(input);
  }

  const mostrarChips = mensajes.length === 0 && !escribiendo;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className={clsx(
          "min-h-0 flex-1 space-y-3 overflow-y-auto py-2",
          embedded ? "px-3" : "space-y-4 px-4 md:px-0 md:py-3"
        )}
      >
        {mensajes.length === 0 && !escribiendo && !preguntaInicial && (
          <div
            className={clsx(
              embedded ? "py-2" : "flex min-h-full items-center justify-center"
            )}
          >
            <div
              className={clsx(
                "w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center dark:border-border dark:bg-surface-muted",
                embedded ? "px-3 py-2" : "max-w-md px-4 py-4"
              )}
            >
              <p className="text-xs text-gray-600 dark:text-muted sm:text-sm">
                Pregúntame sobre gastos, metas o patrimonio.
              </p>
            </div>
          </div>
        )}

        {mensajes.map((msg, index) => (
          <div
            key={`${msg.role}-${index}`}
            className={clsx(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={clsx(
                "max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%]",
                msg.role === "user"
                  ? "rounded-br-md bg-primary text-white"
                  : "rounded-bl-md bg-gray-100 text-gray-900 dark:bg-surface-muted dark:text-foreground"
              )}
            >
              {msg.role === "user" ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              ) : (
                <ChatMarkdown content={msg.content} />
              )}
            </div>
          </div>
        ))}

        {escribiendo && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}
      </div>

      <div
        className={clsx(
          "shrink-0 border-t border-gray-200 bg-white py-2 dark:border-border dark:bg-background",
          embedded ? "px-3" : "px-4 md:px-0 md:py-3"
        )}
      >
        {mostrarChips && (
          <div className="mb-2 flex flex-wrap gap-1.5 md:mb-3 md:gap-2">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => void enviarMensaje(question)}
                className={clsx(
                  chipButton,
                  "px-2.5 py-1 text-xs leading-snug sm:px-3 sm:py-1.5 sm:text-sm"
                )}
              >
                {question}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta..."
            className={inputBase}
            disabled={escribiendo}
            aria-label="Mensaje para el asistente"
          />
          <button
            type="submit"
            disabled={escribiendo || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            aria-label="Enviar mensaje"
          >
            <Send className="h-5 w-5" aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );
}
