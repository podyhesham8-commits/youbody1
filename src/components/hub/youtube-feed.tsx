import { useInfiniteQuery } from "@tanstack/react-query";
import { AlertCircle, Compass, LoaderCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoCard, VideoCardSkeleton } from "@/components/hub/video-card";
import { useHubStore } from "@/lib/hub-store";
import { youtubeQuery } from "@/lib/youtube.fn";
import { CATEGORIES, REGIONS, type YoutubeFeedResult } from "@/lib/youtube";

function isFeedResult(value: unknown): value is YoutubeFeedResult {
  return typeof value === "object" && value !== null && "videos" in value;
}

export function YoutubeFeed() {
  const query = useHubStore((s) => s.query);
  const region = useHubStore((s) => s.region);
  const categoryId = useHubStore((s) => s.categoryId);
  const setRegion = useHubStore((s) => s.setRegion);
  const setCategoryId = useHubStore((s) => s.setCategoryId);
  const openVideo = useHubStore((s) => s.openVideo);
  const kind = query.trim() ? "search" : "trending";

  const feed = useInfiniteQuery({
    queryKey: ["youtube-feed", kind, query, region, categoryId],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const result = await youtubeQuery({
        data: {
          kind,
          query: query.trim() || undefined,
          region,
          categoryId: categoryId || undefined,
          pageToken: pageParam,
        },
      });
      if (!isFeedResult(result)) return { videos: [], error: "Unexpected response" };
      return result;
    },
    getNextPageParam: (last) => last.nextPageToken,
  });

  const videos = feed.data?.pages.flatMap((page) => page.videos) ?? [];
  const error = feed.data?.pages[0]?.error || (feed.error instanceof Error ? feed.error.message : undefined);
  const regionLabel = REGIONS.find((item) => item.id === region)?.label ?? region;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="crimson">YouTube</Badge>
              <span className="text-xs tracking-wide text-subtle uppercase">Live catalog</span>
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {query.trim() ? `Results for “${query.trim()}”` : "YouTube Feed"}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted">
              {query.trim()
                ? "Pulled live from YouTube search."
                : `Trending right now in ${regionLabel}.`}
            </p>
          </div>
        </div>
        {!query.trim() && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {REGIONS.map((item) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant={region === item.id ? "blue" : "glass"}
                  onClick={() => setRegion(item.id)}
                  className="shrink-0"
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((item) => (
                <Button
                  key={item.id || "all"}
                  size="sm"
                  variant={categoryId === item.id ? "crimson" : "ghost"}
                  onClick={() => setCategoryId(item.id)}
                  className="shrink-0"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </header>

      {feed.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : error && videos.length === 0 ? (
        <div className="glass flex flex-col items-center gap-3 rounded-xl px-6 py-16 text-center">
          <AlertCircle className="size-8 text-crimson" />
          <p className="max-w-md text-sm text-muted">{error}</p>
          <Button variant="blue" onClick={() => feed.refetch()}>
            Try again
          </Button>
        </div>
      ) : videos.length === 0 ? (
        <div className="glass flex flex-col items-center gap-3 rounded-xl px-6 py-16 text-center">
          <Compass className="size-8 text-blue" />
          <p className="text-sm text-muted">No videos matched that search.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {videos.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} onOpen={openVideo} />
            ))}
          </div>
          {feed.hasNextPage && (
            <div className="flex justify-center pt-2 pb-8">
              <Button
                variant="glass"
                onClick={() => feed.fetchNextPage()}
                disabled={feed.isFetchingNextPage}
              >
                {feed.isFetchingNextPage && <LoaderCircle className="size-4 animate-spin" />}
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
