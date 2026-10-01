import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Bookmark,
  Heart,
  LoaderCircle,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHubStore } from "@/lib/hub-store";
import { youtubeQuery } from "@/lib/youtube.fn";
import {
  formatAge,
  formatViews,
  sendPlayerCommand,
  shareVideo,
  youtubeEmbedUrl,
  type HubVideo,
  type YoutubeCommentsResult,
  type YoutubeFeedResult,
} from "@/lib/youtube";
import { cn } from "@/lib/utils";

function isFeedResult(value: unknown): value is YoutubeFeedResult {
  return typeof value === "object" && value !== null && "videos" in value;
}

function isCommentsResult(value: unknown): value is YoutubeCommentsResult {
  return typeof value === "object" && value !== null && "comments" in value;
}

function ActionFab({
  children,
  label,
  onClick,
  active,
  tone = "default",
}: {
  children: ReactNode;
  label?: string;
  onClick: () => void;
  active?: boolean;
  tone?: "default" | "crimson" | "blue" | "orange";
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "grid size-12 place-items-center rounded-full bg-fg/12 text-fg backdrop-blur-md hairline transition-[transform,background-color] duration-150 active:scale-[0.96]",
          active && tone === "crimson" && "bg-crimson text-fg glow-crimson",
          active && tone === "blue" && "bg-blue text-fg glow-blue",
          active && tone === "orange" && "bg-orange text-bg glow-orange",
        )}
      >
        {children}
      </button>
      {label && <span className="text-[10px] font-medium tabular-nums text-fg/85">{label}</span>}
    </div>
  );
}

