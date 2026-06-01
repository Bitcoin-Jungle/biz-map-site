import Database from 'better-sqlite3';
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

export type SubmissionType = 'add' | 'verify' | 'report';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'handled';

export interface Submission<TPayload = unknown> {
  id: number;
  type: SubmissionType;
  status: SubmissionStatus;
  payload_json: string;
  btcmap_external_id: string | null;
  target_place_id: string | null;
  created_at: string;
  decided_at: string | null;
  payload: TPayload;
}

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) {
    return db;
  }

  const dbPath = resolve(process.env.DB_PATH ?? './data/submissions.db');
  mkdirSync(dirname(dbPath), { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('add','verify','report')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','handled')),
      payload_json TEXT NOT NULL,
      btcmap_external_id TEXT,
      target_place_id TEXT,
      created_at TEXT NOT NULL,
      decided_at TEXT
    );
  `);

  return db;
}

function hydrate(row: Omit<Submission, 'payload'> | undefined): Submission | null {
  if (!row) {
    return null;
  }

  return {
    ...row,
    payload: JSON.parse(row.payload_json) as unknown,
  };
}

export function insertSubmission(
  type: SubmissionType,
  payload: unknown,
  targetPlaceId: string | null = null,
): Submission {
  const createdAt = new Date().toISOString();
  const result = getDb()
    .prepare(`
      INSERT INTO submissions (type, payload_json, target_place_id, created_at)
      VALUES (@type, @payloadJson, @targetPlaceId, @createdAt)
    `)
    .run({
      type,
      payloadJson: JSON.stringify(payload),
      targetPlaceId,
      createdAt,
    });

  const submission = getSubmission(Number(result.lastInsertRowid));
  if (!submission) {
    throw new Error('Failed to load inserted submission');
  }

  return submission;
}

export function getSubmission(id: number): Submission | null {
  const row = getDb()
    .prepare('SELECT * FROM submissions WHERE id = ?')
    .get(id) as Omit<Submission, 'payload'> | undefined;

  return hydrate(row);
}

export function setStatus(id: number, status: SubmissionStatus, decidedAt = new Date().toISOString()): void {
  getDb()
    .prepare('UPDATE submissions SET status = ?, decided_at = ? WHERE id = ?')
    .run(status, decidedAt, id);
}

export function setExternalId(id: number, extId: string): void {
  if (!extId.includes(':')) {
    throw new Error('BTC Map external id must be namespaced');
  }

  getDb()
    .prepare('UPDATE submissions SET btcmap_external_id = ? WHERE id = ?')
    .run(extId, id);
}
