/**
 * useApi hook
 * Data fetching with loading and error state management
 */

import { useState, useEffect, useCallback } from "react";
import { handleError } from "../lib/errorHandler";

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
}

export function useApi<T>(
  fetchFn: () => Promise<T>,
  immediate = true
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetchFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState({ data: null, loading: false, error: err });
      handleError(error, "useApi");
    }
  }, [fetchFn]);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }));
  }, []);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    ...state,
    refetch: fetchData,
    setData,
  };
}

// Hook for manual API calls (e.g., form submissions)
export function useApiMutation<TData, TVariables = void>() {
  const [state, setState] = useState<UseApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (
      mutateFn: (variables: TVariables) => Promise<TData>,
      variables: TVariables
    ): Promise<TData | null> => {
      setState({ data: null, loading: true, error: null });

      try {
        const data = await mutateFn(variables);
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, loading: false, error: err });
        handleError(error, "useApiMutation");
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}
