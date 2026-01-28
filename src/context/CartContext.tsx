"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useSession } from '@/lib/auth-client';

export interface CartItem {
    id: number;
    productId: number;
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
    isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { data: session } = useSession();
    const previousUserIdRef = useRef<string | null>(null);

    // Load cart from API or LocalStorage
    const loadCart = useCallback(async () => {
        if (!session?.user?.id) {
            // Guest mode: load from LocalStorage
            const savedCart = localStorage.getItem('guestCart');
            if (savedCart) {
                try {
                    setItems(JSON.parse(savedCart));
                } catch (e) {
                    console.error('Error parsing guest cart:', e);
                    setItems([]);
                }
            } else {
                setItems([]);
            }
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/cart');
            if (response.ok) {
                const cartItems = await response.json();
                const transformedItems = cartItems.map((item: any) => ({
                    id: item.productId,
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    category: item.category
                }));
                setItems(transformedItems);
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.id]);

    // Load cart on mount and when user changes
    useEffect(() => {
        const currentUserId = session?.user?.id || null;
        const previousUserId = previousUserIdRef.current;

        // LOAD OR MERGE
        if (currentUserId && currentUserId !== previousUserId) {
            // User just logged in
            const syncGuestCart = async () => {
                const savedGuestCart = localStorage.getItem('guestCart');
                if (savedGuestCart) {
                    try {
                        const guestItems = JSON.parse(savedGuestCart) as CartItem[];
                        if (guestItems.length > 0) {
                            console.log('[Cart] Merging guest items into persistent account...');
                            // Merge sequentially to avoid pool issues or racing
                            for (const item of guestItems) {
                                await fetch('/api/cart', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        productId: item.productId,
                                        quantity: item.quantity
                                    })
                                });
                            }
                            localStorage.removeItem('guestCart');
                        }
                    } catch (e) {
                        console.error('Error merging guest cart:', e);
                    }
                }
                // Refresh full cart from API after merging
                loadCart();
            };
            
            syncGuestCart();
            previousUserIdRef.current = currentUserId;
        } else if (!currentUserId && previousUserId) {
            // User just logged out
            setItems([]);
            previousUserIdRef.current = null;
        } else if (!currentUserId && !previousUserId) {
            // Initial mount or guest mode
            loadCart();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    const addToCart = useCallback(async (product: { id: number; name: string; price: number; image: string; category?: string }) => {
        if (!session?.user?.id) {
            // Guest mode: update state and LocalStorage
            setItems(prev => {
                const existingItem = prev.find(item => item.productId === product.id);
                let newItems;
                if (existingItem) {
                    newItems = prev.map(item => 
                        item.productId === product.id 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                    );
                } else {
                    newItems = [...prev, {
                        id: product.id,
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        image: product.image,
                        category: product.category
                    }];
                }
                localStorage.setItem('guestCart', JSON.stringify(newItems));
                return newItems;
            });
            return;
        }

        try {
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: product.id,
                    quantity: 1
                })
            });

            if (response.ok) {
                const cartItems = await response.json();
                const transformedItems = cartItems.map((item: any) => ({
                    id: item.productId,
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    category: item.category
                }));
                setItems(transformedItems);
            } else {
                console.error('Error adding to cart:', response.statusText);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    }, [session?.user?.id]);

    const removeFromCart = useCallback(async (productId: number) => {
        if (!session?.user?.id) {
            // Guest mode
            setItems(prev => {
                const newItems = prev.filter(item => item.productId !== productId);
                localStorage.setItem('guestCart', JSON.stringify(newItems));
                return newItems;
            });
            return;
        }

        try {
            const response = await fetch(`/api/cart?productId=${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await loadCart();
            } else {
                console.error('Error removing from cart:', response.statusText);
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
        }
    }, [session?.user?.id, loadCart]);

    const updateQuantity = useCallback(async (productId: number, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }

        if (!session?.user?.id) {
            // Guest mode
            setItems(prev => {
                const newItems = prev.map(item => 
                    item.productId === productId 
                    ? { ...item, quantity } 
                    : item
                );
                localStorage.setItem('guestCart', JSON.stringify(newItems));
                return newItems;
            });
            return;
        }

        try {
            const response = await fetch('/api/cart', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    quantity
                })
            });

            if (response.ok) {
                await loadCart();
            } else {
                console.error('Error updating cart:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    }, [session?.user?.id, loadCart, removeFromCart]);

    const clearCart = useCallback(async () => {
        if (!session?.user?.id) {
            // Guest mode
            setItems([]);
            localStorage.removeItem('guestCart');
            return;
        }

        try {
            const response = await fetch('/api/cart', {
                method: 'DELETE'
            });

            if (response.ok) {
                setItems([]);
                localStorage.removeItem('guestCart'); // Just in case
            } else {
                console.error('Error clearing cart:', response.statusText);
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    }, [session?.user?.id]);

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, count, isLoading }}>
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
