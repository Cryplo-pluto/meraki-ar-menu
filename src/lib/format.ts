export function formatKwacha(amount: number): string {
  return `K${amount.toLocaleString("en-ZM")}`;
}

export function categoryLabel(slug: string): string {
  const map: Record<string, string> = {
    "all-day-breakfast": "All-day breakfast",
    burgers: "Burgers",
    bowls: "Bowls",
    smoothies: "Smoothies",
    coffee: "Coffee & drinks",
    sweets: "Sweets",
    cakes: "Cakes",
  };
  return map[slug] ?? slug.replace(/-/g, " ");
}

export const CATEGORY_ORDER = [
  "all-day-breakfast",
  "burgers",
  "bowls",
  "smoothies",
  "coffee",
  "sweets",
] as const;