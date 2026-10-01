import { useState } from "react";
import {
  Bookmark,
  Clapperboard,
  Compass,
  Menu,
  Search,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { YoutubeFeed } from "@/components/hub/youtube-feed";
import { ReelsFeed } from "@/components/hub/reels-feed";
import { LibraryView } from "@/components/hub/library-view";
import { VideoTheater } from "@/components/hub/video-theater";
import { OmniLogo } from "@/components/hub/logo";
import { useHubStore, type HubView } from "@/lib/hub-store";
import { cn } from "@/lib/utils";

const NAV: { id: HubView; label: string; hint: string; icon: typeof Youtube }[] = [
  { id: "feed", label: "YouTube Feed", hint: "Live trending", icon: Youtube },
  { id: "reels", label: "TikTok Reels", hint: "Vertical shorts", icon: Clapperboard },
  { id: "library", label: "Library", hint: "Saved locally", icon: Bookmark },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const view = useHubStore((s) => s.view);
  const setView = useHubStore((s) => s.setView);

  return (
    <nav className="flex flex-col gap-1.5">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = view === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setView(item.id);
              onNavigate?.();
            }}
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-left transition-[background-color,box-shadow,color] duration-150",
              active
                ? item.id === "reels"
                  ? "bg-orange/12 text-fg glow-orange"
                  : item.id === "library"
                    ? "bg-blue/12 text-fg glow-blue"
                    : "bg-crimson/12 text-fg glow-crimson"
                : "text-muted hover:bg-fg/6 hover:text-fg",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="min-w-0">
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="block text-[11px] text-subtle">{item.hint}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function SearchForm({ compact = false }: { compact?: boolean }) {
  const view = useHubStore((s) => s.view);
  const setQuery = useHubStore((s) => s.setQuery);
  const setShortsQuery = useHubStore((s) => s.setShortsQuery);
  const current = useHubStore((s) => (s.view === "reels" ? s.shortsQuery : s.query));

  return (
    <form
      className={cn("flex min-w-0 items-center gap-2", compact ? "w-full" : "w-full max-w-xl")}
      onSubmit={(event) => {
        event.preventDefault();
        const value = String(new FormData(event.currentTarget).get("q") ?? "");
        if (view === "reels") setShortsQuery(value);
        else setQuery(value);
      }}
    >
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
        <Input
          name="q"
          key={`${view}-${current}`}
          defaultValue={current}
          placeholder={view === "reels" ? "Search short-form clips" : "Search YouTube"}
          className="h-11 rounded-lg border-border bg-fg/5 pr-3 pl-10"
        />
      </div>
      <Button type="submit" variant={view === "reels" ? "orange" : "blue"} className="hidden sm:inline-flex">
        Search
      </Button>
    </form>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface/80 lg:flex">
      <div className="px-4 pt-5 pb-4">
        <OmniLogo />
      </div>
      <div className="px-3">
        <NavList />
      </div>
      <div className="mt-auto p-4">
        <div className="glass rounded-lg p-3">
          <p className="flex items-center gap-2 text-xs font-medium">
            <Compass className="size-3.5 text-blue" />
            Live aggregation
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            Trending YouTube videos and vertical shorts in one elite dark workspace.
          </p>
        </div>
      </div>
    </aside>
  );
}

function MobileNav() {
  const view = useHubStore((s) => s.view);
  const setView = useHubStore((s) => s.setView);

  return (
    <nav className="glass fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 gap-1 rounded-xl p-1 lg:hidden">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = view === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id)}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-medium",
              active ? "bg-fg/10 text-fg" : "text-muted",
            )}
          >
            <Icon className="size-4" />
            {item.id === "feed" ? "YouTube" : item.id === "reels" ? "Reels" : "Library"}
          </button>
        );
      })}
    </nav>
  );
}

export function HubApp() {
  const view = useHubStore((s) => s.view);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex min-h-dvh bg-bg text-fg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-50 h-px bg-linear-to-r from-blue via-crimson to-orange"
      />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass sticky top-0 z-30 flex items-center gap-3 border-b border-border px-3 py-3 sm:px-5">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>
          <div className="lg:hidden">
            <OmniLogo compact />
          </div>
          <SearchForm />
        </header>
        <main
          className={cn(
            "min-w-0 flex-1",
            view === "reels"
              ? "px-3 pt-3 pb-20 lg:px-6 lg:pt-4 lg:pb-4"
              : "px-3 py-5 pb-24 sm:px-6 lg:px-8",
          )}
        >
          {view === "feed" && <YoutubeFeed />}
          {view === "reels" && <ReelsFeed />}
          {view === "library" && <LibraryView />}
        </main>
      </div>
      <MobileNav />
      <VideoTheater />
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="flex flex-col p-4">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <OmniLogo className="mb-6" />
          <NavList onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
