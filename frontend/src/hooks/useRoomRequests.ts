import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { RoomRequest, RoomRequestStatus } from '@/lib/types';
import { toast } from 'sonner';

export function useRoomRequests() {
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: ['roomRequests'],
    queryFn: () => api.get<RoomRequest[]>('/room-requests'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['roomRequests'] });

  const createRequest = useMutation({
    mutationFn: ({ requested_room, reason }: { requested_room: string; reason: string }) =>
      api.post<RoomRequest>('/room-requests', { requested_room, reason }),
    onSuccess: () => {
      invalidate();
      toast.success('Room change request submitted to admin.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not submit request');
    },
  });

  const decideRequest = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RoomRequestStatus }) =>
      api.patch<RoomRequest>(`/room-requests/${id}/decide`, { status }),
    onSuccess: (request) => {
      invalidate();
      toast.success(
        request.status === 'approved'
          ? `Room change approved. ${request.student_name} is now in ${request.requested_room}.`
          : `Room change request from ${request.student_name} rejected.`,
      );
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not update request');
    },
  });

  const requests = [...(requestsQuery.data ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return {
    requests,
    isLoading: requestsQuery.isLoading,
    error: requestsQuery.error,
    createRequest,
    decideRequest,
  };
}
