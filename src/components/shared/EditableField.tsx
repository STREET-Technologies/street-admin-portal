import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Inline editable field with pencil icon on hover.
 *
 * Default state: label + value (read-only) with pencil icon on hover.
 * Editing state: label + input + save/cancel icon buttons.
 * While saving: spinner on save button, input disabled.
 * On success: reverts to read-only, shows toast.
 * On error: reverts to previous value, shows error toast.
 */

interface EditableFieldProps {
  /** Label displayed above the value. */
  label: string;
  /** The current text value to display and edit. */
  value: string;
  /** Async callback to save the new value. Should throw on error. */
  onSave: (newValue: string) => Promise<void>;
  /** Use monospace font for the value. */
  mono?: boolean;
  /** Disable editing. */
  disabled?: boolean;
  className?: string;
}

export function EditableField({
  label,
  value,
  onSave,
  mono = false,
  disabled = false,
  className,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync editValue when the external value changes (e.g. after refetch)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function startEditing() {
    if (disabled || isSaving) return;
    setEditValue(value);
    setIsEditing(true);
  }

  function cancelEditing() {
    setEditValue(value);
    setIsEditing(false);
  }

  async function handleSave() {
    const trimmed = editValue.trim();

    // No change -- just cancel
    if (trimmed === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(trimmed);
      toast.success("Field updated");
      setIsEditing(false);
    } catch {
      toast.error("Failed to update field");
      setEditValue(value);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleSave();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  }

  // ---------- Editing mode ----------
  if (isEditing) {
    return (
      <div className={cn("space-y-1", className)}>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1.5">
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            className={cn("h-8 text-sm", mono && "font-mono text-xs")}
          />
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
            aria-label="Save"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={cancelEditing}
            disabled={isSaving}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
            aria-label="Cancel"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ---------- Read-only mode ----------
  return (
    <div className={cn("group/field space-y-1", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className={cn("text-sm", mono && "font-mono text-xs")}>
          {value}
        </span>
        {!disabled && (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground opacity-40 transition-opacity hover:bg-accent hover:text-foreground group-hover/field:opacity-100"
            aria-label={`Edit ${label.toLowerCase()}`}
          >
            <Pencil className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
}
