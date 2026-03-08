import type { Cake } from "../backend.d";

// Sample cakes used as fallback display data when backend returns empty
export const SAMPLE_CAKES: Cake[] = [
  {
    id: BigInt(1),
    name: "Chocolate Indulgence",
    description:
      "Rich dark chocolate layers with ganache drizzle and fresh strawberries",
    price: BigInt(4500),
    category: "Chocolate",
    available: true,
    imageUrl: "/assets/generated/cake-chocolate.dim_600x600.jpg",
  },
  {
    id: BigInt(2),
    name: "Vanilla Rose",
    description:
      "Delicate vanilla sponge with hand-piped buttercream roses and edible pearls",
    price: BigInt(3800),
    category: "Vanilla",
    available: true,
    imageUrl: "/assets/generated/cake-vanilla.dim_600x600.jpg",
  },
  {
    id: BigInt(3),
    name: "Red Velvet Dream",
    description:
      "Classic red velvet layers with luxurious cream cheese frosting",
    price: BigInt(4200),
    category: "Classic",
    available: true,
    imageUrl: "/assets/generated/cake-redvelvet.dim_600x600.jpg",
  },
  {
    id: BigInt(4),
    name: "Lemon Sunshine",
    description: "Zesty lemon drizzle cake with lemon glaze and edible flowers",
    price: BigInt(3500),
    category: "Fruit",
    available: true,
    imageUrl: "/assets/generated/cake-lemon.dim_600x600.jpg",
  },
  {
    id: BigInt(5),
    name: "Carrot Garden",
    description:
      "Wholesome carrot cake with cream cheese frosting and candied walnuts",
    price: BigInt(3600),
    category: "Classic",
    available: true,
    imageUrl: "/assets/generated/cake-carrot.dim_600x600.jpg",
  },
  {
    id: BigInt(6),
    name: "Strawberry Bliss",
    description:
      "Fresh strawberry shortcake with whipped cream and golden sponge layers",
    price: BigInt(4000),
    category: "Fruit",
    available: true,
    imageUrl: "/assets/generated/cake-strawberry.dim_600x600.jpg",
  },
];

export const SEED_CAKES = [
  {
    name: "Chocolate Indulgence",
    description:
      "Rich dark chocolate layers with ganache drizzle and fresh strawberries",
    price: BigInt(4500),
    category: "Chocolate",
    imageUrl: "/assets/generated/cake-chocolate.dim_600x600.jpg",
  },
  {
    name: "Vanilla Rose",
    description:
      "Delicate vanilla sponge with hand-piped buttercream roses and edible pearls",
    price: BigInt(3800),
    category: "Vanilla",
    imageUrl: "/assets/generated/cake-vanilla.dim_600x600.jpg",
  },
  {
    name: "Red Velvet Dream",
    description:
      "Classic red velvet layers with luxurious cream cheese frosting",
    price: BigInt(4200),
    category: "Classic",
    imageUrl: "/assets/generated/cake-redvelvet.dim_600x600.jpg",
  },
  {
    name: "Lemon Sunshine",
    description: "Zesty lemon drizzle cake with lemon glaze and edible flowers",
    price: BigInt(3500),
    category: "Fruit",
    imageUrl: "/assets/generated/cake-lemon.dim_600x600.jpg",
  },
  {
    name: "Carrot Garden",
    description:
      "Wholesome carrot cake with cream cheese frosting and candied walnuts",
    price: BigInt(3600),
    category: "Classic",
    imageUrl: "/assets/generated/cake-carrot.dim_600x600.jpg",
  },
  {
    name: "Strawberry Bliss",
    description:
      "Fresh strawberry shortcake with whipped cream and golden sponge layers",
    price: BigInt(4000),
    category: "Fruit",
    imageUrl: "/assets/generated/cake-strawberry.dim_600x600.jpg",
  },
];

export function formatPrice(cents: bigint): string {
  const dollars = Number(cents) / 100;
  return `$${dollars.toFixed(2)}`;
}

export const CATEGORIES = ["All", "Chocolate", "Vanilla", "Classic", "Fruit"];

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "delivered",
  "cancelled",
];
