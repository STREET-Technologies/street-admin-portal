import { useNavigate, useSearch } from "@tanstack/react-router";

/**
 * Syncs an active tab value with the URL `?tab=` search param.
 *
 * - Reads the current tab from `?tab=`. If absent, returns `defaultTab`.
 * - `setTab` writes the new tab into the URL using `replace: true` so
 *   tab clicks don't pile up in browser history (back-button would cycle
 *   through tabs otherwise).
 * - When the user picks the default tab, the param is stripped from the
 *   URL for cleaner shareable links.
 *
 * Lets bookmarks, browser back/forward, and history-aware Back buttons
 * land the user on the same tab they were viewing.
 */
export function useTabParam(
  defaultTab: string,
): [string, (tab: string) => void] {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { tab?: string };
  const tab = search.tab ?? defaultTab;

  function setTab(newTab: string) {
    void navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        tab: newTab === defaultTab ? undefined : newTab,
      }),
      replace: true,
    });
  }

  return [tab, setTab];
}
