import { useEffect, useRef, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import fiveDollarNote from "@/assets/banknotes/five-dollar-note.webp";
import twentyDollarNote from "@/assets/banknotes/twenty-dollar-note.webp";
import fiftyDollarNote from "@/assets/banknotes/fifty-dollar-note.webp";

const PRESETS = [
  { amount: 5, image: fiveDollarNote },
  { amount: 20, image: twentyDollarNote },
  { amount: 50, image: fiftyDollarNote },
] as const;

type AmountSelectorProps = {
  value: number;
  custom: boolean;
  onChange: (amount: number, custom: boolean) => void;
  aside?: ReactNode;
};

function haptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(8);
}

function Bill({ amount, image }: { amount: number; image: string }) {
  return (
    <div aria-hidden="true" className="bill-art">
      <img src={image} alt="" loading="lazy" width={1024} height={512} className={`bill-image bill-image-${amount}`} />
      <span className="sr-only">${amount}</span>
    </div>
  );
}

export function AmountSelector({ value, custom, onChange, aside }: AmountSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (custom) inputRef.current?.focus();
  }, [custom]);

  return (
    <fieldset>
      <legend className="sr-only">Regular amount</legend>
      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {PRESETS.map(({ amount, image }) => {
          const selected = !custom && value === amount;
          return (
            <button
              key={amount}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                haptic();
                onChange(amount, false);
              }}
              className={cn("amount-card banknote-card", selected && "amount-card-selected")}
            >
              <Bill amount={amount} image={image} />
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-2 items-center gap-3 sm:mt-5 sm:gap-5">
        <button
          type="button"
          aria-pressed={custom}
          onClick={() => {
            haptic();
            onChange(custom ? value : 100, true);
          }}
          className={cn("amount-card amount-custom", custom && "amount-card-selected")}
        >
          <span className="shrink-0 text-[13px] font-normal text-muted-foreground/70">Custom</span>
          <label className="flex h-9 min-w-0 flex-1 items-center justify-end px-1 text-lg font-normal text-foreground">
            <span aria-hidden="true" className="text-muted-foreground">$</span>
            <Input
              ref={inputRef}
              aria-label="Custom investment amount"
              type="number"
              min="1"
              max="9999"
              step="1"
              value={custom ? value : ""}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => onChange(Math.min(9999, Math.max(1, Number(event.target.value) || 1)), true)}
              className="h-9 w-16 min-w-0 border-0 bg-transparent px-1 text-left text-lg font-normal shadow-none focus-visible:ring-0 md:text-lg"
            />
          </label>
        </button>
        <div className="min-w-0">{aside}</div>
      </div>
    </fieldset>
  );
}
