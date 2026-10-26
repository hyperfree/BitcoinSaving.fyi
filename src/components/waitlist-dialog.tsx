import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function MailGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.75" y="9" width="18.5" height="12" rx="3.5" />
      <path d="M3.4 11.4l6.6 4.9a3.3 3.3 0 0 0 4 0l6.6-4.9" />
      <path d="M8.5 4.75h7" />
      <path d="M7.25 7.25h9.5" />
    </svg>
  );
}

export function WaitlistDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const trimmed = email.trim();
  const valid = EMAIL_PATTERN.test(trimmed);

  const submit = async () => {
    if (!valid) return;
    setSending(true);
    const { error } = await supabase.from("waitlist").insert({ email: trimmed });
    setSending(false);
    if (error) {
      toast.error("Could not join the waitlist", { description: "Please try again in a moment." });
      return;
    }
    toast.success("You're on the list!");
    setEmail("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="left-1/2 top-auto bottom-[calc(max(1rem,env(safe-area-inset-bottom))+5.5rem)] flex w-[calc(100%-2rem)] max-w-[26rem] translate-x-[-50%] translate-y-0 flex-col items-center justify-center min-h-[46vh] gap-8 rounded-4xl sm:rounded-4xl border-border/60 bg-card/80 p-8 shadow-lg shadow-foreground/10 backdrop-blur-xl sm:p-10">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-bitcoin/10 text-bitcoin">
          <MailGlyph className="size-7" />
        </div>
        <DialogTitle className="text-2xl font-semibold tracking-tight">
          Early Access
        </DialogTitle>
        <div className="flex w-full flex-col gap-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="you@example.com"
            maxLength={255}
            autoComplete="email"
            className="h-14 rounded-control px-5 text-[15px]"
          />
          <Button
            onClick={submit}
            disabled={sending || !valid}
            className="h-14 rounded-control bg-bitcoin text-[19px] font-normal text-bitcoin-foreground hover:bg-bitcoin/90"
          >
            <span className="font-numeral tracking-normal">
              {sending ? "Joining…" : "Join Waitlist"}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
