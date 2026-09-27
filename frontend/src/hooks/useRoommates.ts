import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Roommate, RoommateRequest, StudentSuggestion } from '@/lib/types';
import { toast } from 'sonner';

export function useRoommates() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['roommates'] });
    queryClient.invalidateQueries({ queryKey: ['roommateRequests'] });
  };

  const roommatesQuery = useQuery({
    queryKey: ['roommates'],
    queryFn: () => api.get<Roommate[]>('/roommates/assignments'),
  });

  const requestsQuery = useQuery({
    queryKey: ['roommateRequests'],
    queryFn: () => api.get<RoommateRequest[]>('/roommates/requests'),
  });

  const searchStudents = useCallback(
    (search: string) => api.get<StudentSuggestion[]>(`/roommates/students?search=${encodeURIComponent(search)}`),
    [],
  );

  const createRequest = useMutation({
    mutationFn: (payload: { remove_roommates: string[]; add_roommates: Array<{ student_id?: string; name: string; course?: string; phone?: string }>; reason: string }) =>
      api.post<RoommateRequest>('/roommates/requests', payload),
    onSuccess: () => {
      invalidate();
      toast.success('Roommate change request submitted to admin.');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not submit roommate request'),
  });

  const decideRequest = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      api.patch<RoommateRequest>(`/roommates/requests/${id}/decide`, { status }),
    onSuccess: (request) => {
      invalidate();
      toast.success(request.status === 'approved' ? 'Roommate change approved.' : 'Roommate change request rejected.');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not update roommate request'),
  });

  return {
    roommates: roommatesQuery.data ?? [],
    requests: [...(requestsQuery.data ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    createRequest,
    decideRequest,
    searchStudents,
  };
}