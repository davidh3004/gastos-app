import type { ReactNode } from "react";
import { card, cardMuted } from "@/lib/ui-classes";

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

export function GastosHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-end sm:justify-between md:px-0">
      <SkeletonBar className="h-9 w-32" />
      <SkeletonBar className="h-11 w-44 rounded-lg" />
    </div>
  );
}

export function GastosMetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-3 md:gap-4 md:px-0">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={cardMuted}>
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="mt-2 h-8 w-36" />
          <SkeletonBar className="mt-2 h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

export function GastosCategoriasSkeleton() {
  return (
    <SectionCardSkeleton>
      <SkeletonBar className="mb-4 h-6 w-40" />
      <SkeletonBar className="mb-6 h-[320px] w-full rounded-xl" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBar key={i} className="h-10 w-full" />
        ))}
      </div>
    </SectionCardSkeleton>
  );
}

export function GastosTransaccionesSkeleton() {
  return (
    <SectionCardSkeleton>
      <SkeletonBar className="mb-4 h-6 w-36" />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonBar className="h-11 rounded-lg sm:col-span-2" />
        <SkeletonBar className="h-11 rounded-lg" />
        <SkeletonBar className="h-11 rounded-lg" />
      </div>
      <div className="hidden space-y-2 md:block">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonBar key={i} className="h-12 w-full" />
        ))}
      </div>
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBar key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </SectionCardSkeleton>
  );
}

export function GastosPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-8">
      <GastosHeaderSkeleton />
      <GastosMetricsSkeleton />
      <div className="px-4 md:px-0">
        <GastosCategoriasSkeleton />
      </div>
      <div className="px-4 md:px-0">
        <GastosTransaccionesSkeleton />
      </div>
    </div>
  );
}
