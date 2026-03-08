import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Cake } from "../backend.d";

export interface CartItem {
  cake: Cake;
  quantity: number;
}

interface CartContext {
  items: CartItem[];
  addItem: (cake: Cake) => void;
  removeItem: (cakeId: bigint) => void;
  updateQuantity: (cakeId: bigint, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: bigint;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContext | undefined>(undefined);

const CART_STORAGE_KEY = "cakecart_items";

// Serialize bigint for localStorage
function serializeCart(items: CartItem[]): string {
  return JSON.stringify(
    items.map((item) => ({
      ...item,
      cake: {
        ...item.cake,
        id: item.cake.id.toString(),
        price: item.cake.price.toString(),
      },
    })),
  );
}

// Deserialize bigint from localStorage
function deserializeCart(raw: string): CartItem[] {
  try {
    const parsed = JSON.parse(raw) as Array<{
      cake: Record<string, unknown>;
      quantity: number;
    }>;
    return parsed.map((item) => ({
      ...item,
      cake: {
        ...item.cake,
        id: BigInt(item.cake.id as string),
        price: BigInt(item.cake.price as string),
      } as Cake,
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? deserializeCart(stored) : [];
  });
  const [isOpen, setIsOpen] = useState(false);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, serializeCart(items));
  }, [items]);

  const addItem = useCallback((cake: Cake) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.cake.id === cake.id);
      if (existing) {
        return prev.map((i) =>
          i.cake.id === cake.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { cake, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((cakeId: bigint) => {
    setItems((prev) => prev.filter((i) => i.cake.id !== cakeId));
  }, []);

  const updateQuantity = useCallback((cakeId: bigint, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.cake.id !== cakeId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.cake.id === cakeId ? { ...i, quantity } : i)),
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + i.cake.price * BigInt(i.quantity),
    BigInt(0),
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
