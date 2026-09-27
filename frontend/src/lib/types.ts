export type AppRole = 'admin' | 'student';
export type ComplaintCategory =
  | 'water' | 'electricity' | 'wifi' | 'cleaning' | 'maintenance'
  | 'food' | 'security' | 'furniture' | 'other';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved';
export type RoomRequestStatus = 'pending' | 'approved' | 'rejected';

export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'water', 'electricity', 'wifi', 'cleaning', 'maintenance',
  'food', 'security', 'furniture', 'other',
];
export const COMPLAINT_PRIORITIES: ComplaintPriority[] = ['low', 'medium', 'high', 'urgent'];
export const COMPLAINT_STATUSES: ComplaintStatus[] = ['pending', 'in_progress', 'resolved'];

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    room_number?: string;
    phone?: string;
  };
}

export interface Session {
  access_token: string;
  user: User;
}

export type ProfileUpdates = {
  full_name?: string;
  phone?: string;
  room_number?: string;
};

export interface Complaint {
  id: string;
  user_id: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  room_number: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  image_url: string | null;
  admin_notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ComplaintInsert = Omit<Complaint, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'admin_notes' | 'resolved_at' | 'resolved_by'> & {
  image_url?: string | null;
};

export type ComplaintUpdate = Partial<Pick<Complaint, 'title' | 'description' | 'category' | 'priority' | 'room_number' | 'image_url' | 'status' | 'admin_notes'>>;

export interface Feedback {
  id: string;
  complaint_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export type FeedbackInsert = Pick<Feedback, 'complaint_id' | 'rating'> & {
  comment?: string | null;
};

export interface RoomRequest {
  id: string;
  user_id: string;
  student_name: string;
  current_room: string;
  requested_room: string;
  reason: string;
  status: RoomRequestStatus;
  created_at: string;
  decided_at: string | null;
}

export interface Roommate {
  id: string;
  roommate_user_id: string | null;
  roommate_name: string;
  roommate_course: string | null;
  roommate_phone: string | null;
}

export interface StudentSuggestion {
  id: string;
  full_name: string;
  email: string;
  room_number: string | null;
  phone: string | null;
}

export interface RoommateRequest {
  id: string;
  user_id: string;
  student_name: string;
  remove_roommates: string[];
  add_roommates: Array<{ student_id?: string; name: string; course?: string; phone?: string }>;
  reason: string;
  status: RoomRequestStatus;
  created_at: string;
  decided_at: string | null;
}
