import { QueryClient } from '@tanstack/react-query';

export const getQueryClient = (() => {
  let queryClient: QueryClient | undefined;
  return () => {
    if (!queryClient) {
      queryClient = new QueryClient();
    }
    return queryClient!;
  };
})();
