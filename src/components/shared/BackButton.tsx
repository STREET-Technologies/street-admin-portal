import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  /** Fallback target when there's no browser history (e.g. direct URL hit). */
  to: string;
  label: string;
  /**
   * When true, use browser history (so a user who navigated from
   * `/retailers/X` to an order detail goes back to the retailer, not
   * to the generic orders list). Falls back to `to` if history is empty.
   */
  useHistory?: boolean;
}

export function BackButton({ to, label, useHistory = false }: BackButtonProps) {
  const navigate = useNavigate();

  function handleBack() {
    if (useHistory && window.history.length > 1) {
      window.history.back();
      return;
    }
    void navigate({ to });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 text-muted-foreground"
      onClick={handleBack}
    >
      <ArrowLeft className="size-4" />
      {label}
    </Button>
  );
}
