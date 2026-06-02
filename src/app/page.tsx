import { Suspense } from "react";
import { HomePage } from "@/components/home/HomePage";
import { HomePageSkeleton } from "@/components/home/skeletons";

export default function Home() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePage />
    </Suspense>
  );
}
