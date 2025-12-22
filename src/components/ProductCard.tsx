"use client";

import { useState, useEffect } from 'react';
import styles from './ProductCard.module.css';
import { useCart } from '@/context/CartContext';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    cuisine?: string;
    dietary?: string;
    allergies?: string;
}

export default function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [addedStatus, setAddedStatus] = useState<'idle' | 'confirming' | 'added'>('idle');

    const handleAdd = () => {
        if (addedStatus !== 'idle') return;
        
        // Phase 1: Confirming (Green + Checkmark)
        setAddedStatus('confirming');
        
        // Add to actual cart logic
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }

        // Phase 2: After 1 second, switch to "Added" (Text reveal)
        setTimeout(() => {
            setAddedStatus('added');
            
            // Phase 3: Reset after some time
            setTimeout(() => {
                setAddedStatus('idle');
                setQuantity(1);
            }, 3000);
        }, 1000);
    };

    const updateQuantity = (val: number) => {
        setQuantity(prev => Math.max(1, prev + val));
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <div className={styles.placeholderImage}>{product.name.charAt(0)}</div>
            </div>
            <div className={styles.info}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.name}>{product.name}</h3>
                    <span className={styles.price}>{product.price.toFixed(2)}€</span>
                </div>
                
                <div className={styles.tagContainer}>
                    {product.cuisine && product.cuisine.split(',').map(tag => (
                        <span key={tag} className={`${styles.tag} ${styles.cuisineTag}`}>{tag}</span>
                    ))}
                    {product.dietary && product.dietary.split(',').map(tag => (
                        <span key={tag} className={`${styles.tag} ${styles.dietaryTag}`}>{tag}</span>
                    ))}
                    {product.allergies && product.allergies !== 'aucune' && product.allergies.split(',').map(tag => (
                        <span key={tag} className={`${styles.tag} ${styles.allergyTag}`}>{tag}</span>
                    ))}
                </div>

                <p className={styles.description}>{product.description}</p>
                
                <div className={styles.actions}>
                    <button 
                        className={`
                            ${styles.button} 
                            ${addedStatus === 'confirming' ? styles.buttonConfirming : ''}
                            ${addedStatus === 'added' ? styles.buttonAdded : ''}
                        `} 
                        onClick={handleAdd}
                        disabled={addedStatus !== 'idle'}
                    >
                        <div className={styles.buttonContent}>
                            <span className={styles.buttonText}>Ajouter au panier</span>
                            <div className={styles.checkIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                        </div>
                        <div className={styles.addedLabelWrapper}>
                            <span className={styles.addedLabel}>Ajouté au panier !</span>
                        </div>
                        
                        {/* Vertical Quantity Selector */}
                        <div className={`${styles.quantitySelector} ${addedStatus !== 'idle' ? styles.quantityHidden : ''}`} onClick={(e) => e.stopPropagation()}>
                            <button 
                                className={styles.qBtn} 
                                onClick={(e) => { e.stopPropagation(); updateQuantity(1); }} 
                                type="button"
                            >+</button>
                            <span className={styles.quantityValue}>{quantity}</span>
                            <button 
                                className={styles.qBtn} 
                                onClick={(e) => { e.stopPropagation(); updateQuantity(-1); }} 
                                type="button"
                            >-</button>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
