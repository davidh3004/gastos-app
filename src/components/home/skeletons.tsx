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

export function SectionCardSkeleton({ children }: { children: ReactNode }) {
  return <section className={card}>{children}</section>;
}

export function MonthHeaderSkeleton() {
  return (
    <div className="px-4 pt-12 md:px-0 md:pt-0">
      <SkeletonBar className="h-8 w-48" />
      <SkeletonBar className="mt-2 h-4 w-56" />
    </div>
  );
}

export function MetricsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 md:grid-cols-4 md:gap-4 md:px-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBar key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}

export function AlertsSectionSkeleton() {
  return (
    <SectionCardSkeleton>
      <SkeletonBar className="mb-4 h-6 w-40" />
      <div className="space-y-3">
        <SkeletonBar className="h-20 w-full" />
        <SkeletonBar className="h-20 w-full" />
      </div>
    </SectionCardSkeleton>
  );
}

export function GastosSectionSkeleton() {
  return (
    <SectionCardSkeleton>
      <SkeletonBar className="mb-4 h-6 w-56" />
      <SkeletonBar className="h-[320px] w-full" />
    </SectionCardSkeleton>
  );
}

export function TwoColumnSectionSkeleton() {
  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 md:gap-6 md:px-0">
      <SectionCardSkeleton>
        <SkeletonBar className="mb-4 h-6 w-28" />
        <div className="space-y-4">
          <SkeletonBar className="h-12 w-full" />
          <SkeletonBar className="h-12 w-full" />
          <SkeletonBar className="h-12 w-full" />
        </div>
      </SectionCardSkeleton>
      <SectionCardSkeleton>
        <SkeletonBar className="mb-4 h-6 w-32" />
        <SkeletonBar className="h-[240px] w-full" />
      </SectionCardSkeleton>
    </div>
  );
}

export function PatrimonioSectionSkeleton() {
  return (
    <SectionCardSkeleton>
      <SkeletonBar className="mb-2 h-10 w-40" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBar key={i} className="h-14 w-full" />
        ))}
      </div>
      <SkeletonBar className="mt-4 h-3 w-48" />
    </SectionCardSkeleton>
  );
}

export function ChatSectionSkeleton() {
  return (
    <SectionCardSkeleton>
      <SkeletonBar className="mb-4 h-6 w-32" />
      <SkeletonBar className="h-11 w-full rounded-lg" />
      <div className="mt-3 flex flex-wrap gap-2">
        <SkeletonBar className="h-8 w-36 rounded-full" />
        <SkeletonBar className="h-8 w-44 rounded-full" />
        <SkeletonBar className="h-8 w-40 rounded-full" />
      </div>
    </SectionCardSkeleton>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-8">
      <MonthHeaderSkeleton />
      <MetricsGridSkeleton />
      <div className="px-4 md:px-0">
        <AlertsSectionSkeleton />
      </div>
      <div className="px-4 md:px-0">
        <GastosSectionSkeleton />
      </div>
      <TwoColumnSectionSkeleton />
      <div className="px-4 md:px-0">
        <PatrimonioSectionSkeleton />
      </div>
      <div className="px-4 md:px-0">
        <ChatSectionSkeleton />
      </div>
    </div>
  );
}
