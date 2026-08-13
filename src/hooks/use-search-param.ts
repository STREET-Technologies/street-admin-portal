import { useNavigate, useSearch } from "@tanstack/react-router";

/**
 * Syncs one string filter with a URL search param.
 *
 * Extracted from useTabParam (TT-447), which now delegates here, so a
 * URL-backed filter is one mechanism rather than a copy per feature.
 *
 * `replace: true` keeps filter changes out of browser history — otherwise
 * Back would step through every intermediate filter state instead of leaving
 * the page. Setting the value to undefined, or to the default, strips the
 * param so shared links stay clean.
 */
export function useSearchParamState(
  key: string,
  defaultValue?: string,
): [string | undefined, (value: string | undefined) => void] {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const current = (search[key] as string | undefined) ?? defaultValue;

  function setValue(next: string | undefined) {
    void navigate({
      to: ".",
      search: (prev) => ({
        ...(prev as Record<string, unknown>),
        [key]: next === defaultValue || next === "" ? undefined : next,
      }),
      replace: true,
    });
  }

  return [current, setValue];
}
