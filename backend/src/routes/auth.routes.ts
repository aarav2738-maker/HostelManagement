import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { signToken, requireAuth } from '../auth.js';
import { config, nowISO } from '../config.js';
import { asyncHandler } from '../async-handler.js';

const router = Router();

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  room_number: string | null;
  phone: string | null;
  role: 'admin' | 'student';
}

const toPublicUser = (row: UserRow) => ({
  id: row.id,
  email: row.email,
  user_metadata: {
    full_name: row.full_name,
    room_number: row.room_number ?? undefined,
    phone: row.phone ?? undefined,
  },
});

const getUserRow = (id: string): Promise<UserRow | undefined> =>
  db.prepare('SELECT * FROM users WHERE id = ?').get<UserRow>(id);

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/signup', asyncHandler(async (req, res) => {
  const { email, password, full_name, room_number } = req.body as Record<string, string>;
  const normalizedEmail = (email ?? '').trim().toLowerCase();
  if (!emailRe.test(normalizedEmail)) return res.status(400).json({ error: 'Please enter a valid email address' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (!full_name?.trim()) return res.status(400).json({ error: 'Full name is required' });
  if (!room_number?.trim()) return res.status(400).json({ error: 'Room number is required' });

  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) return res.status(409).json({ error: 'User already exists' });

  const id = randomUUID();
  const now = nowISO();
  await db.prepare(
    "INSERT INTO users (id, email, password_hash, full_name, room_number, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'student', ?, ?)",
  ).run(id, normalizedEmail, bcrypt.hashSync(password, 10), full_name.trim(), room_number.trim(), now, now);

  const row = (await getUserRow(id))!;
  const user = toPublicUser(row);
  res.status(201).json({ token: signToken({ id, role: row.role }), user, role: row.role });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body as Record<string, string>;
  const normalizedEmail = (email ?? '').trim().toLowerCase();
  const row = await db.prepare('SELECT * FROM users WHERE email = ?').get<UserRow>(normalizedEmail);
  if (!row || !bcrypt.compareSync((password ?? '').trim(), row.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const user = toPublicUser(row);
  res.json({ token: signToken({ id: row.id, role: row.role }), user, role: row.role });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const row = await getUserRow(req.user!.id);
  if (!row) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ user: toPublicUser(row), role: row.role });
}));

router.patch('/profile', requireAuth, asyncHandler(async (req, res) => {
  const { full_name, phone, room_number } = req.body as Record<string, string | undefined>;
  const row = await getUserRow(req.user!.id);
  if (!row) return res.status(401).json({ error: 'Not authenticated' });

  const nextName = full_name !== undefined ? full_name.trim() : row.full_name;
  const nextRoom = room_number !== undefined ? room_number.trim() : row.room_number;
  if (!nextName) return res.status(400).json({ error: 'Full name is required' });
  if (room_number !== undefined && !nextRoom) return res.status(400).json({ error: 'Room number is required' });

  await db.prepare('UPDATE users SET full_name = ?, phone = ?, room_number = ?, updated_at = ? WHERE id = ?').run(
    nextName,
    phone !== undefined ? phone.trim() : row.phone,
    nextRoom,
    nowISO(),
    row.id,
  );

  const updated = (await getUserRow(row.id))!;
  res.json({ user: toPublicUser(updated), role: updated.role });
}));

export default router;
