import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("desstea-v.1.db");

export async function initDatabase() {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS categories (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT,
      created_at  TEXT,
      synced_at   TEXT
    );

    CREATE TABLE IF NOT EXISTS addon_groups (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      category_id TEXT REFERENCES categories(id),
      synced_at   TEXT
    );

    CREATE TABLE IF NOT EXISTS addon_options (
      id             TEXT PRIMARY KEY,
      addon_group_id TEXT NOT NULL REFERENCES addon_groups(id),
      name           TEXT NOT NULL,
      price_modifier REAL NOT NULL DEFAULT 0.00,
      is_available   INTEGER NOT NULL DEFAULT 1,
      sort_order     INTEGER NOT NULL DEFAULT 0,
      synced_at      TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id                 TEXT PRIMARY KEY,
      category_id        TEXT NOT NULL REFERENCES categories(id),
      addon_group_id     TEXT REFERENCES addon_groups(id),
      name               TEXT NOT NULL,
      description        TEXT,
      base_price         REAL NOT NULL DEFAULT 0.00,
      has_sizes          INTEGER NOT NULL DEFAULT 0,
      is_available       INTEGER NOT NULL DEFAULT 1,
      created_at         TEXT,
      deleted_at         TEXT,
      synced_at          TEXT
    );

    CREATE TABLE IF NOT EXISTS product_sizes (
      id         TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      label      TEXT NOT NULL,
      size_price REAL NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      synced_at  TEXT
    );

    -- Watermark table: tracks the last successful sync timestamp
    CREATE TABLE IF NOT EXISTS sync_meta (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}
