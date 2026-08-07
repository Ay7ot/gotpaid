"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantLabel?: string | null;
  unitPrice: number;
  qty: number;
};

const STORAGE_KEY = "gotpaid_cart";
const EMPTY: CartItem[] = [];

let cartItems: CartItem[] = [];
let didHydrate = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  } catch {
    // storage unavailable
  }
}

function emit() {
  persist();
  listeners.forEach((listener) => listener());
}

function hydrate() {
  if (didHydrate) return;
  didHydrate = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cartItems = raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    cartItems = [];
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = () => hydrate();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  return cartItems;
}

function getServerSnapshot() {
  return EMPTY;
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  updateQty: (variantId: string, qty: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hydrate();
  }, []);

  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    const existing = cartItems.find((i) => i.variantId === item.variantId);
    cartItems = existing
      ? cartItems.map((i) => (i.variantId === item.variantId ? { ...i, qty: i.qty + qty } : i))
      : [...cartItems, { ...item, qty }];
    emit();
  }, []);

  const updateQty = useCallback((variantId: string, qty: number) => {
    cartItems =
      qty <= 0
        ? cartItems.filter((i) => i.variantId !== variantId)
        : cartItems.map((i) => (i.variantId === variantId ? { ...i, qty } : i));
    emit();
  }, []);

  const removeItem = useCallback((variantId: string) => {
    cartItems = cartItems.filter((i) => i.variantId !== variantId);
    emit();
  }, []);

  const clear = useCallback(() => {
    cartItems = [];
    emit();
  }, []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.unitPrice * i.qty, 0),
      addItem,
      updateQty,
      removeItem,
      clear,
    }),
    [items, addItem, updateQty, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
