import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { nowISO } from '../config.js';
import { asyncHandler } from '../async-handler.js';

const router = Router();
router.use(requireAuth);

interface RoomRequestRow {
  id: string;
  user_id: string;
  student_name: string;
  current_room: string;
  requested_room: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  decided_at: string | null;
}

const getRequest = (id: string): Promise<RoomRequestRow | undefined> =>
  db.prepare('SELECT * FROM room_requests WHERE id = ?').get<RoomRequestRow>(id);

router.get('/', asyncHandler(async (req, res) => {
  const rows =
    req.user!.role === 'admin'
      ? await db.prepare('SELECT * FROM room_requests ORDER BY created_at DESC').all<RoomRequestRow>()
      : await db.prepare('SELECT * FROM room_requests WHERE user_id = ? ORDER BY created_at DESC').all<RoomRequestRow>(req.user!.id);
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { requested_room, reason } = req.body as { requested_room?: string; reason?: string };
  if (!requested_room?.trim()) return res.status(400).json({ error: 'Preferred room is required' });

  const user = await db.prepare('SELECT full_name, room_number FROM users WHERE id = ?').get<{ full_name: string; room_number: string | null }>(req.user!.id);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  const room = requested_room.trim().toUpperCase();
  const currentRoom = user.room_number ?? '';
  if (currentRoom && currentRoom.toUpperCase() === room) {
    return res.status(400).json({ error: 'You are already allotted this room' });
  }

  const pending = await db.prepare("SELECT id FROM room_requests WHERE user_id = ? AND status = 'pending'").get(req.user!.id);
  if (pending) return res.status(409).json({ error: 'You already have a pending room change request' });

  const id = randomUUID();
  const now = nowISO();
  await db.prepare(
    `INSERT INTO room_requests (id, user_id, student_name, current_room, requested_room, reason, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
  ).run(id, req.user!.id, user.full_name, currentRoom || 'Unassigned', room, (reason ?? '').trim(), now);

  res.status(201).json(await getRequest(id));
}));

router.patch('/:id/decide', requireAdmin, asyncHandler(async (req, res) => {
  const { status } = req.body as { status?: 'approved' | 'rejected' };
  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ error: 'Status must be approved or rejected' });
  }

  const request = await getRequest(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.status !== 'pending') return res.status(409).json({ error: 'This request has already been decided' });

  await db.prepare('UPDATE room_requests SET status = ?, decided_at = ? WHERE id = ?').run(status, nowISO(), request.id);

  // Approving moves the student into the requested room for their next login.
  if (status === 'approved') {
    await db.prepare('UPDATE users SET room_number = ?, updated_at = ? WHERE id = ?').run(
      request.requested_room, nowISO(), request.user_id,
    );
  }

  res.json(await getRequest(request.id));
}));

export default router;
