import { Play } from "lucide-react";
import type { HubVideo } from "@/lib/youtube";
import { formatAge, formatViews } from "@/lib/youtube";
import { cn } from "@/lib/utils";

export function VideoCard({
  video,
  onOpen,
  index = 0,
}: {
  video: HubVideo;
  onOpen: (video: HubVideo) => void;
  index?: number;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(video)}
      className="hub-enter group flex flex-col overflow-hidden rounded-xl bg-surface text-left hairline transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgb(59_130_246_/_0.35),0_12px_32px_rgb(0_0_0_/_0.45)]"
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      <span className="relative aspect-video overflow-hidden bg-panel">
        <img
          src={video.thumbnail}
          alt=""
          className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />
        <span className="absolute inset-0 grid place-items-center bg-bg/0 opacity-0 transition-[opacity,background-color] duration-200 group-hover:bg-bg/35 group-hover:opacity-100">
          <span className="grid size-12 place-items-center rounded-full bg-fg text-bg">
            <Play className="ml-0.5 size-5 fill-current" />
          </span>
        </span>
        <span className="absolute right-2 bottom-2 rounded-sm bg-bg/82 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-fg">
          {video.duration}
        </span>
      </span>
      <span className="flex flex-col gap-1 p-3">
        <span className="line-clamp-2 text-sm leading-snug font-medium">{video.title}</span>
        <span className="text-xs text-muted">{video.channelTitle}</span>
        <span className="text-[11px] text-subtle tabular-nums">
          {formatViews(video.viewCount)} views · {formatAge(video.publishedAt)}
        </span>
      </span>
    </button>
  );
}

export function VideoCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl bg-surface hairline", className)}>
      <div className="hub-shimmer aspect-video bg-fg/6" />
      <div className="flex flex-col gap-2 p-3">
        <div className="hub-shimmer h-4 w-11/12 rounded-sm bg-fg/6" />
        <div className="hub-shimmer h-3 w-1/2 rounded-sm bg-fg/6" />
      </div>
    </div>
  );
}
