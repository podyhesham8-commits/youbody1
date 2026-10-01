import { cn } from "@/lib/utils";

export function OmniLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 place-items-center rounded-md bg-surface hairline">
        <span className="absolute inset-0 rounded-md bg-blue/15 blur-md" aria-hidden />
        <svg viewBox="0 0 32 32" className="relative size-6" aria-hidden>
          <circle
            cx="16"
            cy="16"
            r="11"
            fill="none"
            stroke="var(--color-blue)"
            strokeWidth="1.6"
            opacity="0.95"
          />
          <circle
            cx="16"
            cy="16"
            r="6.5"
            fill="none"
            stroke="var(--color-crimson)"
            strokeWidth="1.4"
            opacity="0.95"
          />
          <circle cx="16" cy="16" r="2.4" fill="var(--color-orange)" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="font-display block text-[15px] font-bold tracking-tight">OmniVerse</span>
          <span className="block text-[10px] font-medium tracking-[0.22em] text-muted uppercase">Hub</span>
        </span>
      )}
    </div>
  );
}
