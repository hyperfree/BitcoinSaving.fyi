import { useState } from "react";
import { PiggyBank, ChartLine, Lightbulb, Newspaper, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { WaitlistDialog } from "@/components/waitlist-dialog";

const items = [
  { id: "dca", label: "DCA", icon: PiggyBank, href: "/" },
  { id: "charts", label: "Charts", icon: ChartLine, href: "https://bitcoincounterflow.com/signup?ref=7206" },
  { id: "learn", label: "Learn", icon: Lightbulb, href: "https://dca-signals.com" },
  { id: "news", label: "News", icon: Newspaper, href: "https://lightning.news" },
  { id: "profile", label: "Profile", icon: UserRound, href: "#" },
] as const;

export function NavDock() {
  const [active, setActive] = useState<string>("dca");
  const index = items.findIndex((i) => i.id === active);

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 mx-auto w-max"
    >
      <div className="relative grid grid-cols-5 rounded-full border border-border/60 bg-card/80 p-1.5 shadow-lg shadow-foreground/10 backdrop-blur-xl">
        <span
          aria-hidden="true"
          className="absolute inset-y-1.5 left-1.5 w-16 rounded-full bg-foreground/[0.07] transition-transform duration-300 ease-out sm:w-[4.5rem]"
          style={{ transform: `translateX(${index * 100}%)` }}
        />
        {items.map(({ id, label, icon: Icon, href }) => {
          const isActive = id === active;
          const itemClass = cn(
            "relative z-10 flex h-14 w-16 flex-col items-center justify-center gap-1 rounded-full transition-colors sm:w-[4.5rem]",
            isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          );
          const content = (
            <>
              <Icon className="size-[22px]" strokeWidth={isActive ? 2 : 1.75} />
              <span className={cn("text-[11px] leading-none", isActive ? "font-semibold" : "font-medium")}>
                {label}
              </span>
            </>
          );

          if (id === "profile") {
            return (
              <WaitlistDialog key={id}>
                <button
                  type="button"
                  onClick={() => setActive(id)}
                  aria-current={isActive ? "page" : undefined}
                  className={itemClass}
                >
                  {content}
                </button>
              </WaitlistDialog>
            );
          }

          return (
            <a
              key={id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-current={isActive ? "page" : undefined}
              className={itemClass}
            >
              {content}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
