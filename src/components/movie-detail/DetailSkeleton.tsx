import { castGridClassName } from "./CastList";

/** Mesmas caixas do MovieHeader, para o conteúdo entrar sem deslocar a página. */
export function DetailSkeleton() {
  return (
    <div role="status" className="flex flex-wrap items-start gap-10">
      <span className="sr-only">Carregando filme</span>
      <div
        aria-hidden="true"
        className="aspect-[2/3] w-full max-w-[300px] grow basis-60 animate-pulse rounded-xl bg-surface-200"
      />
      <div aria-hidden="true" className="flex min-w-0 flex-1 basis-[560px] flex-col gap-7">
        <div className="flex flex-col gap-2">
          <div className="h-10 w-3/4 animate-pulse rounded bg-surface-200" />
          <div className="h-4 w-1/2 rounded bg-surface-100" />
          <div className="mt-3 flex flex-wrap gap-3">
            <div className="h-11 w-28 rounded-lg bg-surface-200" />
            <div className="h-11 w-28 rounded-lg bg-surface-200" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-5 w-24 rounded bg-surface-200" />
          <div className="h-4 rounded bg-surface-100" />
          <div className="h-4 rounded bg-surface-100" />
          <div className="h-4 w-2/3 rounded bg-surface-100" />
        </div>
        <div className={castGridClassName}>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-xl bg-surface-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
