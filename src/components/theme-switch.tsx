import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Appearance = "system" | "light" | "dark";
const storageKey = "bitcoin-appearance";
const isAppearance = (value: unknown): value is Appearance =>
  value === "system" || value === "light" || value === "dark";

// Runs before first paint; no browser globals are evaluated during SSR.
export const appearanceScript = `(()=>{try{const p=localStorage.getItem("${storageKey}");const d=p==="dark"||(p!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch{document.documentElement.classList.toggle("dark",matchMedia("(prefers-color-scheme: dark)").matches)}})()`;

export function ThemeSwitch() {
  const [appearance, setAppearance] = useState<Appearance>("system");
  const preferenceRef = useRef<Appearance>("system");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const readPreference = () => {
      try {
        const value = window.localStorage.getItem(storageKey);
        return isAppearance(value) ? value : "system";
      } catch {
        return "system";
      }
    };
    const apply = (preference: Appearance) => {
      document.documentElement.classList.toggle("dark", preference === "dark" || (preference === "system" && media.matches));
    };
    const preference = readPreference();
    preferenceRef.current = preference;
    setAppearance(preference);
    apply(preference);
    const onSystemChange = () => apply(preferenceRef.current);
    const onStorageChange = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      preferenceRef.current = readPreference();
      setAppearance(preferenceRef.current);
      apply(preferenceRef.current);
    };
    media.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorageChange);
    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorageChange);
    };
  }, []);

  function choose(value: string) {
    if (!isAppearance(value)) return;
    preferenceRef.current = value;
    try { window.localStorage.setItem(storageKey, value); } catch { /* Preference still works without storage. */ }
    document.documentElement.classList.toggle("dark", value === "dark" || (value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches));
    setAppearance(value);
  }

  const Icon = appearance === "system" ? Monitor : appearance === "dark" ? Moon : Sun;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="size-11 shrink-0 rounded-control bg-surface text-muted-foreground" aria-label="Change appearance" title={`Appearance: ${appearance}`}>
          <Icon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={appearance} onValueChange={choose}>
          <DropdownMenuRadioItem value="light" className="min-h-11 gap-2"><Sun className="size-4" />Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="min-h-11 gap-2"><Moon className="size-4" />Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="min-h-11 gap-2"><Monitor className="size-4" />System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}