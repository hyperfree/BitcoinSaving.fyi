import { Bug, Lightbulb, MessageSquareHeart, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const kinds = [
  { value: "feedback", label: "Feedback", icon: MessageSquareHeart },
  { value: "bug", label: "Bug report", icon: Bug },
  { value: "idea", label: "Feature idea", icon: Lightbulb },
] as const;

type Kind = (typeof kinds)[number]["value"];

export function FeedbackDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>("feedback");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setSending(true);
    const { error } = await supabase.from("feedback").insert({
      kind,
      message: trimmed,
      email: email.trim() || null,
      context: { url: window.location.href },
    });
    setSending(false);
    if (error) {
      toast.error("Could not send feedback", { description: "Please try again in a moment." });
      return;
    }
    toast.success("Thanks for your feedback!");
    setMessage("");
    setEmail("");
    setKind("feedback");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>
            Found a bug or have an idea to improve the simulator? Let us know.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Feedback type">
            {kinds.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={kind === value}
                onClick={() => setKind(value)}
                className={cn(
                  "flex h-11 items-center justify-center gap-1.5 rounded-control border border-border bg-surface text-sm font-medium text-muted-foreground transition-colors",
                  kind === value && "border-bitcoin/50 bg-bitcoin/10 text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what's on your mind…"
            rows={4}
            maxLength={2000}
            className="resize-none"
          />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional, for a reply)"
            maxLength={200}
          />
          <Button
            onClick={submit}
            disabled={sending || !message.trim()}
            className="h-12 rounded-control bg-bitcoin text-[15px] font-semibold text-bitcoin-foreground hover:bg-bitcoin/90"
          >
            <Send className="size-4" />
            {sending ? "Sending…" : "Send feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
