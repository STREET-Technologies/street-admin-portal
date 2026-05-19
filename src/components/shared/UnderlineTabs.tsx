import * as React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * "Underline" tab style used across the portal — see DESIGN.md.
 *
 * Sits on a 1px border underline that runs across the row. Active tab
 * uses the lime brand fill + near-black text (same pairing as the NEW
 * status pill), with a top-rounded corner and -1px bottom overlap so it
 * visually merges with the underline below.
 *
 * Use this wrapper anywhere the underline tab pattern is wanted:
 *   <Tabs defaultValue="overview">
 *     <UnderlineTabsList>
 *       <UnderlineTabsTrigger value="overview">Overview</UnderlineTabsTrigger>
 *       ...
 *     </UnderlineTabsList>
 *     ...
 *   </Tabs>
 *
 * Pairs with shadcn's <Tabs> and <TabsContent>.
 */

export function UnderlineTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      className={cn(
        "h-auto w-full justify-start gap-1 rounded-none border-b border-border bg-transparent p-0",
        className,
      )}
      {...props}
    />
  );
}

export function UnderlineTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn(
        "relative -mb-px rounded-b-none rounded-t-md border-b-2 border-transparent bg-transparent px-3 pb-2 pt-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground data-[state=active]:border-brand data-[state=active]:bg-brand data-[state=active]:text-brand-foreground data-[state=active]:shadow-none",
        className,
      )}
      {...props}
    />
  );
}
