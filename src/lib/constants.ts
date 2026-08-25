import { Database } from '@/integrations/supabase/types';

type ComplaintCategory = Database['public']['Enums']['complaint_category'];
type ComplaintPriority = Database['public']['Enums']['complaint_priority'];
type ComplaintStatus = Database['public']['Enums']['complaint_status'];

export const CATEGORIES: { value: ComplaintCategory; label: string; icon: string }[] = [
  { value: 'water', label: 'Water', icon: '💧' },
  { value: 'electricity', label: 'Electricity', icon: '⚡' },
  { value: 'wifi', label: 'Wi-Fi', icon: '📶' },
  { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { value: 'food', label: 'Food', icon: '🍽️' },
  { value: 'security', label: 'Security', icon: '🔒' },
  { value: 'furniture', label: 'Furniture', icon: '🪑' },
  { value: 'other', label: 'Other', icon: '📋' },
];

export const PRIORITIES: { value: ComplaintPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-priority-low' },
  { value: 'medium', label: 'Medium', color: 'bg-priority-medium' },
  { value: 'high', label: 'High', color: 'bg-priority-high' },
  { value: 'urgent', label: 'Urgent', color: 'bg-priority-urgent' },
];

export const STATUSES: { value: ComplaintStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-status-pending' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-status-in-progress' },
  { value: 'resolved', label: 'Resolved', color: 'bg-status-resolved' },
];

export const getCategoryInfo = (category: ComplaintCategory) => {
  return CATEGORIES.find(c => c.value === category) ?? CATEGORIES[8];
};

export const getPriorityInfo = (priority: ComplaintPriority) => {
  return PRIORITIES.find(p => p.value === priority) ?? PRIORITIES[1];
};

export const getStatusInfo = (status: ComplaintStatus) => {
  return STATUSES.find(s => s.value === status) ?? STATUSES[0];
};
