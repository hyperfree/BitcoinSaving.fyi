import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FIRST = 2010;
const LAST = new Date().getUTCFullYear();
const PX_PER_YEAR = 12;

type YearBarProps = { value: number; onChange: (year: number) => void };

let audioCtx: AudioContext | null = null;
function click() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    audioCtx ??= new Ctx();
    const ctx = audioCtx;
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.025);
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.035);
  } catch {
    /* audio unavailable */
  }
  if ("vibrate" in navigator) navigator.vibrate(6);
}

export function YearBar({ value, onChange }: YearBarProps) {
  const layer = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const drag = useRef({ startX: 0, startYear: value });
  const valueRef = useRef(value);
  valueRef.current = value;

  const set = (year: number) => {
    const next = Math.min(LAST, Math.max(FIRST, year));
    if (next !== valueRef.current) {
      valueRef.current = next;
      click();
      onChange(next);
    }
  };

  // Ambient gradient drift; speeds up while dragging.
  useEffect(() => {
    let raf = 0;
    let phase = 0;
    let speed = 0.25;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = dragging.current ? 3.4 : 0.25;
      speed += (target - speed) * Math.min(1, dt * 4);
      phase += speed * dt;
      if (layer.current) {
        layer.current.style.transform = `translate3d(${Math.sin(phase) * 16}px, ${Math.cos(phase * 0.8) * 7}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Starting year"
      aria-valuemin={FIRST}
      aria-valuemax={LAST}
      aria-valuenow={value}
      className="year-bar"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); set(value - 1); }
        if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); set(value + 1); }
      }}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        dragging.current = true;
        drag.current = { startX: e.clientX, startYear: valueRef.current };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        const delta = Math.round((e.clientX - drag.current.startX) / PX_PER_YEAR);
        set(drag.current.startYear + delta);
      }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}
    >
      <div ref={layer} className="year-bar-gradient" aria-hidden="true" />
      <button type="button" aria-label="Previous year" onClick={() => set(value - 1)} className="year-bar-chevron">
        <ChevronLeft className="size-5" />
      </button>
      <div className="relative z-10 flex flex-col items-center select-none">
        <span className="text-[11px] uppercase tracking-[0.18em] text-result-muted">Starting year</span>
        <span className="font-numeral text-4xl leading-none tabular-nums text-result-foreground">{value}</span>
      </div>
      <button type="button" aria-label="Next year" onClick={() => set(value + 1)} className="year-bar-chevron">
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
