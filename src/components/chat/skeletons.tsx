function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 dark:bg-surface-muted ${className ?? ""}`}
      aria-hidden
    />
  );
}

export function ChatPageSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-6rem-env(safe-area-inset-bottom,0px))] flex-col overflow-hidden pt-4 md:h-[calc(100dvh-5rem)] md:pt-6">
      <div className="shrink-0 px-4 pb-3 md:px-0">
        <SkeletonBar className="h-8 w-32" />
        <SkeletonBar className="mt-2 h-4 w-56" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 px-4 py-2 md:px-0">
        <div className="flex justify-start">
          <SkeletonBar className="h-16 w-3/4 max-w-md rounded-2xl" />
        </div>
        <div className="flex justify-end">
          <SkeletonBar className="h-12 w-1/2 max-w-xs rounded-2xl" />
        </div>
        <div className="flex justify-start">
          <SkeletonBar className="h-24 w-4/5 max-w-lg rounded-2xl" />
        </div>
      </div>
      <div className="shrink-0 border-t border-gray-200 px-4 py-2 dark:border-border">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <SkeletonBar className="h-7 w-40 rounded-full" />
          <SkeletonBar className="h-7 w-48 rounded-full" />
        </div>
        <SkeletonBar className="h-11 w-full rounded-lg" />
      </div>
      </div>
    </div>
  );
}
