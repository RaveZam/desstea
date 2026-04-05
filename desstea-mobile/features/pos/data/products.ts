export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: number;
};

export type CoffeeSize = "Small" | "Medium" | "Large";
export type SugarLevel = 0 | 25 | 50 | 75 | 100;

export type CoffeeCustomization = {
  size: CoffeeSize;
  sugarLevel: SugarLevel;
};

export const SIZE_PRICE_ADJUSTMENT: Record<CoffeeSize, number> = {
  Small: 0,
  Medium: 20,
  Large: 40,
};

export type OrderItem = {
  product: Product;
  quantity: number;
  customization?: CoffeeCustomization;
};

export function getItemPrice(item: OrderItem): number {
  const sizeAdj = item.customization
    ? SIZE_PRICE_ADJUSTMENT[item.customization.size]
    : 0;
  return item.product.price + sizeAdj;
}

export function getItemKey(item: OrderItem): string {
  if (!item.customization) return item.product.id;
  return `${item.product.id}__${item.customization.size}__${item.customization.sugarLevel}`;
}

export const products: Product[] = [
  // ── COFFEE ──────────────────────────────────────────────────────────────
  {
    id: "c1",
    name: "Midnight Brew",
    description: "Rich dark roast with bold, smoky notes",
    price: 150,
    categoryId: "coffee",
    image: require("../../../assets/images/coffee/coffee1.webp"),
  },
  {
    id: "c2",
    name: "Golden Hour Latte",
    description: "Creamy espresso with warm golden milk",
    price: 165,
    categoryId: "coffee",
    image: require("../../../assets/images/coffee/coffee2.jpg"),
  },
  {
    id: "c3",
    name: "Sunrise Espresso",
    description: "Double shot espresso with a bright, fruity finish",
    price: 130,
    categoryId: "coffee",
    image: require("../../../assets/images/coffee/coffee3.jpg"),
  },
  {
    id: "c4",
    name: "Velvet Mocha",
    description: "Smooth espresso blended with dark chocolate",
    price: 175,
    categoryId: "coffee",
    image: require("../../../assets/images/coffee/coffee4.webp"),
  },
  {
    id: "c5",
    name: "Classic Americano",
    description: "Bold espresso diluted with hot water",
    price: 120,
    categoryId: "coffee",
    image: require("../../../assets/images/coffee/coffee5.webp"),
  },
  {
    id: "c6",
    name: "Caramel Cloud",
    description: "Espresso topped with caramel foam and drizzle",
    price: 180,
    categoryId: "coffee",
    image: require("../../../assets/images/coffee/coffee6.webp"),
  },
  {
    id: "c7",
    name: "Brown Sugar Latte",
    description: "Espresso with brown sugar syrup and steamed milk",
    price: 170,
    categoryId: "coffee",
    image: require("../../../assets/images/coffee/coffee7.webp"),
  },
  {
    id: "c8",
    name: "Hazelnut Bliss",
    description: "Smooth latte with a nutty hazelnut finish",
    price: 160,
    categoryId: "coffee",
    image: require("../../../assets/images/coffee/coffee8.webp"),
  },

  // ── FOODS ────────────────────────────────────────────────────────────────
  {
    id: "f1",
    name: "Beef Tapa",
    description: "Tender marinated beef strips served with garlic rice",
    price: 220,
    categoryId: "food",
    image: require("../../../assets/images/food/beef.webp"),
  },
  {
    id: "f2",
    name: "Chicken & Egg",
    description: "Pan-fried chicken with sunny-side-up egg",
    price: 200,
    categoryId: "food",
    image: require("../../../assets/images/food/chickenegg.jpg"),
  },
  {
    id: "f3",
    name: "Lumpiang Shanghai",
    description: "Crispy pork spring rolls with sweet & sour dip",
    price: 150,
    categoryId: "food",
    image: require("../../../assets/images/food/lumpia.jpg"),
  },
  {
    id: "f4",
    name: "Samgyup Bowl",
    description: "Grilled pork belly over steamed rice with banchan",
    price: 250,
    categoryId: "food",
    image: require("../../../assets/images/food/samgyupbwl.webp"),
  },
  {
    id: "f5",
    name: "Siomai",
    description: "Steamed pork dumplings with chili-soy dipping sauce",
    price: 120,
    categoryId: "food",
    image: require("../../../assets/images/food/siomai.jpg"),
  },

  // ── COMBOS ──────────────────────────────────────────────────────────────
  {
    id: "m1",
    name: "Combo 1",
    description: "Coffee + food pairing for a complete meal deal",
    price: 280,
    categoryId: "combo",
    image: require("../../../assets/images/combo/combo1.png"),
  },
  {
    id: "m2",
    name: "Combo 2",
    description: "Two drinks and a snack at a great value",
    price: 300,
    categoryId: "combo",
    image: require("../../../assets/images/combo/combo2.png"),
  },
  {
    id: "m3",
    name: "Combo 3",
    description: "Hearty meal with your choice of hot drink",
    price: 320,
    categoryId: "combo",
    image: require("../../../assets/images/combo/combo3.png"),
  },
  {
    id: "m4",
    name: "Combo 4",
    description: "Sharing platter with two coffees included",
    price: 350,
    categoryId: "combo",
    image: require("../../../assets/images/combo/combo4.png"),
  },
  {
    id: "m5",
    name: "Combo 5",
    description: "Premium bundle — full meal with specialty brew",
    price: 390,
    categoryId: "combo",
    image: require("../../../assets/images/combo/combo5.png"),
  },
];
