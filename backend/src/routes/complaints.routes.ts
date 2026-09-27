import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, nowISO } from '../config.js';
import { asyncHandler } from '../async-handler.js';

const router = Router();
router.use(requireAuth);

const COMPLAINT_STATUSES_OK = ['pending', 'in_progress', 'resolved'] as const;

interface ComplaintRow {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string;
  room_number: string;
  priority: string;
  status: string;
  image_url: string | null;
  admin_notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

const getComplaint = (id: string): Promise<ComplaintRow | undefined> =>
  db.prepare('SELECT * FROM complaints WHERE id = ?').get<ComplaintRow>(id);

router.get('/', asyncHandler(async (req, res) => {
  const rows =
    req.user!.role === 'admin'
      ? await db.prepare('SELECT * FROM complaints ORDER BY created_at DESC').all<ComplaintRow>()
      : await db.prepare('SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC').all<ComplaintRow>(req.user!.id);
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { title, description, category, priority, room_number, image_url } = req.body as Record<string, string | null>;
  if (!title?.trim() || !description?.trim()) return res.status(400).json({ error: 'Title and description are required' });
  if (!COMPLAINT_CATEGORIES.includes(category as never)) return res.status(400).json({ error: 'Invalid category' });
  if (priority && !COMPLAINT_PRIORITIES.includes(priority as never)) return res.status(400).json({ error: 'Invalid priority' });

  const user = await db.prepare('SELECT room_number, full_name FROM users WHERE id = ?').get<{ room_number: string | null }>(req.user!.id);

  const id = randomUUID();
  const now = nowISO();
  await db.prepare(
    `INSERT INTO complaints (id, user_id, category, title, description, room_number, priority, status, image_url, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
  ).run(
    id,
    req.user!.id,
    category,
    title.trim(),
    description.trim(),
    room_number?.trim() || user?.room_number || 'Unknown',
    priority || 'medium',
    image_url || null,
    now,
    now,
  );

  res.status(201).json(await getComplaint(id));
}));

// Admins can change status/notes/priority; students can edit their own pending complaints.
router.patch('/:id', asyncHandler(async (req, res) => {
  const complaint = await getComplaint(req.params.id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  const body = req.body as Record<string, string | null | undefined>;
  const isAdmin = req.user!.role === 'admin';
  const isOwner = complaint.user_id === req.user!.id;
  if (!isAdmin && !isOwner) return res.status(403).json({ error: 'You can only edit your own complaints' });
  if (!isAdmin && complaint.status !== 'pending') {
    return res.status(403).json({ error: 'Only pending complaints can be edited' });
  }
  if (!isAdmin && (body.status !== undefined || body.admin_notes !== undefined)) {
    return res.status(403).json({ error: 'Only admins can change the status' });
  }

  const nextStatus = body.status ?? complaint.status;
  if (!COMPLAINT_STATUSES_OK.includes(nextStatus as never)) return res.status(400).json({ error: 'Invalid status' });

  const resolving = nextStatus === 'resolved' && complaint.status !== 'resolved';
  await db.prepare(
    `UPDATE complaints SET
       title = ?, description = ?, category = ?, priority = ?, room_number = ?, image_url = ?,
       status = ?, admin_notes = ?, resolved_at = ?, resolved_by = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    (body.title ?? complaint.title).trim(),
    (body.description ?? complaint.description).trim(),
    body.category ?? complaint.category,
    body.priority ?? complaint.priority,
    (body.room_number ?? complaint.room_number).trim(),
    body.image_url !== undefined ? body.image_url : complaint.image_url,
    nextStatus,
    isAdmin ? (body.admin_notes !== undefined ? body.admin_notes : complaint.admin_notes) : complaint.admin_notes,
    resolving ? nowISO() : complaint.resolved_at,
    resolving ? req.user!.id : complaint.resolved_by,
    nowISO(),
    complaint.id,
  );

  res.json(await getComplaint(complaint.id));
}));

export default router;
