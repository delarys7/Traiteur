"use client";

import React from 'react';
import styles from './OrderDetailModal.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { Order, OrderItem } from './OrderCard';

interface OrderDetailModalProps {
    order: Order;
    onClose: () => void;
    onLeaveReview: (order: Order) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose, onLeaveReview }) => {
    const { t, language } = useLanguage();

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    // Calculate subtotal for each group
    const calculateGroupTotal = (items: OrderItem[]) => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const groupedItems = order.items.reduce((acc, item) => {
        const category = item.category || 'Autres';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {} as Record<string, OrderItem[]>);

    const getCategoryName = (key: string) => {
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'buffet') return t('cart.groups.buffets');
        if (lowerKey === 'plateau') return t('cart.groups.plateaux');
        if (lowerKey === 'cocktail') return t('cart.groups.cocktails');
        if (lowerKey === 'boutique') return t('cart.groups.boutique');
        return key;
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{t('account.order_details')} #{order.id}</h1>
                    <button onClick={onClose} className={styles.closeButton}>
                        ✕
                    </button>
                </div>

                <div className={styles.grid}>
                    {/* Left Column: Products */}
                    <div className={styles.itemList}>
                        {Object.entries(groupedItems).map(([category, items]) => (
                            <div key={category} className={styles.groupSection}>
                                <h3 className={styles.groupTitle}>{getCategoryName(category)}</h3>
                                {items.map((item, idx) => (
                                    <div key={idx} className={styles.item}>
                                        <div className={styles.itemInfo}>
                                            <div className={styles.itemImagePlaceholder}>
                                                {item.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className={styles.itemName}>{t('product.names.' + (item.name?.trim() || ''))}</div>
                                                <div className={styles.itemPrice}>{item.price.toFixed(2)}€</div>
                                            </div>
                                        </div>
                                        <div className={styles.itemMeta}>
                                            <div className={styles.itemQty}>x{item.quantity}</div>
                                            <div style={{ fontWeight: 500 }}>{(item.price * item.quantity).toFixed(2)}€</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Summary & History */}
                    <div className={styles.sidebar}>
                        <div className={styles.summary}>
                            <h2 className={styles.summaryTitle}>{t('account.your_selection')}</h2>
                            
                            {/* Summary Rows by Category */}
                            {Object.entries(groupedItems).map(([category, items]) => (
                                <div key={category} className={styles.summaryRow}>
                                    <span>{getCategoryName(category)}</span>
                                    <span>{calculateGroupTotal(items).toFixed(2)}€</span>
                                </div>
                            ))}
                            
                            <div className={styles.total}>
                                <div className={styles.summaryRow} style={{ marginBottom: 0 }}>
                                    <span>Total</span>
                                    <span>{order.total.toFixed(2)}€</span>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                {order.status === 'validated' && (
                                    <button className={styles.payButton}>
                                        {t('account.order_actions.pay')}
                                    </button>
                                )}
                                {order.status === 'received' && (
                                    <button 
                                        className={styles.reviewButton}
                                        onClick={() => {
                                            onClose();
                                            onLeaveReview(order);
                                        }}
                                    >
                                        {t('account.order_actions.leave_review')}
                                    </button>
                                )}
                                {(order.status === 'pending_confirmation' || order.status === 'paid' || order.status === 'refused') && (
                                    <button className={styles.disabledButton} disabled>
                                        {t('account.order_actions.pay')}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={styles.historySection}>
                            <h3 className={styles.summaryTitle} style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                                {t('account.order_history')}
                            </h3>
                            <div className={styles.timeline}>
                                {order.history && order.history.length > 0 ? (
                                    order.history.map((event, idx) => (
                                        <div key={idx} className={styles.timelineEvent}>
                                            <div className={styles.timelineDot}></div>
                                            <div className={styles.timelineContent}>
                                                <span className={styles.eventLabel}>
                                                    {t(`account.order_status.${event.status}`) || event.label}
                                                </span>
                                                <span className={styles.eventDate}>{formatDate(event.date)}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.timelineEvent}>
                                        <div className={styles.timelineDot}></div>
                                        <div className={styles.timelineContent}>
                                            <span className={styles.eventLabel}>{t('account.order_created')}</span>
                                            <span className={styles.eventDate}>{formatDate(order.createdAt)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
