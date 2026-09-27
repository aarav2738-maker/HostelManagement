import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { MESS_DAYS, MESS_MEAL_FIELDS } from '../config.js';
import { asyncHandler } from '../async-handler.js';

const router = Router();

interface MenuRow {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

const fullMenu = async (): Promise<MenuRow[]> => {
  const rows = await db.prepare('SELECT * FROM mess_menu').all<MenuRow>();
  return MESS_DAYS
    .map((day) => rows.find((r) => r.day === day))
    .filter((r): r is MenuRow => Boolean(r));
};

router.get('/', asyncHandler(async (_req, res) => {
  res.json(await fullMenu());
}));

router.put('/', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { day, field, value } = req.body as { day?: string; field?: string; value?: string };
  if (!day || !MESS_DAYS.includes(day as never)) return res.status(400).json({ error: 'Invalid day' });
  if (!field || !MESS_MEAL_FIELDS.includes(field as never)) return res.status(400).json({ error: 'Invalid meal field' });
  if (typeof value !== 'string') return res.status(400).json({ error: 'A menu value is required' });

  const result = await db.prepare(`UPDATE mess_menu SET ${field} = ? WHERE day = ?`).run(value, day);
  if (result.changes === 0) return res.status(404).json({ error: 'Menu day not found' });

  res.json(await fullMenu());
}));

export default router;
