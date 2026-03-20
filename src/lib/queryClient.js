import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:   1000 * 60,      // 1 min before background refetch
      gcTime:      1000 * 60 * 5,  // 5 min cache retention
      retry:       1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
})
