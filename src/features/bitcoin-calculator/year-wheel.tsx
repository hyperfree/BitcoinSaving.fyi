import { useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const YEARS = Array.from({ length: new Date().getUTCFullYear() - 2009 }, (_, index) => 2010 + index);

type YearWheelProps = { value: number; onChange: (year: number) => void };

export function YearWheel({ value, onChange }: YearWheelProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const valueRef = useRef(value);
  valueRef.current = value;
  // True only while the user is actively scrolling (touch, wheel, drag) — programmatic re-centering must never pick a year.
  const userScrolling = useRef(false);

  useEffect(() => {
    const root = scroller.current;
    const target = root?.querySelector<HTMLElement>(`[data-year="${value}"]`);
    if (!root || !target) return;
    userScrolling.current = false;
    clearTimeout(scrollTimer.current);
    root.scrollTo({ left: target.offsetLeft - (root.clientWidth - target.offsetWidth) / 2 });
  }, [value]);

  const markUserScroll = () => {
    userScrolling.current = true;
  };

  const step = (delta: number) => {
    const firstYear = YEARS[0] ?? value;
    const lastYear = YEARS.at(-1) ?? value;
    const next = Math.min(lastYear, Math.max(firstYear, value + delta));
    onChange(next);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(6);
  };

  return (
    <div className="flex w-full min-w-0 items-center">
      <Button type="button" variant="ghost" size="icon" aria-label="Previous year" onClick={() => step(-1)} className="hidden">
        <ChevronUp className="-rotate-90" />
      </Button>
      <div className="year-wheel-shell">
        <div className="year-wheel-highlight" aria-hidden="true" />
        <div
          ref={scroller}
          role="listbox"
          aria-label="Starting year"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowUp") step(-1);
            if (event.key === "ArrowRight" || event.key === "ArrowDown") step(1);
          }}
          onPointerDown={markUserScroll}
          onTouchStart={markUserScroll}
          onWheel={markUserScroll}
          onScroll={() => {
            if (!userScrolling.current) return;
            clearTimeout(scrollTimer.current);
            scrollTimer.current = setTimeout(() => {
              const root = scroller.current;
              if (!root || !userScrolling.current) return;
              const current = valueRef.current;
              const center = root.scrollLeft + root.clientWidth / 2;
              let closest = current;
              let distance = Number.POSITIVE_INFINITY;
              root.querySelectorAll<HTMLElement>("[data-year]").forEach((item) => {
                const itemCenter = item.offsetLeft + item.offsetWidth / 2;
                const nextDistance = Math.abs(itemCenter - center);
                if (nextDistance < distance) {
                  distance = nextDistance;
                  closest = Number(item.dataset["year"]);
                }
              });
              userScrolling.current = false;
              if (closest !== current) onChange(closest);
            }, 120);
          }}
          className="year-wheel"
        >
          <div className="year-wheel-spacer" />
          {YEARS.map((year) => (
            <button
              key={year}
              data-year={year}
              type="button"
              role="option"
              aria-selected={year === value}
              onClick={() => onChange(year)}
              className={cn("year-option", Math.abs(year - value) === 1 && "year-option-adjacent", year === value && "year-option-active")}
            >
              {year}
            </button>
          ))}
          <div className="year-wheel-spacer" />
        </div>
      </div>
      <Button type="button" variant="ghost" size="icon" aria-label="Next year" onClick={() => step(1)} className="hidden">
        <ChevronDown className="-rotate-90" />
      </Button>
    </div>
  );
}
