import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exampleService, ExampleData } from '../services/exampleService';

// Query Keys to manage cache invalidation
export const exampleKeys = {
  all: ['examples'] as const,
  detail: (id: number) => ['examples', id] as const,
};

// Hook for fetching all examples
export const useExamples = () => {
  return useQuery({
    queryKey: exampleKeys.all,
    queryFn: exampleService.getAll,
  });
};

// Hook for fetching a single example by ID
export const useExample = (id: number) => {
  return useQuery({
    queryKey: exampleKeys.detail(id),
    queryFn: () => exampleService.getById(id),
    enabled: !!id, // Only run the query if an ID is provided
  });
};

// Hook for creating a new example
export const useCreateExample = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newExample: Omit<ExampleData, 'id'>) => exampleService.create(newExample),
    onSuccess: () => {
      // Invalidate and refetch the 'all' query to show the new data
      queryClient.invalidateQueries({ queryKey: exampleKeys.all });
    },
  });
};
