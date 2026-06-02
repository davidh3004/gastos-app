import type { ReactNode } from "react";
import { card } from "@/lib/ui-classes";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 dark:bg-surface-muted ${className ?? ""}`}
      aria-hidden
    />
  );
}

function SectionCardSkeleton({ children }: { children: ReactNode }) {
  return <section className={card}>{children}</section>;
}

export function MetasPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-8">
      <div className="px-4 md:px-0">
        <SkeletonBar className="h-9 w-56" />
      </div>

      <div className="px-4 md:px-0">
        <SectionCardSkeleton>
          <SkeletonBar className="mb-4 h-6 w-48" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBar key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        </SectionCardSkeleton>
      </div>

      <div className="px-4 md:px-0">
        <SectionCardSkeleton>
          <SkeletonBar className="mb-4 h-6 w-44" />
          <div className="space-y-4">
            <SkeletonBar className="h-32 w-full rounded-xl" />
            <SkeletonBar className="h-32 w-full rounded-xl" />
          </div>
        </SectionCardSkeleton>
      </div>

      <div className="px-4 md:px-0">
        <SectionCardSkeleton>
          <SkeletonBar className="mb-4 h-6 w-28" />
          <SkeletonBar className="h-40 w-full rounded-xl" />
          <SkeletonBar className="mt-4 h-24 w-full" />
        </SectionCardSkeleton>
      </div>

      <div className="px-4 md:px-0">
        <SectionCardSkeleton>
          <SkeletonBar className="mb-4 h-6 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBar key={i} className="mb-3 h-16 w-full rounded-xl" />
          ))}
        </SectionCardSkeleton>
      </div>
    </div>
  );
}
