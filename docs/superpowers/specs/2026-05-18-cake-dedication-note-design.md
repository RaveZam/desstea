# Cake Dedication Note — Design

**Date:** 2026-05-18
**Status:** Approved (pending spec review)

## Problem

Cakes are often bought for occasions (birthdays, anniversaries). Today the POS has no way to capture a personal message ("Happy Birthday Maria") to write on the cake, so staff have to remember it verbally or scribble it on a paper ticket. We want first-class support for a dedication note that flows from the POS through to the kitchen ticket and order records.

## Scope

- Cashier can attach an optional, 200-character dedication note to any product in a "dedication-capable" category (initially: Cakes).
- The note travels with the order line item and surfaces on the receipt, kitchen/prep ticket, mobile order detail, and the website admin order detail.
- Categories — not individual products — declare whether they support dedication. Admins can enable it for other categories later without a code change.

## Out of Scope (YAGNI)

- Per-product overrides (`has_dedication` on `products`).
- Editing a dedication after the order is placed.
- Font/style choice for the note; it's plain text.
- Image attachments or photo cakes.
- Filtering, searching, or reporting on dedication note content.

## Data Model

### Supabase

1. **`categories.supports_dedication BOOLEAN NOT NULL DEFAULT false`**
   Seed migration sets this to `true` for the existing "Cakes" category (matched by name in the migration script).
2. **`order_items.dedication_note TEXT NULL`**
   Customer-provided text, max 200 chars enforced at the app layer. Not named `_snapshot` because it is not a frozen copy of product data — it's user input captured at order time. `NULL` when no note was provided.

No new tables. Existing rows continue to work because both columns are nullable / defaulted.

### Mobile SQLite (`lib/database.ts`)

1. `categories` table gains `supports_dedication INTEGER NOT NULL DEFAULT 0` (matching the codebase convention of integer 0/1 for booleans).
2. The local order-items / outbox table gains `dedication_note TEXT NULL`.
3. Schema version is bumped; an `ALTER TABLE` migration adds both columns to existing installations.
4. Watermark sync (`lib/sync.ts`) automatically picks up the new columns once they are added to the `SELECT` lists and row mappers.

## Mobile POS Behavior

### Types (`features/pos/types.ts`)

- `LocalCategory` gains `supports_dedication: number` (0 | 1).
- `ProductCustomization` gains `dedicationNote: string | null`.

### Customization sheet

- When the user opens the customization sheet for a product whose category has `supports_dedication === 1`, a "Dedication note (optional)" `TextInput` is rendered.
- Multiline, max length 200, live character counter ("123 / 200").
- Placeholder: *e.g., Happy Birthday Maria*.
- Empty / whitespace-only input is normalized to `null` before being stored on the `OrderItem`.

### Cart de-duplication and quantity

- `getItemKey` in `features/pos/types.ts` includes the dedication note in its hash. Two cakes with different notes therefore produce different keys and never merge into one line.
- When `dedicationNote` is non-null, the add-to-cart action forces the new line item's `quantity` to `1`. Cakes without a note continue to stack normally (qty increments on subsequent adds of the same configuration).
- This guarantees one cake = one message; ordering two cakes with the same message yields two distinct line items, each qty 1.

### Receipt and kitchen ticket

- The printer feature (`features/printer/`) prints the note on its own line directly beneath the cake line item, prefixed (e.g., `Msg: <note>`) so the person decorating the cake cannot miss it.
- Note formatting follows the existing line-item indentation/style used for customizations like size and addons.

### Order detail screen

- Mobile order history detail view renders the note inline beneath the cake item, with the same visual weight as size / sugar / flavor.

## Website Admin Behavior

- The Next.js admin dashboard order detail page renders the dedication note inline beneath the cake line item, styled consistently with existing line-item customization rows.
- No new pages, no list filtering, no search on note content.
- Server Components already fetch order items from Supabase, so the new `dedication_note` column flows through to the view with no architecture change.

## Rollout Order

The columns must exist before either app references them, and the migration is backwards-compatible so it can ship first without coordination:

1. **Supabase migration**
   - Add `categories.supports_dedication` (default `false`).
   - Add `order_items.dedication_note` (nullable).
   - Set `supports_dedication = true` for the Cakes category.
2. **Mobile app**
   - Bump SQLite schema version and add the two columns via `ALTER TABLE`.
   - Update sync `SELECT`s and row mappers.
   - Extend types, customization sheet, cart key/quantity logic, receipt printer, and order detail screen.
3. **Website**
   - Surface the note in the admin order detail view.

Old app versions still in the field continue to work because they ignore unknown columns; orders they create simply have `dedication_note = NULL`.

## Testing

- **Mobile:** add a cake with no note (stacks to qty 2 on second add); add a cake with a note (creates separate qty-1 line); add two cakes with different notes (two separate lines); add a non-cake product (no note input rendered); print a receipt and confirm the `Msg:` line appears under the cake; view the order in the order detail screen.
- **Website:** open an order containing a cake with a note in the admin dashboard and confirm the note is visible beneath the cake line item.
- **Sync:** create an order on a fresh install and confirm `dedication_note` round-trips through the outbox to Supabase.

## Open Questions

None at this time.
