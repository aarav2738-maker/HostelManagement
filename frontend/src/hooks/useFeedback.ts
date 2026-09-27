import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Feedback, FeedbackInsert } from '@/lib/types';
import { toast } from 'sonner';

export function useFeedback() {
  const queryClient = useQueryClient();

  const feedbackQuery = useQuery({
    queryKey: ['feedback'],
    queryFn: () => api.get<Feedback[]>('/feedback'),
  });

  const createFeedback = useMutation({
    mutationFn: (feedback: Omit<FeedbackInsert, 'user_id'>) =>
      api.post<Feedback>('/feedback', feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Thank you for your feedback!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Could not submit feedback');
    },
  });

  const getFeedbackForComplaint = (complaintId: string) => {
    return feedbackQuery.data?.find((f) => f.complaint_id === complaintId);
  };

  return {
    feedback: feedbackQuery.data ?? [],
    isLoading: feedbackQuery.isLoading,
    error: feedbackQuery.error,
    createFeedback,
    getFeedbackForComplaint,
  };
}
