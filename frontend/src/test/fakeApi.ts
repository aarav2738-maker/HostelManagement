// In-memory fake of the backend REST API used by the frontend tests.
// Mirrors the Express routes in backend/src/routes so hook behaviour in
// tests matches what the real server does.
export class FakeApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface FakeUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  room_number: string | null;
  phone: string | null;
  role: 'admin' | 'student';
}

const state = {
  users: [] as FakeUser[],
  complaints: [] as Array<Record<string, unknown> & { id: string; user_id: string; status: string; created_at: string }>,
  feedback: [] as Array<Record<string, unknown> & { id: string; complaint_id: string; user_id: string }>,
  roomRequests: [] as Array<Record<string, unknown> & { id: string; user_id: string; status: string }>,
  menu: [
    { day: 'Monday', breakfast: 'Idli Sambar', lunch: 'Rajma Chawal, Roti, Salad', dinner: 'Dal Makhani, Mix Veg, Roti' },
    { day: 'Tuesday', breakfast: 'Poha, Jalebi', lunch: 'Kadi Pakora, Rice, Roti', dinner: 'Paneer Butter Masala, Roti, Dessert' },
    { day: 'Wednesday', breakfast: 'Aloo Paratha, Curd', lunch: 'Chole Bhature, Rice', dinner: 'Egg Curry / Soyabean, Roti' },
    { day: 'Thursday', breakfast: 'Upma, Chutney', lunch: 'Dal Fry, Jeera Rice, Bhindi', dinner: 'Chicken Curry / Malai Kofta, Roti' },
    { day: 'Friday', breakfast: 'Puri Sabji', lunch: 'Veg Biryani, Raita', dinner: 'Dal Tadka, Aloo Gobi, Roti' },
    { day: 'Saturday', breakfast: 'Masala Dosa, Sambar', lunch: 'Veg Pulao, Raita, Papad', dinner: 'Chole, Rice, Roti' },
    { day: 'Sunday', breakfast: 'Besan Chilla, Chutney', lunch: 'Special Thali (Paneer, Dal, Rice, Roti)', dinner: 'Fried Rice, Manchurian' },
  ],
};

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${++idCounter}`;

export const resetFakeApi = () => {
  state.users = [];
  state.complaints = [];
  state.feedback = [];
  state.roomRequests = [];
  idCounter = 0;
};

const fail = (status: number, message: string): never => {
  throw new FakeApiError(status, message);
};

const toPublicUser = (u: FakeUser) => ({
  id: u.id,
  email: u.email,
  user_metadata: {
    full_name: u.full_name,
    room_number: u.room_number ?? undefined,
    phone: u.phone ?? undefined,
  },
});

// The token format mirrors the fake's own issuer: "token-<userId>".
const currentUser = (): FakeUser => {
  try {
    const raw = localStorage.getItem('hostel_auth_state');
    const token = raw ? (JSON.parse(raw) as { token?: string }).token : null;
    if (!token || !token.startsWith('token-')) return fail(401, 'Not authenticated');
    const user = state.users.find((u) => u.id === token.slice('token-'.length));
    if (!user) return fail(401, 'Not authenticated');
    return user;
  } catch (error) {
    if (error instanceof FakeApiError) throw error;
    return fail(401, 'Not authenticated');
  }
};

const publicUser = (u: FakeUser) => ({ token: `token-${u.id}`, user: toPublicUser(u), role: u.role });

const findEmail = (email: string) =>
  state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

export function seedAdmin() {
  const existing = state.users.find((u) => u.email === 'admin@hostel.com');
  if (existing) return existing;
  const admin: FakeUser = {
    id: nextId('admin'),
    email: 'admin@hostel.com',
    password: 'admin123',
    full_name: 'Administrator',
    room_number: null,
    phone: null,
    role: 'admin',
  };
  state.users.push(admin);
  return admin;
}

export function seedStudent(overrides: Partial<FakeUser> = {}) {
  const student: FakeUser = {
    id: nextId('student'),
    email: 'jane@example.com',
    password: 'secret123',
    full_name: 'Jane Doe',
    room_number: 'A-101',
    phone: null,
    role: 'student',
    ...overrides,
  };
  state.users.push(student);
  return student;
}

// Test setup helper: the real flow requires an admin to resolve a complaint
// before feedback can be left on it.
export const resolveComplaint = (id: string) => {
  const complaint = state.complaints.find((c) => c.id === id);
  if (complaint) {
    complaint.status = 'resolved';
    complaint.resolved_at = new Date().toISOString();
    complaint.resolved_by = seedAdmin().id;
  }
};

export const getComplaints = () => state.complaints;
export const getFeedback = () => state.feedback;
export const getMenu = () => state.menu;
export const getUsers = () => state.users;

const sortDesc = <T extends { created_at: string }>(rows: T[]) =>
  [...rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

const CATEGORIES = ['water', 'electricity', 'wifi', 'cleaning', 'maintenance', 'food', 'security', 'furniture', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const MESS_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MESS_FIELDS = ['breakfast', 'lunch', 'dinner'];

export const fakeApi = {
  async get(path: string): Promise<unknown> {
    const user = currentUser();
    if (path === '/auth/me') return publicUser(user);
    if (path === '/complaints') {
      return sortDesc(user.role === 'admin' ? state.complaints : state.complaints.filter((c) => c.user_id === user.id));
    }
    if (path === '/feedback') {
      return sortDesc(user.role === 'admin' ? state.feedback : state.feedback.filter((f) => f.user_id === user.id));
    }
    if (path === '/mess-menu') return state.menu;
    if (path === '/room-requests') {
      return sortDesc(user.role === 'admin' ? state.roomRequests : state.roomRequests.filter((r) => r.user_id === user.id));
    }
    return fail(404, 'Not found');
  },

  async post(path: string, body: Record<string, unknown> = {}): Promise<unknown> {
    if (path === '/auth/signup') {
      const email = String(body.email ?? '').trim().toLowerCase();
      if (!email || !String(body.password ?? '')) return fail(400, 'Email and password are required');
      if (findEmail(email)) return fail(409, 'User already exists');
      const user: FakeUser = {
        id: nextId('user'),
        email,
        password: String(body.password),
        full_name: String(body.full_name ?? ''),
        room_number: body.room_number ? String(body.room_number) : null,
        phone: null,
        role: 'student',
      };
      state.users.push(user);
      return publicUser(user);
    }
    if (path === '/auth/login') {
      const user = findEmail(String(body.email ?? ''));
      if (!user || user.password !== String(body.password ?? '').trim()) {
        return fail(401, 'Invalid email or password');
      }
      return publicUser(user);
    }
    const user = currentUser();
    if (path === '/complaints') {
      if (!String(body.title ?? '').trim() || !String(body.description ?? '').trim()) {
        return fail(400, 'Title and description are required');
      }
      if (!CATEGORIES.includes(String(body.category))) return fail(400, 'Invalid category');
      if (body.priority && !PRIORITIES.includes(String(body.priority))) return fail(400, 'Invalid priority');
      const complaint = {
        id: nextId('complaint'),
        user_id: user.id,
        category: String(body.category),
        title: String(body.title).trim(),
        description: String(body.description).trim(),
        room_number: String(body.room_number ?? '').trim() || user.room_number || 'Unknown',
        priority: String(body.priority ?? 'medium'),
        status: 'pending',
        image_url: (body.image_url as string | null) ?? null,
        admin_notes: null,
        resolved_at: null,
        resolved_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      state.complaints.push(complaint);
      return complaint;
    }
    if (path === '/feedback') {
      const complaint = state.complaints.find((c) => c.id === body.complaint_id);
      if (!complaint) return fail(404, 'Complaint not found');
      if (complaint.user_id !== user.id) return fail(403, 'You can only rate your own complaints');
      if (complaint.status !== 'resolved') return fail(400, 'Feedback can only be given on resolved complaints');
      if (state.feedback.some((f) => f.complaint_id === complaint.id)) {
        return fail(409, 'Feedback already submitted for this complaint');
      }
      const feedback = {
        id: nextId('feedback'),
        complaint_id: complaint.id,
        user_id: user.id,
        rating: Number(body.rating),
        comment: (body.comment as string | null) ?? null,
        created_at: new Date().toISOString(),
      };
      state.feedback.push(feedback);
      return feedback;
    }
    if (path === '/room-requests') {
      const room = String(body.requested_room ?? '').trim().toUpperCase();
      if (!room) return fail(400, 'Preferred room is required');
      if (user.room_number && user.room_number.toUpperCase() === room) {
        return fail(400, 'You are already allotted this room');
      }
      if (state.roomRequests.some((r) => r.user_id === user.id && r.status === 'pending')) {
        return fail(409, 'You already have a pending room change request');
      }
      const request = {
        id: nextId('rr'),
        user_id: user.id,
        student_name: user.full_name,
        current_room: user.room_number ?? 'Unassigned',
        requested_room: room,
        reason: String(body.reason ?? ''),
        status: 'pending',
        created_at: new Date().toISOString(),
        decided_at: null,
      };
      state.roomRequests.push(request);
      return request;
    }
    return fail(404, 'Not found');
  },

  async put(path: string, body: Record<string, unknown> = {}): Promise<unknown> {
    if (path === '/mess-menu') {
      if (currentUser().role !== 'admin') return fail(403, 'Admin access required');
      const day = String(body.day ?? '');
      const field = String(body.field ?? '');
      if (!MESS_DAYS.includes(day)) return fail(400, 'Invalid day');
      if (!MESS_FIELDS.includes(field)) return fail(400, 'Invalid meal field');
      state.menu = state.menu.map((d) => (d.day === day ? { ...d, [field]: String(body.value) } : d));
      return state.menu;
    }
    return fail(404, 'Not found');
  },

  async patch(path: string, body: Record<string, unknown> = {}): Promise<unknown> {
    const user = currentUser();
    if (path === '/auth/profile') {
      if (body.full_name !== undefined && !String(body.full_name).trim()) {
        return fail(400, 'Full name is required');
      }
      if (body.room_number !== undefined && !String(body.room_number).trim()) {
        return fail(400, 'Room number is required');
      }
      if (body.full_name !== undefined) user.full_name = String(body.full_name).trim();
      if (body.phone !== undefined) user.phone = String(body.phone).trim();
      if (body.room_number !== undefined) user.room_number = String(body.room_number).trim();
      return publicUser(user);
    }

    const complaintMatch = path.match(/^\/complaints\/([^/]+)$/);
    if (complaintMatch) {
      const complaint = state.complaints.find((c) => c.id === complaintMatch[1]);
      if (!complaint) return fail(404, 'Complaint not found');
      const isAdmin = user.role === 'admin';
      if (!isAdmin && complaint.user_id !== user.id) return fail(403, 'You can only edit your own complaints');
      if (!isAdmin && complaint.status !== 'pending') return fail(403, 'Only pending complaints can be edited');
      if (!isAdmin && (body.status !== undefined || body.admin_notes !== undefined)) {
        return fail(403, 'Only admins can change the status');
      }
      if (body.title !== undefined) complaint.title = String(body.title);
      if (body.description !== undefined) complaint.description = String(body.description);
      if (body.category !== undefined) complaint.category = String(body.category);
      if (body.priority !== undefined) complaint.priority = String(body.priority);
      if (body.room_number !== undefined) complaint.room_number = String(body.room_number);
      if (body.image_url !== undefined) complaint.image_url = body.image_url as string | null;
      if (body.admin_notes !== undefined && isAdmin) complaint.admin_notes = body.admin_notes as string | null;
      if (body.status !== undefined) {
        complaint.status = String(body.status);
        if (complaint.status === 'resolved' && !complaint.resolved_at) {
          complaint.resolved_at = new Date().toISOString();
          complaint.resolved_by = user.id;
        }
      }
      complaint.updated_at = new Date().toISOString();
      return complaint;
    }

    const decideMatch = path.match(/^\/room-requests\/([^/]+)\/decide$/);
    if (decideMatch) {
      if (user.role !== 'admin') return fail(403, 'Admin access required');
      const request = state.roomRequests.find((r) => r.id === decideMatch[1]);
      if (!request) return fail(404, 'Request not found');
      if (request.status !== 'pending') return fail(409, 'This request has already been decided');
      const status = String(body.status);
      if (status !== 'approved' && status !== 'rejected') return fail(400, 'Status must be approved or rejected');
      request.status = status;
      request.decided_at = new Date().toISOString();
      if (status === 'approved') {
        const student = state.users.find((u) => u.id === request.user_id);
        if (student) student.room_number = String(request.requested_room);
      }
      return request;
    }

    return fail(404, 'Not found');
  },
};
