import { useState, useEffect } from "react";
import { db } from "@/lib/database";
import { useSyncVersion } from "@/lib/sync-context";
import { LocalProduct, LocalCategory, LocalCombo } from "../types";

export function useCatalog() {
  const syncVersion = useSyncVersion();
  const [categories, setCategories] = useState<LocalCategory[]>([]);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [combos, setCombos] = useState<LocalCombo[]>([]);

  useEffect(() => {
    const cats = db.getAllSync<LocalCategory>(
      `SELECT id, name FROM categories ORDER BY name`
    );
    const prods = db.getAllSync<LocalProduct>(
      `SELECT id, name, description, base_price, category_id,
              has_sizes, is_available, addon_group_id
       FROM products
       WHERE is_available = 1
       ORDER BY name`
    );
    const comboRows = db.getAllSync<LocalCombo>(
      `SELECT id, name, description, price, is_available
       FROM combos
       WHERE is_available = 1
       ORDER BY name`
    );
    setCategories(cats);
    setProducts(prods);
    setCombos(comboRows);
  }, [syncVersion]);

  return { categories, products, combos };
}
