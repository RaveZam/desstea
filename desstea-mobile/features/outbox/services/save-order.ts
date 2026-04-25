import { db } from "@/lib/database";
import { OrderItem, getItemPrice } from "@/features/pos/types";

function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type SaveOrderParams = {
  orderItems: OrderItem[];
  customerName: string;
  paymentMethod: "Cash" | "GCash";
  total: number;
  cashTendered?: number;
  branchId: string;
};

export async function saveOrderLocally(params: SaveOrderParams): Promise<string> {
  const {
    orderItems,
    customerName,
    paymentMethod,
    total,
    cashTendered,
    branchId,
  } = params;

  const orderId = uuidv4();
  const now = new Date().toISOString();
  const cashChange =
    cashTendered != null ? cashTendered - total : null;

  await db.withTransactionAsync(async () => {
    // INSERT order
    await db.runAsync(
      `INSERT INTO orders (id, branch_id, customer_name, total, payment_method, ordered_at, created_at, cash_tendered, cash_change)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        branchId,
        customerName || null,
        total,
        paymentMethod,
        now,
        now,
        cashTendered ?? null,
        cashChange,
      ]
    );

    // Outbox entry for order (priority 1)
    await db.runAsync(
      `INSERT INTO outbox (table_name, record_id, payload, priority, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [
        "orders",
        orderId,
        JSON.stringify({
          id: orderId,
          branch_id: branchId,
          customer_name: customerName || null,
          total,
          payment_method: paymentMethod,
          ordered_at: now,
          created_at: now,
          cash_tendered: cashTendered ?? null,
        }),
        1,
        now,
      ]
    );

    for (const item of orderItems) {
      const itemId = uuidv4();
      const unitPrice = getItemPrice(item);
      const totalPrice = unitPrice * item.quantity;

      if (item.itemType === "combo") {
        const combo = item.combo!;

        // INSERT order_item (combo)
        await db.runAsync(
          `INSERT INTO order_items
             (id, order_id, combo_id, combo_name_snapshot,
              product_id, product_name_snapshot, quantity,
              unit_price_snapshot, created_at, total_price)
           VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?)`,
          [
            itemId,
            orderId,
            combo.id,
            combo.name,
            combo.name,
            item.quantity,
            unitPrice,
            now,
            totalPrice,
          ]
        );

        // Outbox entry for order_item (priority 2)
        await db.runAsync(
          `INSERT INTO outbox (table_name, record_id, payload, priority, status, created_at)
           VALUES (?, ?, ?, ?, 'pending', ?)`,
          [
            "order_items",
            itemId,
            JSON.stringify({
              id: itemId,
              order_id: orderId,
              combo_id: combo.id,
              combo_name_snapshot: combo.name,
              product_id: null,
              product_name_snapshot: combo.name,
              quantity: item.quantity,
              unit_price_snapshot: unitPrice,
              created_at: now,
            }),
            2,
            now,
          ]
        );

        // INSERT order_item_combo_selections (one per slot pick)
        for (const sel of item.comboSelections ?? []) {
          const selId = uuidv4();
          await db.runAsync(
            `INSERT INTO order_item_combo_selections
               (id, order_item_id, combo_slot_id, slot_name_snapshot,
                product_id, product_name_snapshot, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [selId, itemId, sel.slotId, sel.slotName, sel.productId, sel.productName, now]
          );

          // Outbox entry for selection (priority 3)
          await db.runAsync(
            `INSERT INTO outbox (table_name, record_id, payload, priority, status, created_at)
             VALUES (?, ?, ?, ?, 'pending', ?)`,
            [
              "order_item_combo_selections",
              selId,
              JSON.stringify({
                id: selId,
                order_item_id: itemId,
                combo_slot_id: sel.slotId,
                slot_name_snapshot: sel.slotName,
                product_id: sel.productId,
                product_name_snapshot: sel.productName,
                created_at: now,
              }),
              3,
              now,
            ]
          );

          // INSERT addons for this combo slot selection
          for (const aq of sel.addons.filter((a) => a.qty > 0)) {
            const addonId = uuidv4();

            await db.runAsync(
              `INSERT INTO order_item_addons (id, order_item_id, addon_option_id, addon_name_snapshot, price_modifier_snapshot, quantity, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [addonId, itemId, aq.option.id, aq.option.name, aq.option.price_modifier, aq.qty, now]
            );

            await db.runAsync(
              `INSERT INTO outbox (table_name, record_id, payload, priority, status, created_at)
               VALUES (?, ?, ?, ?, 'pending', ?)`,
              [
                "order_item_addons",
                addonId,
                JSON.stringify({
                  id: addonId,
                  order_item_id: itemId,
                  addon_option_id: aq.option.id,
                  addon_name_snapshot: aq.option.name,
                  price_modifier_snapshot: aq.option.price_modifier,
                  quantity: aq.qty,
                  created_at: now,
                }),
                3,
                now,
              ]
            );
          }
        }
      } else {
        const sizeId = item.customization?.size?.id ?? null;
        const sizeLabel = item.customization?.size?.label ?? null;

        // INSERT order_item (product)
        await db.runAsync(
          `INSERT INTO order_items
             (id, order_id, combo_id, combo_name_snapshot,
              product_id, product_size_id, product_name_snapshot,
              size_label_snapshot, quantity, unit_price_snapshot, created_at, total_price)
           VALUES (?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            itemId,
            orderId,
            item.product.id,
            sizeId,
            item.product.name,
            sizeLabel,
            item.quantity,
            unitPrice,
            now,
            totalPrice,
          ]
        );

        // Outbox entry for order_item (priority 2)
        await db.runAsync(
          `INSERT INTO outbox (table_name, record_id, payload, priority, status, created_at)
           VALUES (?, ?, ?, ?, 'pending', ?)`,
          [
            "order_items",
            itemId,
            JSON.stringify({
              id: itemId,
              order_id: orderId,
              combo_id: null,
              combo_name_snapshot: null,
              product_id: item.product.id,
              product_size_id: sizeId,
              product_name_snapshot: item.product.name,
              size_label_snapshot: sizeLabel,
              quantity: item.quantity,
              unit_price_snapshot: unitPrice,
              created_at: now,
            }),
            2,
            now,
          ]
        );

        const activeAddons = (item.customization?.addonOptions ?? []).filter(
          (aq) => aq.qty > 0
        );

        for (const aq of activeAddons) {
          const addonId = uuidv4();

          // INSERT order_item_addon
          await db.runAsync(
            `INSERT INTO order_item_addons (id, order_item_id, addon_option_id, addon_name_snapshot, price_modifier_snapshot, quantity, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              addonId,
              itemId,
              aq.option.id,
              aq.option.name,
              aq.option.price_modifier,
              aq.qty,
              now,
            ]
          );

          // Outbox entry for addon (priority 3)
          await db.runAsync(
            `INSERT INTO outbox (table_name, record_id, payload, priority, status, created_at)
             VALUES (?, ?, ?, ?, 'pending', ?)`,
            [
              "order_item_addons",
              addonId,
              JSON.stringify({
                id: addonId,
                order_item_id: itemId,
                addon_option_id: aq.option.id,
                addon_name_snapshot: aq.option.name,
                price_modifier_snapshot: aq.option.price_modifier,
                quantity: aq.qty,
                created_at: now,
              }),
              3,
              now,
            ]
          );
        }
      }
    }
  });

  return orderId;
}
