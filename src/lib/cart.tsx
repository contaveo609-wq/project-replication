import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartAddon = { id: string; name: string; price: number; quantity: number };
export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  notes: string;
  addons: CartAddon[];
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "key">) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "skina-cart-v1";

export function itemTotal(item: CartItem): number {
  const addons = item.addons.reduce((sum, a) => sum + a.price * a.quantity, 0);
  return (item.unitPrice + addons) * item.quantity;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, i) => sum + itemTotal(i), 0);
    return {
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal,
      addItem: (item) => {
        const signature = `${item.productId}|${item.notes}|${item.addons
          .map((a) => `${a.id}x${a.quantity}`)
          .sort()
          .join(",")}`;
        setItems((prev) => {
          const existing = prev.find((i) => i.key === signature);
          if (existing) {
            return prev.map((i) =>
              i.key === signature ? { ...i, quantity: i.quantity + item.quantity } : i,
            );
          }
          return [...prev, { ...item, key: signature }];
        });
      },
      updateQuantity: (key, quantity) =>
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => i.key !== key)
            : prev.map((i) => (i.key === key ? { ...i, quantity } : i)),
        ),
      removeItem: (key) => setItems((prev) => prev.filter((i) => i.key !== key)),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
