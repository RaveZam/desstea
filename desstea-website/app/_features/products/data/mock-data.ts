import type { Product } from "../../../_types";

export const mockProducts: Product[] = [
  // ── Coffee ────────────────────────────────────────────────
  {
    id: "prod-1",
    name: "Classic Milk Tea",
    description: "Our signature blend of black tea with creamy milk and chewy tapioca pearls.",
    basePrice: 90,
    category: "Coffee",
    sizes: [
      { size: "S", priceAdjustment: 0 },
      { size: "M", priceAdjustment: 15 },
      { size: "L", priceAdjustment: 30 },
    ],
    addOns: [
      { name: "Extra Pearls", price: 15 },
      { name: "Cheese Foam", price: 30 },
      { name: "Pudding", price: 20 },
    ],
    availability: ["br-1", "br-2", "br-3", "br-4"],
  },
  {
    id: "prod-2",
    name: "Matcha Latte",
    description: "Premium ceremonial grade matcha whisked with steamed oat milk.",
    basePrice: 115,
    category: "Coffee",
    sizes: [
      { size: "S", priceAdjustment: 0 },
      { size: "M", priceAdjustment: 10 },
      { size: "L", priceAdjustment: 20 },
    ],
    addOns: [
      { name: "Oat Milk Upgrade", price: 20 },
      { name: "Matcha Shot", price: 25 },
    ],
    availability: ["br-1", "br-2", "br-3"],
  },
  {
    id: "prod-3",
    name: "Brown Sugar Boba",
    description: "Tiger milk tea with brown sugar syrup and fresh tapioca pearls.",
    basePrice: 100,
    category: "Coffee",
    sizes: [
      { size: "S", priceAdjustment: 0 },
      { size: "M", priceAdjustment: 10 },
      { size: "L", priceAdjustment: 20 },
    ],
    addOns: [
      { name: "Extra Pearls", price: 15 },
      { name: "Cheese Foam", price: 30 },
    ],
    availability: ["br-1", "br-2", "br-3", "br-4"],
  },
  {
    id: "prod-4",
    name: "Taro Tea",
    description: "Creamy taro root blended with milk tea for a naturally sweet, nutty flavor.",
    basePrice: 95,
    category: "Coffee",
    sizes: [
      { size: "S", priceAdjustment: 0 },
      { size: "M", priceAdjustment: 10 },
      { size: "L", priceAdjustment: 20 },
    ],
    addOns: [
      { name: "Pudding", price: 20 },
      { name: "Grass Jelly", price: 15 },
    ],
    availability: ["br-1", "br-2", "br-3", "br-4"],
  },
  {
    id: "prod-5",
    name: "Wintermelon Tea",
    description: "Refreshing wintermelon-infused tea with a light, sweet finish.",
    basePrice: 85,
    category: "Coffee",
    sizes: [
      { size: "S", priceAdjustment: 0 },
      { size: "M", priceAdjustment: 15 },
      { size: "L", priceAdjustment: 30 },
    ],
    addOns: [
      { name: "Lychee Jelly", price: 15 },
      { name: "Grass Jelly", price: 15 },
    ],
    availability: ["br-1", "br-2", "br-4"],
  },
  {
    id: "prod-6",
    name: "Ube Milk Tea",
    description: "Vibrant purple ube flavored milk tea, a Filipino twist on classic boba.",
    basePrice: 100,
    category: "Coffee",
    sizes: [
      { size: "S", priceAdjustment: 0 },
      { size: "M", priceAdjustment: 20 },
      { size: "L", priceAdjustment: 30 },
    ],
    addOns: [
      { name: "Extra Pearls", price: 15 },
      { name: "Cheese Foam", price: 30 },
    ],
    availability: ["br-1", "br-3", "br-4"],
  },
  // ── Foods ────────────────────────────────────────────────
  {
    id: "prod-7",
    name: "Toasted Siopao",
    description: "Fluffy steamed bun toasted golden, filled with asado pork.",
    basePrice: 65,
    category: "Foods",
    sizes: [],
    addOns: [
      { name: "Extra Sauce", price: 10 },
    ],
    availability: ["br-1", "br-2", "br-3"],
  },
  {
    id: "prod-8",
    name: "Pandesal",
    description: "Classic Filipino soft bread rolls, freshly baked and served warm.",
    basePrice: 45,
    category: "Foods",
    sizes: [],
    addOns: [
      { name: "Butter", price: 10 },
      { name: "Ube Jam", price: 15 },
    ],
    availability: ["br-1", "br-2", "br-3", "br-4"],
  },
  {
    id: "prod-9",
    name: "Ensaymada",
    description: "Buttery Filipino coiled bread topped with sugar and quezo de bola.",
    basePrice: 75,
    category: "Foods",
    sizes: [],
    addOns: [],
    availability: ["br-1", "br-2"],
  },
  {
    id: "prod-10",
    name: "Cheese Sticks",
    description: "Crispy fried sticks filled with melted cheese, served with sweet chili dip.",
    basePrice: 55,
    category: "Foods",
    sizes: [],
    addOns: [
      { name: "Extra Dip", price: 10 },
    ],
    availability: ["br-1", "br-2", "br-4"],
  },
  // ── Combos ───────────────────────────────────────────────
  {
    id: "prod-11",
    name: "Pandesal Combo",
    description: "Classic Milk Tea (M) + 2 Pandesal. Perfect morning pairing.",
    basePrice: 115,
    category: "Combos",
    sizes: [],
    addOns: [
      { name: "Upgrade to L", price: 15 },
    ],
    availability: ["br-1", "br-2", "br-3", "br-4"],
  },
  {
    id: "prod-12",
    name: "Ensaymada Combo",
    description: "Matcha Latte (M) + Ensaymada. A rich, indulgent treat.",
    basePrice: 165,
    category: "Combos",
    sizes: [],
    addOns: [],
    availability: ["br-1", "br-2"],
  },
  {
    id: "prod-13",
    name: "Cheese Sticks Combo",
    description: "Brown Sugar Boba (M) + Cheese Sticks. Sweet meets savory.",
    basePrice: 140,
    category: "Combos",
    sizes: [],
    addOns: [
      { name: "Extra Cheese Sticks", price: 55 },
    ],
    availability: ["br-1", "br-2", "br-4"],
  },
];

export const allBranchOptions = [
  { id: "br-1", name: "Ipil, Echague" },
  { id: "br-2", name: "Cabugao, Echague" },
  { id: "br-3", name: "Santiago City" },
  { id: "br-4", name: "Cauayan City" },
];
