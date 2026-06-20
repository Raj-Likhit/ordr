import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Skeleton */}
      <Skeleton className="w-full h-64 md:h-96" />

      {/* Title Skeleton */}
      <Skeleton className="w-1/3 h-10" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="w-full aspect-[3/4]" />
            <Skeleton className="w-3/4 h-5" />
            <Skeleton className="w-1/2 h-5" />
          </div>
        ))}
      </div>
    </div>
  );
}