function ReelSlide({
  video,
  active,
  muted,
  liked,
  saved,
  onLike,
  onSave,
  onShare,
  onComments,
  onToggleMute,
}: {
  video: HubVideo;
  active: boolean;
  muted: boolean;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onComments: () => void;
  onToggleMute: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [burst, setBurst] = useState(0);
  const lastTap = useRef(0);

  useEffect(() => {
    if (!active) {
      sendPlayerCommand(iframeRef.current, "pauseVideo");
      return;
    }
    sendPlayerCommand(iframeRef.current, "playVideo");
    sendPlayerCommand(iframeRef.current, muted ? "mute" : "unMute");
  }, [active, muted]);

  function handleTap() {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      if (!liked) onLike();
      setBurst((n) => n + 1);
    }
    lastTap.current = now;
  }

  return (
    <article className="snap-reel relative h-full w-full overflow-hidden bg-bg">
      {active ? (
        <iframe
          ref={iframeRef}
          title={video.title}
          src={youtubeEmbedUrl(video.id, {
            autoplay: true,
            mute: muted,
            controls: false,
            loop: true,
            origin: typeof window !== "undefined" ? window.location.origin : undefined,
          })}
          className="absolute inset-0 size-full scale-[1.18] border-0"
          allow="autoplay; encrypted-media; picture-in-picture"
        />
      ) : (
        <img src={video.thumbnail} alt="" className="absolute inset-0 size-full object-cover" />
      )}
      <button type="button" aria-label="Double tap to like" className="absolute inset-0 z-10" onClick={handleTap} />
      {burst > 0 && (
        <Heart
          key={burst}
          className="hub-heart-burst pointer-events-none absolute top-1/2 left-1/2 z-20 size-20 -translate-x-1/2 -translate-y-1/2 fill-crimson text-crimson"
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-2/5 bg-linear-to-t from-bg via-bg/55 to-transparent" />
      <div className="absolute top-1/2 right-3 z-30 flex -translate-y-1/2 flex-col items-center gap-3">
        <ActionFab active={liked} tone="crimson" label={formatViews(video.likeCount + (liked ? 1 : 0))} onClick={onLike}>
          <Heart className={cn("size-6", liked && "fill-current")} />
        </ActionFab>
        <ActionFab label="Chat" onClick={onComments}>
          <MessageCircle className="size-6" />
        </ActionFab>
        <ActionFab active={saved} tone="blue" label={saved ? "Saved" : "Save"} onClick={onSave}>
          <Bookmark className={cn("size-6", saved && "fill-current")} />
        </ActionFab>
        <ActionFab label="Share" onClick={onShare}>
          <Share2 className="size-6" />
        </ActionFab>
        <ActionFab label={muted ? "Muted" : "Sound"} onClick={onToggleMute}>
          {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </ActionFab>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-30 p-4 pr-16">
        <p className="text-sm font-semibold">{video.channelTitle}</p>
        <p className="mt-1 line-clamp-2 text-sm text-fg/90">{video.title}</p>
        <p className="mt-2 text-[11px] text-subtle tabular-nums">
          {formatViews(video.viewCount)} views · {formatAge(video.publishedAt)}
        </p>
      </div>
    </article>
  );
}

export function ReelsFeed() {
  const shortsQuery = useHubStore((s) => s.shortsQuery);
  const setShortsQuery = useHubStore((s) => s.setShortsQuery);
  const toggleLike = useHubStore((s) => s.toggleLike);
  const toggleSave = useHubStore((s) => s.toggleSave);
  const liked = useHubStore((s) => s.liked);
  const saved = useHubStore((s) => s.saved);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [commentsFor, setCommentsFor] = useState<HubVideo | null>(null);
  const [draft, setDraft] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const feed = useInfiniteQuery({
    queryKey: ["youtube-shorts", shortsQuery],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const result = await youtubeQuery({
        data: {
          kind: "shorts",
          query: shortsQuery.trim() || undefined,
          pageToken: pageParam,
        },
      });
      if (!isFeedResult(result)) return { videos: [], error: "Unexpected response" };
      return result;
    },
    getNextPageParam: (last) => last.nextPageToken,
  });

  const videos = useMemo(
    () => feed.data?.pages.flatMap((page) => page.videos) ?? [],
    [feed.data],
  );
  const error = feed.data?.pages[0]?.error || (feed.error instanceof Error ? feed.error.message : undefined);

  useEffect(() => {
    if (!activeId && videos[0]) setActiveId(videos[0].id);
  }, [videos, activeId]);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-reel-id]"));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible?.target.getAttribute("data-reel-id");
        if (id) setActiveId(id);
      },
      { root, threshold: 0.65 },
    );
    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, [videos.length]);

  const hasNextPage = feed.hasNextPage;
  const isFetchingNextPage = feed.isFetchingNextPage;
  const fetchNextPage = feed.fetchNextPage;

  useEffect(() => {
    if (!activeId || !hasNextPage || isFetchingNextPage) return;
    const index = videos.findIndex((video) => video.id === activeId);
    if (index >= videos.length - 2) void fetchNextPage();
  }, [activeId, videos, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const comments = useQuery({
    queryKey: ["yt-comments", commentsFor?.id],
    enabled: Boolean(commentsFor),
    queryFn: async () => {
      const result = await youtubeQuery({ data: { kind: "comments", videoId: commentsFor!.id } });
      if (!isCommentsResult(result)) return { comments: [], error: "Unexpected response" };
      return result;
    },
  });

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 lg:flex-row lg:items-stretch lg:justify-center lg:gap-6">
      <div className="relative mx-auto h-[calc(100dvh-7.5rem)] w-full max-w-[420px] overflow-hidden rounded-[28px] bg-bg hairline sm:h-[calc(100dvh-6.5rem)] lg:h-[min(820px,calc(100dvh-3rem))]">
        {feed.isLoading ? (
          <div className="grid h-full place-items-center">
            <LoaderCircle className="size-8 animate-spin text-orange" />
          </div>
        ) : error && videos.length === 0 ? (
          <div className="grid h-full place-items-center px-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="size-8 text-crimson" />
              <p className="text-sm text-muted">{error}</p>
              <Button variant="orange" onClick={() => feed.refetch()}>
                Try again
              </Button>
            </div>
          </div>
        ) : (
          <div ref={scrollerRef} className="snap-y-mandatory h-full overflow-y-auto">
            {videos.map((video) => (
              <div key={video.id} data-reel-id={video.id} className="h-full">
                <ReelSlide
                  video={video}
                  active={video.id === activeId}
                  muted={muted}
                  liked={Boolean(liked[video.id])}
                  saved={Boolean(saved[video.id])}
                  onLike={() => toggleLike(video)}
                  onSave={() => toggleSave(video)}
                  onComments={() => setCommentsFor(video)}
                  onToggleMute={() => setMuted((value) => !value)}
                  onShare={async () => {
                    const result = await shareVideo(video);
                    if (result === "copied") toast("Link copied");
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <aside className="hidden w-72 shrink-0 flex-col gap-4 pt-2 lg:flex">
        <div>
          <p className="text-xs tracking-[0.2em] text-orange uppercase">Reels</p>
          <h2 className="font-display mt-1 text-2xl font-semibold">Vertical feed</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            TikTok-style playback of live short-form clips. Double-tap to like, swipe for the next reel.
          </p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setShortsQuery(String(form.get("q") ?? ""));
          }}
        >
          <Input name="q" defaultValue={shortsQuery} placeholder="Search shorts" className="h-10" />
          <Button type="submit" variant="orange" className="shrink-0">
            Go
          </Button>
        </form>
      </aside>

      <Sheet open={Boolean(commentsFor)} onOpenChange={(open) => !open && setCommentsFor(null)}>
        <SheetContent side="bottom" className="flex flex-col p-4">
          <SheetTitle className="pr-10">Comments</SheetTitle>
          <p className="mt-1 line-clamp-2 text-xs text-muted">{commentsFor?.title}</p>
          <ScrollArea className="mt-4 h-[46dvh]">
            {comments.isLoading ? (
              <p className="text-sm text-muted">Loading comments…</p>
            ) : comments.data?.error ? (
              <p className="text-sm text-muted">{comments.data.error}</p>
            ) : (comments.data?.comments.length ?? 0) === 0 ? (
              <p className="text-sm text-muted">No comments available for this clip.</p>
            ) : (
              <ul className="flex flex-col gap-4 pr-3">
                {comments.data?.comments.map((comment) => (
                  <li key={comment.id} className="flex gap-3">
                    {comment.avatar ? (
                      <img
                        src={comment.avatar}
                        alt=""
                        className="size-9 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="grid size-9 place-items-center rounded-full bg-fg/8 text-xs">
                        {comment.author.slice(0, 1)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium">
                        {comment.author}
                        <span className="ml-2 font-normal text-subtle">{formatAge(comment.publishedAt)}</span>
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-fg/90">{comment.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft.trim()) return;
              toast("Comments stay on this device in the hub");
              setDraft("");
            }}
          >
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add a comment"
              className="h-10"
            />
            <Button type="submit" variant="glass">
              Send
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
