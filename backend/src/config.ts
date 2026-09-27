import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-secret-change-me',
  tokenTtl: '7d',
  adminEmail: (process.env.ADMIN_EMAIL ?? 'admin@hostel.com').trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD ?? 'admin123',
  adminName: process.env.ADMIN_NAME ?? 'Administrator',
  databaseUrl: process.env.DATABASE_URL ?? '',
};

export const COMPLAINT_CATEGORIES = [
  'water', 'electricity', 'wifi', 'cleaning', 'maintenance',
  'food', 'security', 'furniture', 'other',
] as const;
export const COMPLAINT_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const COMPLAINT_STATUSES = ['pending', 'in_progress', 'resolved'] as const;
export const MESS_MEAL_FIELDS = ['breakfast', 'lunch', 'dinner'] as const;
export const MESS_DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
] as const;

export type AppRole = 'admin' | 'student';
export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];
export type ComplaintPriority = (typeof COMPLAINT_PRIORITIES)[number];
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];
export type MessMealField = (typeof MESS_MEAL_FIELDS)[number];

export const nowISO = (): string => new Date().toISOString();
