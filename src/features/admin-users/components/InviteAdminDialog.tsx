import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api-client";
import { useSendInviteMutation } from "../api/invites-queries";
import type { AdminRole } from "../../auth/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteAdminDialog({ open, onOpenChange }: Props) {
  const [email, setEmail] = useState("");
  const [adminRole, setAdminRole] = useState<AdminRole>("support");
  const [sent, setSent] = useState(false);

  const mutation = useSendInviteMutation();

  function handleClose(value: boolean) {
    if (!value) {
      setEmail("");
      setAdminRole("support");
      setSent(false);
    }
    onOpenChange(value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    mutation.mutate(
      { email: email.trim(), adminRole },
      {
        onSuccess: () => setSent(true),
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            // Generic onError toast already fires from the mutation hook
            // No additional handling needed here
          }
        },
      },
    );
  }

  if (sent) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Sent</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="rounded-full bg-muted p-4">
              <Mail className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              An invite link has been sent to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              It expires in 7 days.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => handleClose(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={adminRole}
              onValueChange={(v) => setAdminRole(v as AdminRole)}
            >
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="admin">Admin — full access</SelectItem>
                <SelectItem value="support">Support — read + write users/orders</SelectItem>
                <SelectItem value="viewer">Viewer — read-only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Send Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
