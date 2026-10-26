import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Frequency } from "./calculator";

const FREQUENCIES: Array<{ value: Frequency; label: string }> = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
];

type FrequencyWheelProps = {
  value: Frequency;
  onChange: (frequency: Frequency) => void;
};

export function FrequencyWheel({ value, onChange }: FrequencyWheelProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const root = scroller.current;
    const target = root?.querySelector<HTMLElement>(`[data-frequency="${value}"]`);
    if (!root || !target) return;
    const center = () => {
      root.scrollTo({ left: target.offsetLeft - (root.clientWidth - target.offsetWidth) / 2 });
    };
    center();
    // Re-center once layout has settled (fonts, images, container sizing) and
    // whenever the wheel's width changes, so the selection stays centered.
    const frame = requestAnimationFrame(center);
    const observer = new ResizeObserver(center);
    observer.observe(root);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [value]);

  const choose = (frequency: Frequency) => {
    onChange(frequency);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(6);
  };

  return (
    <div className="year-wheel-shell">
      <div className="year-wheel-highlight" aria-hidden="true" />
      <div
        ref={scroller}
        role="listbox"
        aria-label="Purchase frequency"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          const current = FREQUENCIES.findIndex((item) => item.value === value);
          const next = Math.max(0, Math.min(FREQUENCIES.length - 1, current + (event.key === "ArrowRight" ? 1 : -1)));
          const frequency = FREQUENCIES[next]?.value;
          if (frequency) choose(frequency);
        }}
        onScroll={() => {
          clearTimeout(scrollTimer.current);
          scrollTimer.current = setTimeout(() => {
            const root = scroller.current;
            if (!root) return;
            const center = root.scrollLeft + root.clientWidth / 2;
            let closest = value;
            let distance = Number.POSITIVE_INFINITY;
            root.querySelectorAll<HTMLElement>("[data-frequency]").forEach((item) => {
              const nextDistance = Math.abs(item.offsetLeft + item.offsetWidth / 2 - center);
              const frequency = item.dataset["frequency"] as Frequency | undefined;
              if (frequency && nextDistance < distance) {
                distance = nextDistance;
                closest = frequency;
              }
            });
            if (closest !== value) choose(closest);
          }, 80);
        }}
        className="year-wheel"
      >
        <div className="year-wheel-spacer" />
        {FREQUENCIES.map((item) => (
          <button
            key={item.value}
            type="button"
            role="option"
            aria-selected={item.value === value}
            data-frequency={item.value}
            onClick={() => choose(item.value)}
            className={cn("year-option", item.value === value && "year-option-active")}
          >
            {item.label}
          </button>
        ))}
        <div className="year-wheel-spacer" />
      </div>
    </div>
  );
}