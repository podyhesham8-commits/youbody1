import { Bookmark, Clock3, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/hub/video-card";
import { useHubStore } from "@/lib/hub-store";
import type { HubVideo } from "@/lib/youtube";

type LibraryTab = "liked" | "saved" | "recent";

export function LibraryView() {
  const liked = useHubStore((s) => Object.values(s.liked));
  const saved = useHubStore((s) => Object.values(s.saved));
  const recents = useHubStore((s) => s.recents);
  const openVideo = useHubStore((s) => s.openVideo);
  const [tab, setTab] = useState<LibraryTab>("liked");

  const items: Record<LibraryTab, HubVideo[]> = {
    liked,
    saved,
    recent: recents,
  };

  const list = items[tab];

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="text-xs tracking-[0.2em] text-blue uppercase">Library</p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">Your collection</h1>
        <p className="mt-1 text-sm text-muted">Likes, saves, and recently watched — stored on this device.</p>
      </header>
      <div className="flex gap-2">
        <Button size="sm" variant={tab === "liked" ? "crimson" : "glass"} onClick={() => setTab("liked")}>
          <Heart className="size-4" />
          Liked
        </Button>
        <Button size="sm" variant={tab === "saved" ? "blue" : "glass"} onClick={() => setTab("saved")}>
          <Bookmark className="size-4" />
          Saved
        </Button>
        <Button size="sm" variant={tab === "recent" ? "orange" : "glass"} onClick={() => setTab("recent")}>
          <Clock3 className="size-4" />
          Recent
        </Button>
      </div>
      {list.length === 0 ? (
        <div className="glass rounded-xl px-6 py-16 text-center text-sm text-muted">
          Nothing here yet. Like or save a video from the feed or reels.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {list.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} onOpen={openVideo} />
          ))}
        </div>
      )}
    </div>
  );
}
