import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreatePromotionalCodeMutation } from "../api/referral-queries";

interface CreatePromotionalCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePromotionalCodeDialog({
  open,
  onOpenChange,
}: CreatePromotionalCodeDialogProps) {
  const [code, setCode] = useState("");
  const [belongsTo, setBelongsTo] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("");

  const mutation = useCreatePromotionalCodeMutation();

  function resetForm() {
    setCode("");
    setBelongsTo("");
    setExpiresAt("");
    setMaxUses("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Code is required");
      return;
    }

    mutation.mutate(
      {
        code: code.trim().toUpperCase(),
        belongsTo: belongsTo.trim() || undefined,
        expiresAt: expiresAt || undefined,
        maxUses: maxUses ? Number(maxUses) : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Promotional code created");
          resetForm();
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to create code",
          );
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Promotional Code</DialogTitle>
          <DialogDescription>
            Create a referral code for marketing campaigns. It won't be linked
            to any user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="promo-code">Code</Label>
            <Input
              id="promo-code"
              placeholder="e.g. SUMMER25"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-belongs-to">Campaign (optional)</Label>
            <Input
              id="promo-belongs-to"
              placeholder="e.g. Summer 2025 campaign"
              value={belongsTo}
              onChange={(e) => setBelongsTo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-expires">Expires (optional)</Label>
            <Input
              id="promo-expires"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-max-uses">Max uses (optional)</Label>
            <Input
              id="promo-max-uses"
              type="number"
              min={1}
              placeholder="Unlimited"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-1.5 size-4 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
