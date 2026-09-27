import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { requireAdmin, requireAuth } from '../auth.js';
import { nowISO } from '../config.js';
import { asyncHandler } from '../async-handler.js';
import { transaction } from '../db.js';

const router = Router();
router.use(requireAuth);

type RoommateInput = { student_id?: string; name: string; course?: string; phone?: string };
type RoommateRequestRow = {
  id: string;
  user_id: string;
  student_name: string;
  remove_roommates: string[];
  add_roommates: RoommateInput[];
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  decided_at: string | null;
};

const parseJson = <T>(value: string, fallback: T): T => {
  try { return JSON.parse(value) as T; } catch { return fallback; }
};

const getRequest = async (id: string): Promise<RoommateRequestRow | undefined> => {
  const row = await db.prepare('SELECT * FROM roommate_requests WHERE id = ?').get<Record<string, string>>(id);
  if (!row) return undefined;
  return {
    ...row,
    remove_roommates: parseJson<string[]>(row.remove_roommates, []),
    add_roommates: parseJson<RoommateInput[]>(row.add_roommates, []),
  } as RoommateRequestRow;
};

router.get('/students', asyncHandler(async (req, res) => {
  const search = String(req.query.search ?? '').trim();
  const rows = await db.prepare(
    `SELECT id, full_name, email, room_number, phone
     FROM users
     WHERE role = 'student' AND id != ? AND (full_name ILIKE ? OR email ILIKE ?)
     ORDER BY lower(full_name) LIMIT 10`,
  ).all<Record<string, string | null>>(req.user!.id, `%${search}%`, `%${search}%`);
  res.json(rows);
}));

router.get('/assignments', asyncHandler(async (req, res) => {
  const rows = await db.prepare(
    'SELECT id, roommate_user_id, roommate_name, roommate_course, roommate_phone FROM roommate_assignments WHERE student_user_id = ? ORDER BY lower(roommate_name)',
  ).all(req.user!.id);
  res.json(rows);
}));

router.get('/requests', asyncHandler(async (req, res) => {
  const query = req.user!.role === 'admin'
    ? 'SELECT * FROM roommate_requests ORDER BY created_at DESC'
    : 'SELECT * FROM roommate_requests WHERE user_id = ? ORDER BY created_at DESC';
  const rows = req.user!.role === 'admin'
    ? await db.prepare(query).all<Record<string, string>>()
    : await db.prepare(query).all<Record<string, string>>(req.user!.id);
  res.json(rows.map((row) => ({
    ...row,
    remove_roommates: parseJson<string[]>(row.remove_roommates, []),
    add_roommates: parseJson<RoommateInput[]>(row.add_roommates, []),
  })));
}));

router.post('/requests', asyncHandler(async (req, res) => {
  const { remove_roommates, add_roommates, reason } = req.body as {
    remove_roommates?: string[];
    add_roommates?: RoommateInput[];
    reason?: string;
  };
  const remove = [...new Set((remove_roommates ?? []).map((name) => name.trim()).filter(Boolean))];
  const add = (add_roommates ?? []).map((roommate) => ({
    student_id: roommate.student_id,
    name: roommate.name.trim(),
    course: roommate.course?.trim() ?? '',
    phone: roommate.phone?.trim() ?? '',
  })).filter((roommate) => roommate.name);
  if (!remove.length && !add.length) return res.status(400).json({ error: 'Select at least one roommate change' });
  if (add.length > 3) return res.status(400).json({ error: 'A room can have at most three roommates' });

  const user = await db.prepare('SELECT full_name FROM users WHERE id = ?').get<{ full_name: string }>(req.user!.id);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const pending = await db.prepare("SELECT id FROM roommate_requests WHERE user_id = ? AND status = 'pending'").get(req.user!.id);
  if (pending) return res.status(409).json({ error: 'You already have a pending roommate change request' });

  const id = randomUUID();
  await db.prepare(
    `INSERT INTO roommate_requests (id, user_id, student_name, remove_roommates, add_roommates, reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, req.user!.id, user.full_name, JSON.stringify(remove), JSON.stringify(add), (reason ?? '').trim(), nowISO());
  res.status(201).json(await getRequest(id));
}));

router.patch('/requests/:id/decide', requireAdmin, asyncHandler(async (req, res) => {
  const status = (req.body as { status?: string }).status;
  if (status !== 'approved' && status !== 'rejected') return res.status(400).json({ error: 'Status must be approved or rejected' });
  const request = await getRequest(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.status !== 'pending') return res.status(409).json({ error: 'This request has already been decided' });

  await transaction(async () => {
    if (status === 'approved') {
      const removedRoommates: Array<{ roommate_user_id: string }> = [];
      for (const name of request.remove_roommates) {
        removedRoommates.push(...await db.prepare(
        `SELECT roommate_user_id FROM roommate_assignments
         WHERE student_user_id = ? AND lower(roommate_name) = lower(?) AND roommate_user_id IS NOT NULL`,
        ).all<{ roommate_user_id: string }>(request.user_id, name));
      }

      // Remove only the relationships explicitly selected by the student.
      for (const name of request.remove_roommates) {
        await db.prepare(
          'DELETE FROM roommate_assignments WHERE student_user_id = ? AND lower(roommate_name) = lower(?)',
        ).run(request.user_id, name);
      }
      for (const roommate of removedRoommates) {
        await db.prepare(
          'DELETE FROM roommate_assignments WHERE student_user_id = ? AND roommate_user_id = ?',
        ).run(roommate.roommate_user_id, request.user_id);
      }

      for (const roommate of request.add_roommates) {
        if (roommate.student_id) {
          // Do not disturb the added student's other roommates. Only replace
          // a prior relationship with this requester, if one exists.
          await db.prepare(
            'DELETE FROM roommate_assignments WHERE student_user_id = ? AND roommate_user_id = ?',
          ).run(roommate.student_id, request.user_id);
          const requester = await db.prepare('SELECT full_name FROM users WHERE id = ?').get<{ full_name: string }>(request.user_id);
          const alreadyAssigned = await db.prepare(
            'SELECT id FROM roommate_assignments WHERE student_user_id = ? AND roommate_user_id = ?',
          ).get(request.user_id, roommate.student_id);
          if (requester && !alreadyAssigned) {
            await db.prepare(
              'INSERT INTO roommate_assignments (id, student_user_id, roommate_user_id, roommate_name, roommate_course, roommate_phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ).run(randomUUID(), request.user_id, roommate.student_id, roommate.name, roommate.course ?? null, roommate.phone ?? null, nowISO());
            await db.prepare(
              'INSERT INTO roommate_assignments (id, student_user_id, roommate_user_id, roommate_name, roommate_course, roommate_phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ).run(randomUUID(), roommate.student_id, request.user_id, requester.full_name, null, null, nowISO());
          }
        } else {
          await db.prepare(
            'INSERT INTO roommate_assignments (id, student_user_id, roommate_user_id, roommate_name, roommate_course, roommate_phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          ).run(randomUUID(), request.user_id, null, roommate.name, roommate.course ?? null, roommate.phone ?? null, nowISO());
        }
      }
    }
    await db.prepare('UPDATE roommate_requests SET status = ?, decided_at = ? WHERE id = ?').run(status, nowISO(), request.id);
  });
  res.json(await getRequest(request.id));
}));

export default router;