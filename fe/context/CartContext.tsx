'use client';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Discount, Product, ProductService } from '../service/ProductService';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface CartTotals {
    totalItems: number; // sum of all quantities
    subtotal: number;   // sum of salePrice * quantity for each item
    total: number;      // same as subtotal for now (no extra fees)
}

interface CartContextValue {
    cartItems: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getTotals: () => CartTotals;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CART_STORAGE_KEY = 'xstore-cart';

const saveCartToStorage = (items: CartItem[]): void => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
        // Silently fail if localStorage is unavailable (e.g., private mode)
    }
};

const loadCartFromStorage = (): CartItem[] => {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as CartItem[];
    } catch {
        return [];
    }
};

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    // Start with empty array to avoid SSR/hydration mismatches;
    // localStorage is only available in the browser.
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from localStorage once we are on the client
    useEffect(() => {
        setCartItems(loadCartFromStorage());
        setHydrated(true);
    }, []);

    // Persist to localStorage whenever cartItems change (after initial hydration)
    useEffect(() => {
        if (hydrated) {
            saveCartToStorage(cartItems);
        }
    }, [cartItems, hydrated]);

    useEffect(() => {
        ProductService.getDiscounts().then(setDiscounts);
    }, []);

    const addToCart = useCallback((product: Product) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((productId: number) => {
        setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: number, quantity: number) => {
        if (quantity <= 0) {
            setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
        } else {
            setCartItems((prev) =>
                prev.map((item) =>
                    item.product.id === productId ? { ...item, quantity } : item
                )
            );
        }
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const getTotals = useCallback((): CartTotals => {
        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

        const subtotal = cartItems.reduce((sum, item) => {
            const discount = discounts.find((d) => d.name === item.product.discountName);
            const price = discount ? item.product.salePrice * (1 - discount.percentage / 100) : item.product.salePrice;
            return sum + price * item.quantity;
        }, 0);

        return { totalItems, subtotal, total: subtotal };
    }, [cartItems, discounts]);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotals }}>
            {children}
        </CartContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCart = (): CartContextValue => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside a CartProvider');
    return ctx;
};
