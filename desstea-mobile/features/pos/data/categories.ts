export type Category = {
  id: string;
  label: string;
  icon: string;
};

export const categories: Category[] = [
  { id: "coffee", label: "Coffee", icon: "☕" },
  { id: "food", label: "Foods", icon: "🍱" },
  { id: "combo", label: "Combos", icon: "🍽️" },
];
