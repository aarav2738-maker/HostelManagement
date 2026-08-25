import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Complaint = Database['public']['Tables']['complaints']['Row'];
type ComplaintInsert = Database['public']['Tables']['complaints']['Insert'];
type ComplaintUpdate = Database['public']['Tables']['complaints']['Update'];
type ComplaintStatus = Database['public']['Enums']['complaint_status'];

const COMPLAINTS_KEY = 'hostel_complaints';
const AUTH_KEY = 'hostel_auth_state';

// Helper to get current user from our mock auth
const getCurrentUser = () => {
  const state = localStorage.getItem(AUTH_KEY);
  if (!state) return null;
  try {
    return JSON.parse(state).user;
  } catch {
    return null;
  }
};

const getComplaints = (): Complaint[] => {
  const data = localStorage.getItem(COMPLAINTS_KEY);
  return data ? JSON.parse(data) : [];
};

export function useComplaints() {
  const queryClient = useQueryClient();

  const complaintsQuery = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      return getComplaints().sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });

  const createComplaint = useMutation({
    mutationFn: async (complaint: Omit<ComplaintInsert, 'user_id'>) => {
      const user = getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const complaints = getComplaints();
      const newComplaint: Complaint = {
        ...complaint,
        id: Math.random().toString(36).substring(7),
        user_id: user.id,
        created_at: new Date().toISOString(),
        status: 'pending',
        admin_notes: null,
        resolved_at: null,
        resolved_by: null,
        image_url: complaint.image_url || null,
        room_number: complaint.room_number || user.user_metadata?.room_number || 'Unknown'
      } as Complaint;

      complaints.push(newComplaint);
      localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
      return newComplaint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateComplaint = useMutation({
    mutationFn: async ({ id, ...updates }: ComplaintUpdate & { id: string }) => {
      let complaints = getComplaints();
      let updatedComplaint = null;

      complaints = complaints.map(c => {
        if (c.id === id) {
          updatedComplaint = { ...c, ...updates };
          return updatedComplaint;
        }
        return c;
      });

      if (!updatedComplaint) throw new Error('Complaint not found');
      
      localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
      return updatedComplaint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Complaint updated!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: ComplaintStatus; adminNotes?: string }) => {
      let complaints = getComplaints();
      let updatedComplaint = null;
      const user = getCurrentUser();

      complaints = complaints.map(c => {
        if (c.id === id) {
          updatedComplaint = { ...c, status };
          if (adminNotes !== undefined) updatedComplaint.admin_notes = adminNotes;
          if (status === 'resolved') {
            updatedComplaint.resolved_at = new Date().toISOString();
            updatedComplaint.resolved_by = user?.id;
          }
          return updatedComplaint;
        }
        return c;
      });

      if (!updatedComplaint) throw new Error('Complaint not found');
      
      localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
      return updatedComplaint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      toast.success('Status updated!');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    complaints: complaintsQuery.data ?? [],
    isLoading: complaintsQuery.isLoading,
    error: complaintsQuery.error,
    createComplaint,
    updateComplaint,
    updateStatus,
    refetch: complaintsQuery.refetch,
  };
}
