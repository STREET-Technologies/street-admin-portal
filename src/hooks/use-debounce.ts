import { useEffect, useState } from "react";

/**
 * Debounces a value by the given delay.
 *
 * Returns the debounced value that only updates after the specified
 * number of milliseconds have elapsed since the last change.
 * Useful for search inputs where you want to avoid firing a request
 * on every keystroke.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
