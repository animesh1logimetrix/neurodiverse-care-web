import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disables automatic refetching when browser tab is focused
      retry: 1, // Number of retry attempts on failure before throwing error
      staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
    },
  },
});
