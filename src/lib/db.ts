import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

const dbPath =
  process.env.DATABASE_PATH && process.env.DATABASE_PATH.length > 0
    ? process.env.DATABASE_PATH
    : path.join(process.cwd(), "data", "masjid.db");

const globalForDb = globalThis as unknown as { __sqlite?: Database.Database };

function initSqlite() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return sqlite;
}

const sqlite = globalForDb.__sqlite ?? initSqlite();
if (process.env.NODE_ENV !== "production") globalForDb.__sqlite = sqlite;

export const db = drizzle(sqlite, { schema });
