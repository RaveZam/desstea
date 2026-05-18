-- Cake dedication note feature
-- 2026-05-18
--
-- 1. Add supports_dedication to categories so admins can declare which
--    categories allow a per-line dedication message (initial: Cakes).
-- 2. Add dedication_note to order_items so the message travels with the
--    line item. Not a *_snapshot because it is customer input, not a
--    frozen copy of product data.
-- 3. Flip supports_dedication on the existing Cakes category. The match
--    is case-insensitive on the category name.

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS supports_dedication BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS dedication_note TEXT NULL;

UPDATE categories
SET supports_dedication = true
WHERE lower(name) = 'cakes';
