import { Bookmark, ExternalLink, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHubStore } from "@/lib/hub-store";
import {
  channelUrl,
  formatAge,
  formatViews,
  shareVideo,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from "@/lib/youtube";
import { cn } from "@/lib/utils";

export function VideoTheater() {
  const video = useHubStore((s) => s.activeVideo);
  const closeVideo = useHubStore((s) => s.closeVideo);
  const toggleLike = useHubStore((s) => s.toggleLike);
  const toggleSave = useHubStore((s) => s.toggleSave);
  const liked = useHubStore((s) => (video ? Boolean(s.liked[video.id]) : false));
  const saved = useHubStore((s) => (video ? Boolean(s.saved[video.id]) : false));

  return (
    <Dialog open={Boolean(video)} onOpenChange={(open) => !open && closeVideo()}>
      <DialogContent className="p-2 sm:p-3">
        {video && (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(16rem,0.9fr)]">
            <div className="overflow-hidden rounded-lg bg-bg">
              <div className="relative aspect-video">
                <iframe
                  title={video.title}
                  src={youtubeEmbedUrl(video.id, { autoplay: true, origin: window.location.origin })}
                  className="absolute inset-0 size-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-3 px-2 pb-3 lg:pt-8">
              <DialogTitle className="text-xl leading-snug">{video.title}</DialogTitle>
              <DialogDescription className="text-sm">
                <a
                  href={channelUrl(video.channelId)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-fg hover:text-blue"
                >
                  {video.channelTitle}
                </a>
                <span className="mt-1 block tabular-nums text-subtle">
                  {formatViews(video.viewCount)} views · {formatAge(video.publishedAt)}
                </span>
              </DialogDescription>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={liked ? "crimson" : "glass"}
                  size="sm"
                  onClick={() => toggleLike(video)}
                >
                  <Heart className={cn("size-4", liked && "fill-current")} />
                  {liked ? "Liked" : "Like"}
                </Button>
                <Button
                  variant={saved ? "blue" : "glass"}
                  size="sm"
                  onClick={() => toggleSave(video)}
                >
                  <Bookmark className={cn("size-4", saved && "fill-current")} />
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={async () => {
                    const result = await shareVideo(video);
                    if (result === "copied") toast("Link copied");
                    if (result === "shared") toast("Shared");
                  }}
                >
                  <Share2 className="size-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={youtubeWatchUrl(video.id)} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    YouTube
                  </a>
                </Button>
              </div>
              {video.description && (
                <p className="line-clamp-8 text-sm leading-relaxed text-muted whitespace-pre-wrap">
                  {video.description}
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
