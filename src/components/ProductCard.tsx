"use client";

import { useState, useEffect } from 'react';
import styles from './ProductCard.module.css';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import StarRating from './StarRating';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category?: string;
    cuisine?: string;
    dietary?: string;
    allergies?: string;
}

interface ReviewStats {
    averageRating: number;
    reviewCount: number;
}

export default function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const { t } = useLanguage();
    const [quantity, setQuantity] = useState(1);
    const [addedStatus, setAddedStatus] = useState<'idle' | 'confirming' | 'added' | 'exiting'>('idle');
    const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
    
    // Charger les statistiques d'avis
    useEffect(() => {
        async function fetchReviewStats() {
            try {
                const res = await fetch(`/api/products/${product.id}/reviews`);
                const data = await res.json();
                setReviewStats(data);
            } catch (error) {
                console.error('Failed to fetch review stats', error);
            }
        }
        fetchReviewStats();
    }, [product.id]);
    
    // Fonction pour traduire les tags
    const translateTag = (tag: string, type: 'cuisine' | 'dietary' | 'allergies') => {
        const key = tag.toLowerCase().trim();
        
        // Mapping spécifique pour les types de viande qui sont stockés dans 'dietary' ou ailleurs
        if (key === 'viande rouge' || key === 'viande blanche') {
            const translated = t(`filters.dietary.${key}`);
            return translated === `filters.dietary.${key}` ? tag : translated;
        }

        const translationKey = `filters.${type}.${key}`;
        const translated = t(translationKey);
        // Si la traduction retourne la clé elle-même, c'est qu'elle n'existe pas, on retourne le tag original
        return translated === translationKey ? tag : translated;
    };

    const handleAdd = () => {
        console.log('ProductCard handleAdd:', product); // DEBUG LOG
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
                setAddedStatus('exiting');
                
                // Phase 4: Final reset after sweep duration (1s)
                setTimeout(() => {
                    setAddedStatus('idle');
                    setQuantity(1);
                }, 200); 
            }, 2000);
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
                    <h3 className={styles.name}>
                        {(() => {
                            const translatedName = t(`product.names.${product.name}`);
                            return translatedName && translatedName !== `product.names.${product.name}`
                                ? translatedName
                                : product.name;
                        })()}
                    </h3>
                    <span className={styles.price}>{product.price.toFixed(2)}€</span>
                </div>
                
                <div className={styles.tagContainer}>
                    {product.cuisine && product.cuisine.split(',').map(tag => (
                        <span key={tag} className={`${styles.tag} ${styles.cuisineTag}`}>{translateTag(tag.trim(), 'cuisine')}</span>
                    ))}
                    {product.dietary && product.dietary.split(',').map(tag => (
                        <span key={tag} className={`${styles.tag} ${styles.dietaryTag}`}>{translateTag(tag.trim(), 'dietary')}</span>
                    ))}
                    {product.allergies && product.allergies !== 'aucune' && product.allergies.split(',').map(tag => (
                        <span key={tag} className={`${styles.tag} ${styles.allergyTag}`}>{translateTag(tag.trim(), 'allergies')}</span>
                    ))}
                </div>

                <p className={styles.description}>
                    {(() => {
                        const translatedDesc = t(`product.descriptions.${product.name}`);
                        // Si la traduction retourne la clé elle-même (pas de traduction trouvée), utiliser la description de la base de données
                        return translatedDesc && translatedDesc !== `product.descriptions.${product.name}` 
                            ? translatedDesc 
                            : product.description;
                    })()}
                </p>
                
                {/* Affichage de la note et des avis */}
                <StarRating 
                    rating={reviewStats?.averageRating || 0} 
                    reviewCount={reviewStats?.reviewCount || 0}
                    size="small"
                />
                
                <div className={styles.actions}>
                    <button 
                        className={`
                            ${styles.button} 
                            ${addedStatus === 'confirming' ? styles.buttonConfirming : ''}
                            ${addedStatus === 'added' ? styles.buttonAdded : ''}
                            ${addedStatus === 'exiting' ? styles.buttonExiting : ''}
                        `} 
                        onClick={handleAdd}
                        disabled={addedStatus !== 'idle'}
                    >
                        <div className={styles.buttonContent}>
                            <span className={styles.buttonText}>{t('product.add_to_cart')}</span>
                            <div className={styles.checkIcon}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                        </div>
                        <div className={styles.addedLabelWrapper}>
                            <span className={styles.addedLabel}>{t('product.added_to_cart')}</span>
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
