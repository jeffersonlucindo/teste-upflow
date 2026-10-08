import { movieGridClassName } from "./MovieGrid";

export interface MovieGridSkeletonProps {
  count?: number;
}

export function MovieGridSkeleton({ count = 8 }: MovieGridSkeletonProps) {
  return (
    <div role="status" className={movieGridClassName}>
      <span className="sr-only">Carregando filmes</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} aria-hidden="true" className="flex flex-col gap-3">
          <div className="aspect-[2/3] animate-pulse rounded-xl bg-surface-200" />
          <div className="h-4 rounded bg-surface-100" />
          <div className="h-4 w-2/3 rounded bg-surface-100" />
        </div>
      ))}
    </div>
  );
}
