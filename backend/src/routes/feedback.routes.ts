import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { nowISO } from '../config.js';
import { asyncHandler } from '../async-handler.js';

const router = Router();
router.use(requireAuth);

interface FeedbackRow {
  id: string;
  complaint_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

router.get('/', asyncHandler(async (req, res) => {
  const rows =
    req.user!.role === 'admin'
      ? await db.prepare('SELECT * FROM feedback ORDER BY created_at DESC').all<FeedbackRow>()
      : await db.prepare('SELECT * FROM feedback WHERE user_id = ? ORDER BY created_at DESC').all<FeedbackRow>(req.user!.id);
  res.json(rows);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { complaint_id, rating, comment } = req.body as { complaint_id?: string; rating?: number; comment?: string | null };
  const parsedRating = Number(rating);
  if (!complaint_id || !Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ error: 'A complaint id and rating between 1 and 5 are required' });
  }

  const complaint = await db.prepare('SELECT * FROM complaints WHERE id = ?').get<{ id: string; user_id: string; status: string }>(complaint_id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
  if (complaint.user_id !== req.user!.id) return res.status(403).json({ error: 'You can only rate your own complaints' });
  if (complaint.status !== 'resolved') return res.status(400).json({ error: 'Feedback can only be given on resolved complaints' });

  const existing = await db.prepare('SELECT id FROM feedback WHERE complaint_id = ?').get(complaint_id);
  if (existing) return res.status(409).json({ error: 'Feedback already submitted for this complaint' });

  const id = randomUUID();
  await db.prepare('INSERT INTO feedback (id, complaint_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, complaint_id, req.user!.id, parsedRating, comment ?? null, nowISO(),
  );

  const row = (await db.prepare('SELECT * FROM feedback WHERE id = ?').get<FeedbackRow>(id))!;
  res.status(201).json(row);
}));

export default router;
