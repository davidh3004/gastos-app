import { Suspense } from "react";
import { ChatPage } from "@/components/chat/ChatPage";
import { ChatPageSkeleton } from "@/components/chat/skeletons";

interface ChatRouteProps {
  searchParams: Promise<{ q?: string }>;
}

async function ChatPageContent({ searchParams }: ChatRouteProps) {
  const params = await searchParams;
  return <ChatPage preguntaInicial={params.q} />;
}

export default function ChatRoute({ searchParams }: ChatRouteProps) {
  return (
    <Suspense fallback={<ChatPageSkeleton />}>
      <ChatPageContent searchParams={searchParams} />
    </Suspense>
  );
}
