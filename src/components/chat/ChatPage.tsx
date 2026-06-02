import { loadChatContext } from "@/lib/chat-context";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { HomeErrorState } from "@/components/home/HomeErrorState";
import { pageTitle } from "@/lib/ui-classes";

interface ChatPageProps {
  preguntaInicial?: string;
}

export async function ChatPage({ preguntaInicial }: ChatPageProps) {
  try {
    const contexto = await loadChatContext();

    return (
      <div className="flex h-[calc(100dvh-6rem-env(safe-area-inset-bottom,0px))] flex-col overflow-hidden pt-4 md:h-[calc(100dvh-5rem)] md:pt-6">
        <header className="shrink-0 px-4 pb-3 md:px-0">
          <h1 className={pageTitle}>Chat IA</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-muted">
            Asistente financiero con tus datos reales
          </p>
        </header>
        <ChatInterface
          contexto={contexto}
          preguntaInicial={preguntaInicial}
        />
      </div>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return (
      <div className="py-4 md:py-8">
        <HomeErrorState message={message} />
      </div>
    );
  }
}
