import { AsyncLocalStorage } from 'node:async_hooks';
import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { config, nowISO } from './config.js';

const transactionClient = new AsyncLocalStorage<PoolClient>();
const connectionUrl = new URL(config.databaseUrl);
if (!connectionUrl.searchParams.has('sslmode')) connectionUrl.searchParams.set('sslmode', 'require');
connectionUrl.searchParams.set('uselibpqcompat', 'true');
const pool = new Pool({
  connectionString: connectionUrl.toString(),
});

const tableNames = [
  'users', 'complaints', 'feedback', 'mess_menu', 'room_requests',
  'roommate_assignments', 'roommate_requests',
].join('|');

const toPostgresSql = (sql: string): string => {
  let parameterIndex = 0;
  return sql
    .replace(new RegExp(`\\b(${tableNames})\\b`, 'g'), 'hostel_$1')
    .replace(/\?/g, () => `$${++parameterIndex}`);
};

async function execute<Row extends QueryResultRow>(sql: string, params: unknown[] = []) {
  const client = transactionClient.getStore() ?? pool;
  return client.query<Row>(toPostgresSql(sql), params);
}

export const db = {
  prepare(sql: string) {
    return {
      get: async <Row extends QueryResultRow = QueryResultRow>(...params: unknown[]): Promise<Row | undefined> =>
        (await execute<Row>(sql, params)).rows[0],
      all: async <Row extends QueryResultRow = QueryResultRow>(...params: unknown[]): Promise<Row[]> =>
        (await execute<Row>(sql, params)).rows,
      run: async (...params: unknown[]): Promise<{ changes: number }> => {
        const result = await execute(sql, params);
        return { changes: result.rowCount ?? 0 };
      },
    };
  },
};

export async function transaction<T>(work: () => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await transactionClient.run(client, work);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

const DEFAULT_MENU: Array<{ day: string; breakfast: string; lunch: string; dinner: string }> = [
  { day: 'Monday', breakfast: 'Idli Sambar', lunch: 'Rajma Chawal, Roti, Salad', dinner: 'Dal Makhani, Mix Veg, Roti' },
  { day: 'Tuesday', breakfast: 'Poha, Jalebi', lunch: 'Kadi Pakora, Rice, Roti', dinner: 'Paneer Butter Masala, Roti, Dessert' },
  { day: 'Wednesday', breakfast: 'Aloo Paratha, Curd', lunch: 'Chole Bhature, Rice', dinner: 'Egg Curry / Soyabean, Roti' },
  { day: 'Thursday', breakfast: 'Upma, Chutney', lunch: 'Dal Fry, Jeera Rice, Bhindi', dinner: 'Chicken Curry / Malai Kofta, Roti' },
  { day: 'Friday', breakfast: 'Puri Sabji', lunch: 'Veg Biryani, Raita', dinner: 'Dal Tadka, Aloo Gobi, Roti' },
  { day: 'Saturday', breakfast: 'Masala Dosa, Sambar', lunch: 'Veg Pulao, Raita, Papad', dinner: 'Chole, Rice, Roti' },
  { day: 'Sunday', breakfast: 'Besan Chilla, Chutney', lunch: 'Special Thali (Paneer, Dal, Rice, Roti)', dinner: 'Fried Rice, Manchurian' },
];

export async function initializeDatabase(): Promise<void> {
  if (!config.databaseUrl) throw new Error('DATABASE_URL must point to the Supabase PostgreSQL database');

  const seedMenu = db.prepare(
    'INSERT INTO mess_menu (day, breakfast, lunch, dinner) VALUES (?, ?, ?, ?) ON CONFLICT (day) DO NOTHING',
  );
  for (const meal of DEFAULT_MENU) {
    await seedMenu.run(meal.day, meal.breakfast, meal.lunch, meal.dinner);
  }

  const admin = await db.prepare('SELECT id FROM users WHERE email = ?').get(config.adminEmail);
  if (!admin) {
    await db.prepare(
      "INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, 'admin', ?, ?)",
    ).run(randomUUID(), config.adminEmail, bcrypt.hashSync(config.adminPassword, 10), config.adminName, nowISO(), nowISO());
    console.log(`[db] Seeded admin account ${config.adminEmail}`);
  }
}
