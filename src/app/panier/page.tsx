"use client";

import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, total } = useCart();
    const { t } = useLanguage();
    const router = useRouter();

    if (items.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <h1 className={styles.title}>{t('cart.title')}</h1>
                <p className={styles.emptyText}>{t('cart.empty')}</p>
                <Link href="/traiteur" className={styles.continueButton}>
                    {t('cart.discover')}
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t('cart.selection')}</h1>

            <div className={styles.grid}>
                <div className={styles.itemList}>
                    {/* Grouping and Sorting Logic */}
                    {(() => {
                        const groups = {
                            [t('cart.groups.buffets')]: items.filter(i => i.category?.toLowerCase() === 'buffet'),
                            [t('cart.groups.plateaux')]: items.filter(i => i.category?.toLowerCase() === 'plateau'),
                            [t('cart.groups.cocktails')]: items.filter(i => i.category?.toLowerCase() === 'cocktail'),
                            [t('cart.groups.autres')]: items.filter(i => !['buffet', 'plateau', 'cocktail'].includes(i.category?.toLowerCase() || ''))
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
                                                    {t('cart.remove')}
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
                    <h2 className={styles.summaryTitle}>{t('cart.summary')}</h2>
                    <div className={styles.summaryRow}>
                        <span>{t('cart.groups.buffets')}</span>
                        <span>
                            {items
                                .filter(i => i.category?.toLowerCase() === 'buffet')
                                .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                                .toFixed(2)}€
                        </span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>{t('cart.groups.plateaux')}</span>
                        <span>
                            {items
                                .filter(i => i.category?.toLowerCase() === 'plateau')
                                .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                                .toFixed(2)}€
                        </span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>{t('cart.groups.cocktails')}</span>
                        <span>
                            {items
                                .filter(i => i.category?.toLowerCase() === 'cocktail')
                                .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                                .toFixed(2)}€
                        </span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Nombre de produits</span>
                        <span>
                            {items.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                    </div>
                    <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>{t('cart.total')}</span>
                        <span>{total.toFixed(2)}€</span>
                    </div>
                    <button 
                        className={styles.checkoutButton} 
                        onClick={() => router.push('/contact?from=cart')}
                    >
                        Étape suivante
                    </button>
                </div>
            </div>
        </div>
    );
}
