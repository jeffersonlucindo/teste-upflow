import Image from "next/image";

import { profileUrl } from "@/lib/tmdb/images";
import type { CastMember } from "@/lib/tmdb/types";

export interface CastCardProps {
  member: CastMember;
}

export function CastCard({ member }: CastCardProps) {
  const photo = profileUrl(member.profilePath);

  return (
    <figure className="flex flex-col gap-2">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-200">
        {photo ? (
          // alt vazio: o figcaption já nomeia a figura.
          <Image
            src={photo}
            alt=""
            fill
            sizes="(max-width: 639px) 45vw, 160px"
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center text-xs text-text-subtle"
          >
            Foto
          </span>
        )}
      </div>
      <figcaption className="flex flex-col gap-0.5">
        <span className="font-semibold text-text-primary">{member.name}</span>
        {member.character ? (
          <span className="text-[13px] text-text-muted">{member.character}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
