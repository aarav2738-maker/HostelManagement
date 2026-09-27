import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Complaint, ComplaintInsert, ComplaintUpdate, ComplaintStatus } from '@/lib/types';
import { toast } from 'sonner';

export function useComplaints() {
  const queryClient = useQueryClient();

  const complaintsQuery = useQuery({
    queryKey: ['complaints'],
    queryFn: () => api.get<Complaint[]>('/complaints'),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['complaints'] });

  const createComplaint = useMutation({
    mutationFn: (complaint: Omit<ComplaintInsert, 'user_id'>) =>
      api.post<Complaint>('/complaints', complaint),
    onSuccess: () => {
      invalidate();
      toast.success('Complaint submitted successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not submit complaint');
    },
  });

  const updateComplaint = useMutation({
    mutationFn: ({ id, ...updates }: ComplaintUpdate & { id: string }) =>
      api.patch<Complaint>(`/complaints/${id}`, updates),
    onSuccess: () => {
      invalidate();
      toast.success('Complaint updated!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not update complaint');
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: string; status: ComplaintStatus; adminNotes?: string }) =>
      api.patch<Complaint>(`/complaints/${id}`, { status, admin_notes: adminNotes }),
    onSuccess: () => {
      invalidate();
      toast.success('Status updated!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not update status');
    },
  });

  // The API returns newest first; keep a stable client-side sort so the
  // ordering survives any server-side changes.
  const complaints = [...(complaintsQuery.data ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return {
    complaints,
    isLoading: complaintsQuery.isLoading,
    error: complaintsQuery.error,
    createComplaint,
    updateComplaint,
    updateStatus,
    refetch: complaintsQuery.refetch,
  };
}
