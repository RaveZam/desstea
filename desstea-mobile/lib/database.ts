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

    CREATE TABLE IF NOT EXISTS combos (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      description  TEXT,
      price        REAL NOT NULL DEFAULT 0.00,
      is_available INTEGER NOT NULL DEFAULT 1,
      created_at   TEXT,
      deleted_at   TEXT,
      synced_at    TEXT
    );

    CREATE TABLE IF NOT EXISTS combo_slots (
      id          TEXT PRIMARY KEY,
      combo_id    TEXT NOT NULL REFERENCES combos(id),
      category_id TEXT,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      synced_at   TEXT
    );

    CREATE TABLE IF NOT EXISTS combo_slot_products (
      id            TEXT PRIMARY KEY,
      combo_slot_id TEXT NOT NULL REFERENCES combo_slots(id),
      product_id    TEXT NOT NULL,
      quantity      INTEGER NOT NULL DEFAULT 1,
      synced_at     TEXT
    );

    -- Watermark table: tracks the last successful sync timestamp
    CREATE TABLE IF NOT EXISTS sync_meta (
      key   TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id              TEXT PRIMARY KEY,
      branch_id       TEXT NOT NULL,
      customer_name   TEXT,
      total           REAL NOT NULL,
      payment_method  TEXT NOT NULL,
      ordered_at      TEXT NOT NULL,
      created_at      TEXT NOT NULL,
      cash_tendered   REAL,
      cash_change     REAL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id                     TEXT PRIMARY KEY,
      order_id               TEXT NOT NULL REFERENCES orders(id),
      item_type              TEXT NOT NULL DEFAULT 'product',
      combo_id               TEXT,
      combo_name_snapshot    TEXT,
      product_id             TEXT,
      product_size_id        TEXT,
      product_name_snapshot  TEXT NOT NULL,
      size_label_snapshot    TEXT,
      quantity               INTEGER NOT NULL CHECK(quantity > 0),
      unit_price_snapshot    REAL NOT NULL,
      created_at             TEXT NOT NULL,
      total_price            REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_item_combo_selections (
      id                    TEXT PRIMARY KEY,
      order_item_id         TEXT NOT NULL REFERENCES order_items(id),
      combo_slot_id         TEXT NOT NULL,
      slot_name_snapshot    TEXT NOT NULL,
      product_id            TEXT NOT NULL,
      product_name_snapshot TEXT NOT NULL,
      created_at            TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_item_addons (
      id                      TEXT PRIMARY KEY,
      order_item_id           TEXT NOT NULL REFERENCES order_items(id),
      addon_option_id         TEXT,
      addon_name_snapshot     TEXT NOT NULL,
      price_modifier_snapshot REAL NOT NULL DEFAULT 0.00,
      quantity                INTEGER NOT NULL CHECK(quantity > 0),
      created_at              TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS outbox (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      record_id  TEXT NOT NULL,
      payload    TEXT NOT NULL,
      priority   INTEGER NOT NULL DEFAULT 0,
      status     TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );
  `);

  // Migrations for existing databases — safe to re-run (errors ignored)
  const migrations = [
    `ALTER TABLE order_items ADD COLUMN item_type TEXT NOT NULL DEFAULT 'product'`,
    `ALTER TABLE order_items ADD COLUMN combo_id TEXT`,
    `ALTER TABLE order_items ADD COLUMN combo_name_snapshot TEXT`,
    `ALTER TABLE combo_slot_products ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1`,
  ];
  for (const sql of migrations) {
    try {
      await db.execAsync(sql);
    } catch {
      // Column already exists on fresh databases — ignore
    }
  }

  // Rebuild combo_slots if it still has the legacy 'name' column (schema drift fix)
  const hasNameCol = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM pragma_table_info('combo_slots') WHERE name = 'name'`
  );
  if (hasNameCol && hasNameCol.count > 0) {
    await db.execAsync(`
      CREATE TABLE combo_slots_new (
        id          TEXT PRIMARY KEY,
        combo_id    TEXT NOT NULL REFERENCES combos(id),
        category_id TEXT,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        synced_at   TEXT
      );
      DROP TABLE combo_slot_products;
      DROP TABLE combo_slots;
      ALTER TABLE combo_slots_new RENAME TO combo_slots;
      CREATE TABLE combo_slot_products (
        id            TEXT PRIMARY KEY,
        combo_slot_id TEXT NOT NULL REFERENCES combo_slots(id),
        product_id    TEXT NOT NULL,
        quantity      INTEGER NOT NULL DEFAULT 1,
        synced_at     TEXT
      );
    `);
  }
}
