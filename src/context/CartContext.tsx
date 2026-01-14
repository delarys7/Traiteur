"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from '@/lib/auth-client';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    category?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: { id: number; name: string; price: number; image: string; category?: string }) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    total: number;
    count: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const { data: session } = useSession();
    const [isInitialized, setIsInitialized] = useState(false);
    const previousUserIdRef = React.useRef<string | null>(null);
    const skipSaveRef = React.useRef(false);

    // Get cart key for current user
    const getCartKey = (userId: string | null) => {
        return userId ? `cart_${userId}` : 'cart_guest';
    };

    // Load cart from localStorage on mount (only if user is logged in)
    useEffect(() => {
        if (session?.user?.id) {
            const cartKey = getCartKey(session.user.id);
            const savedCart = localStorage.getItem(cartKey);
            if (savedCart) {
                try {
                    const parsedCart = JSON.parse(savedCart);
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setItems(parsedCart);
                } catch (e) {
                    console.error('Failed to parse cart', e);
                }
            }
        }
        setIsInitialized(true);
    }, []);

    // Handle cart based on authentication status changes
    useEffect(() => {
        if (!isInitialized) return;

        const currentUserId = session?.user?.id || null;
        const previousUserId = previousUserIdRef.current;

        // User just logged in (was logged out, now logged in) OR switched accounts
        if (currentUserId && currentUserId !== previousUserId) {
            // Save previous user's cart before switching
            if (previousUserId) {
                const previousCartKey = getCartKey(previousUserId);
                localStorage.setItem(previousCartKey, JSON.stringify(items));
            }
            
            // Load new user's cart from localStorage
            skipSaveRef.current = true; // Skip saving when restoring
            const cartKey = getCartKey(currentUserId);
            const savedCart = localStorage.getItem(cartKey);
            if (savedCart) {
                try {
                    const parsedCart = JSON.parse(savedCart);
                    setItems(parsedCart);
                } catch (e) {
                    console.error('Failed to parse cart', e);
                }
            } else {
                // No saved cart for this user, start with empty cart
                setItems([]);
            }
            // Reset flag after restore
            setTimeout(() => {
                skipSaveRef.current = false;
            }, 50);
        }
        // User just logged out (was logged in, now logged out)
        else if (!currentUserId && previousUserId) {
            // Save current user's cart before logging out
            const previousCartKey = getCartKey(previousUserId);
            localStorage.setItem(previousCartKey, JSON.stringify(items));
            
            // Clear cart visually
            skipSaveRef.current = true; // Skip saving when clearing
            setItems([]);
            // Reset flag after clearing
            setTimeout(() => {
                skipSaveRef.current = false;
            }, 50);
        }

        // Update the ref for next comparison
        previousUserIdRef.current = currentUserId;
    }, [session, isInitialized, items]);

    // Save cart to localStorage whenever it changes (only if user is logged in and not skipping)
    useEffect(() => {
        if (isInitialized && session?.user?.id && !skipSaveRef.current) {
            const cartKey = getCartKey(session.user.id);
            localStorage.setItem(cartKey, JSON.stringify(items));
        }
    }, [items, isInitialized, session]);

    const addToCart = (product: { id: number; name: string; price: number; image: string; category?: string }) => {
        console.log('CartContext addToCart received:', product);
        setItems(currentItems => {
            const existingItem = currentItems.find(item => item.id === product.id);
            if (existingItem) {
                return currentItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...currentItems, {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                quantity: 1
            }];
        });
    };

    const removeFromCart = (id: number) => {
        setItems(currentItems => currentItems.filter(item => item.id !== id));
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(id);
            return;
        }
        setItems(currentItems =>
            currentItems.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => setItems([]);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, count }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
