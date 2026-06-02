import { Suspense } from "react";
import { MetasPage } from "@/components/metas/MetasPage";
import { MetasPageSkeleton } from "@/components/metas/skeletons";

export default function MetasRoute() {
  return (
    <Suspense fallback={<MetasPageSkeleton />}>
      <MetasPage />
    </Suspense>
  );
}
