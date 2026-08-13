import { useSearchParamState } from "@/hooks/use-search-param";

/**
 * Syncs an active tab value with the URL `?tab=` search param.
 *
 * Thin wrapper over useSearchParamState (TT-447) — the URL-writing behaviour
 * lives there so tabs and filters share one implementation. Picking the
 * default tab strips the param, keeping shared links clean.
 */
export function useTabParam(
  defaultTab: string,
): [string, (tab: string) => void] {
  const [tab, setTab] = useSearchParamState("tab", defaultTab);
  return [tab ?? defaultTab, (next: string) => setTab(next)];
}
