CREATE TABLE IF NOT EXISTS public.hostel_users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  room_number TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.hostel_complaints (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.hostel_users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('water','electricity','wifi','cleaning','maintenance','food','security','furniture','other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  room_number TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','resolved')),
  image_url TEXT,
  admin_notes TEXT,
  resolved_at TEXT,
  resolved_by UUID REFERENCES public.hostel_users(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.hostel_feedback (
  id UUID PRIMARY KEY,
  complaint_id UUID NOT NULL UNIQUE REFERENCES public.hostel_complaints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.hostel_users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.hostel_mess_menu (
  day TEXT PRIMARY KEY,
  breakfast TEXT NOT NULL,
  lunch TEXT NOT NULL,
  dinner TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.hostel_room_requests (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.hostel_users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  current_room TEXT NOT NULL,
  requested_room TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TEXT NOT NULL,
  decided_at TEXT
);

CREATE TABLE IF NOT EXISTS public.hostel_roommate_assignments (
  id UUID PRIMARY KEY,
  student_user_id UUID NOT NULL REFERENCES public.hostel_users(id) ON DELETE CASCADE,
  roommate_user_id UUID REFERENCES public.hostel_users(id) ON DELETE SET NULL,
  roommate_name TEXT NOT NULL,
  roommate_course TEXT,
  roommate_phone TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.hostel_roommate_requests (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.hostel_users(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  remove_roommates TEXT NOT NULL DEFAULT '[]',
  add_roommates TEXT NOT NULL DEFAULT '[]',
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TEXT NOT NULL,
  decided_at TEXT
);

CREATE INDEX IF NOT EXISTS hostel_complaints_user_created_idx
  ON public.hostel_complaints (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS hostel_room_requests_user_created_idx
  ON public.hostel_room_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS hostel_roommate_requests_user_created_idx
  ON public.hostel_roommate_requests (user_id, created_at DESC);

ALTER TABLE public.hostel_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_mess_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_room_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_roommate_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostel_roommate_requests ENABLE ROW LEVEL SECURITY;