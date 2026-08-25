import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Feedback = Database['public']['Tables']['feedback']['Row'];
type FeedbackInsert = Database['public']['Tables']['feedback']['Insert'];

const FEEDBACK_KEY = 'hostel_feedback';
const AUTH_KEY = 'hostel_auth_state';

const getCurrentUser = () => {
  const state = localStorage.getItem(AUTH_KEY);
  if (!state) return null;
  try {
    return JSON.parse(state).user;
  } catch {
    return null;
  }
};

const getFeedbacks = (): Feedback[] => {
  const data = localStorage.getItem(FEEDBACK_KEY);
  return data ? JSON.parse(data) : [];
};

export function useFeedback() {
  const queryClient = useQueryClient();

  const feedbackQuery = useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      return getFeedbacks().sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });

  const createFeedback = useMutation({
    mutationFn: async (feedback: Omit<FeedbackInsert, 'user_id'>) => {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const feedbacks = getFeedbacks();
      const newFeedback: Feedback = {
        ...feedback,
        id: Math.random().toString(36).substring(7),
        user_id: user.id,
        created_at: new Date().toISOString()
      } as Feedback;

      feedbacks.push(newFeedback);
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbacks));
      return newFeedback;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Thank you for your feedback!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getFeedbackForComplaint = (complaintId: string) => {
    return feedbackQuery.data?.find(f => f.complaint_id === complaintId);
  };

  return {
    feedback: feedbackQuery.data ?? [],
    isLoading: feedbackQuery.isLoading,
    error: feedbackQuery.error,
    createFeedback,
    getFeedbackForComplaint,
  };
}
