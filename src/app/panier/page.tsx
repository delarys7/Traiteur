"use client";

import { useCart } from '@/context/CartContext';
import styles from './page.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, total } = useCart();

    const router = useRouter();

    if (items.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <h1 className={styles.title}>Votre Panier</h1>
                <p className={styles.emptyText}>Votre panier est actuellement vide.</p>
                <Link href="/traiteur" className={styles.continueButton}>
                    Découvrir nos créations
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Votre Sélection</h1>

            <div className={styles.grid}>
                <div className={styles.itemList}>
                    {/* Grouping and Sorting Logic */}
                    {(() => {
                        const groups = {
                            'Buffets': items.filter(i => i.category?.toLowerCase() === 'buffet'),
                            'Plateaux Repas': items.filter(i => i.category?.toLowerCase() === 'plateau'),
                            'Pièces Cocktails': items.filter(i => i.category?.toLowerCase() === 'cocktail'),
                            'Autres': items.filter(i => !['buffet', 'plateau', 'cocktail'].includes(i.category?.toLowerCase() || ''))
                        };

                        return Object.entries(groups).map(([groupName, groupItems]) => {
                            if (groupItems.length === 0) return null;

                            const sortedItems = [...groupItems].sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity));

                            return (
                                <div key={groupName} className={styles.groupSection}>
                                    <h3 className={styles.groupTitle} style={{ 
                                        fontSize: '1.2rem', 
                                        fontWeight: '600', 
                                        margin: '1.5rem 0 1rem', 
                                        paddingBottom: '0.5rem',
                                        borderBottom: '1px solid #eee',
                                        color: '#111'
                                    }}>
                                        {groupName}
                                    </h3>
                                    {sortedItems.map((item) => (
                                        <div key={item.id} className={styles.item}>
                                            <div className={styles.itemInfo}>
                                                <div className={styles.itemImagePlaceholder}>{item.name.charAt(0)}</div>
                                                <div>
                                                    <h3 className={styles.itemName}>{item.name}</h3>
                                                    <p className={styles.itemPrice}>{item.price.toFixed(2)}€</p>
                                                    {/* Debug info for Autres */}
                                                    {groupName === 'Autres' && (
                                                        <p style={{ fontSize: '0.7rem', color: '#999' }}>
                                                            Catégorie: {item.category ? `"${item.category}"` : 'Non définie (Supprimez et réajoutez)'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={styles.controls}>
                                                <div className={styles.quantity}>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                                    <span>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                                </div>
                                                <button
                                                    className={styles.removeButton}
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    Retirer
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        });
                    })()}
                </div>

                <div className={styles.summary}>
                    <h2 className={styles.summaryTitle}>Récapitulatif</h2>
                    <div className={styles.summaryRow}>
                        <span>Sous-total</span>
                        <span>{total.toFixed(2)}€</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Livraison</span>
                        <span>Calculé à l&apos;étape suivante</span>
                    </div>
                    <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>Total</span>
                        <span>{total.toFixed(2)}€</span>
                    </div>
                    <button 
                        className={styles.checkoutButton} 
                        onClick={() => router.push('/contact?from=cart')}
                    >
                        Commander
                    </button>
                </div>
            </div>
        </div>
    );
}
