import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Debounced value
 *
 * @example
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     fetchSuggestions(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
export const useDebounce = <T,>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to cancel the timeout if value changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for debouncing async functions with request cancellation
 * @param callback - The async function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 * @returns Object with debounced function, loading state, and cancel function
 *
 * @example
 * const { debouncedFn, isLoading, cancel } = useDebouncedCallback(
 *   async (term: string) => {
 *     const result = await getSearchSuggestions(term, 10);
 *     return result;
 *   },
 *   300
 * );
 */
export const useDebouncedCallback = <T extends (...args: any[]) => Promise<any>>(
  callback: T,
  delay: number = 300
) => {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = () => {
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Abort ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsLoading(false);
  };

  const debouncedFn = (...args: Parameters<T>) => {
    // Cancel previous request
    cancel();

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    // Set up new timeout
    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        await callback(...args);
      } catch (error) {
        // Only log if it's not an abort error
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Debounced callback error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    }, delay);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, []);

  return { debouncedFn, isLoading, cancel };
};
