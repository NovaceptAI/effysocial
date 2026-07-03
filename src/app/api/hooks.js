// Shared TanStack Query hooks for the effy API — one line per page to consume.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { effyApi } from './effyApi';

export function usePosts(workspace) {
  return useQuery({
    queryKey: ['posts', workspace?.id],
    queryFn: () => effyApi.listPosts(workspace.id),
    enabled: !!workspace,
  });
}

export function useConversations(workspace) {
  return useQuery({
    queryKey: ['conversations', workspace?.id],
    queryFn: () => effyApi.listConversations(workspace.id),
    enabled: !!workspace,
  });
}

export function useReviews(workspace) {
  return useQuery({
    queryKey: ['reviews', workspace?.id],
    queryFn: () => effyApi.listReviews(workspace.id),
    enabled: !!workspace,
  });
}

export function useOrganicAnalytics(workspace) {
  return useQuery({
    queryKey: ['organic', workspace?.id],
    queryFn: () => effyApi.organicAnalytics(workspace.id),
    enabled: !!workspace,
  });
}

// Mutation that invalidates a query key on success.
export function useInvalidatingMutation(fn, keyFactory) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: keyFactory(vars) }),
  });
}
