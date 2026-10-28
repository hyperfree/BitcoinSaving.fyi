import { useEffect, useRef } from "react";

const FIRST = 2010;
const LAST = 2026;
const PX_PER_YEAR = 12;
const WHEEL_STEP = 40;

type YearBarProps = { value: number; onChange: (year: number) => void };

let audioCtx: AudioContext | null = null;
function tick() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) {
      audioCtx ??= new Ctx();
      const ctx = audioCtx;
      if (ctx.state === "suspended") void ctx.resume();
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.012);
      filter.type = "bandpass";
      filter.frequency.value = 1400;
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.014);
      osc.connect(filter).connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.02);
    }
  } catch {
    /* audio unavailable */
  }
  if ("vibrate" in navigator) navigator.vibrate(6);
}

export function YearBar({ value, onChange }: YearBarProps) {
  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const drag = useRef({ startX: 0, startYear: value });
  const wheelAcc = useRef(0);
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const set = (year: number) => {
    const next = Math.min(LAST, Math.max(FIRST, year));
    if (next !== valueRef.current) {
      valueRef.current = next;
      tick();
      onChangeRef.current(next);
    }
  };
  const setRef = useRef(set);
  setRef.current = set;

  // Native non-passive wheel listener so desktop scroll scrubs instead of scrolling the page.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      wheelAcc.current += d;
      while (Math.abs(wheelAcc.current) >= WHEEL_STEP) {
        const dir = Math.sign(wheelAcc.current);
        wheelAcc.current -= dir * WHEEL_STEP;
        setRef.current(valueRef.current + dir);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Ambient gradient drift; speeds up while dragging.
  useEffect(() => {
    let raf = 0;
    let phase = 0;
    let speed = 0.25;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const target = dragging.current ? 3.4 : 0.25;
      speed += (target - speed) * Math.min(1, dt * 3);
      phase += speed * dt;
      if (layer.current) {
        layer.current.style.transform = `translate3d(${Math.sin(phase) * 16}px, ${Math.cos(phase * 0.8) * 7}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const neighbors = [value - 1, value, value + 1];

  return (
    <div
      ref={root}
      role="slider"
      tabIndex={0}
      aria-label="Year"
      aria-valuemin={FIRST}
      aria-valuemax={LAST}
      aria-valuenow={value}
      className="year-bar"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); set(value - 1); }
        if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); set(value + 1); }
      }}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.focus({ preventScroll: true });
        dragging.current = true;
        drag.current = { startX: e.clientX, startYear: valueRef.current };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        // Drag right reveals earlier years, like pulling a strip.
        const delta = Math.round((e.clientX - drag.current.startX) / PX_PER_YEAR);
        set(drag.current.startYear - delta);
      }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}
    >
      <div ref={layer} className="year-bar-gradient" aria-hidden="true" />
      <div className="year-bar-strip" aria-hidden="true">
        {neighbors.map((y, i) => (
          <span key={i} className={i === 1 ? "year-bar-year year-bar-year-active" : "year-bar-year"}>
            {y >= FIRST && y <= LAST ? y : ""}
            {i === 1 && <span className="year-bar-caption">Starting year</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
