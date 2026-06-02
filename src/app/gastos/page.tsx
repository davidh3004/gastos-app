import { Suspense } from "react";
import { GastosPage } from "@/components/gastos/GastosPage";
import { GastosPageSkeleton } from "@/components/gastos/skeletons";

interface GastosRouteProps {
  searchParams: Promise<{ mes?: string }>;
}

async function GastosPageContent({ searchParams }: GastosRouteProps) {
  const params = await searchParams;
  return <GastosPage mesParam={params.mes} />;
}

export default function GastosRoute({ searchParams }: GastosRouteProps) {
  return (
    <Suspense fallback={<GastosPageSkeleton />}>
      <GastosPageContent searchParams={searchParams} />
    </Suspense>
  );
}
