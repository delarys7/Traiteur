"use client";

import React from 'react';
import styles from '@/app/compte/page.module.css';
import { useLanguage } from '@/context/LanguageContext';
import OrderStatusTag from './OrderStatusTag';

export interface OrderItem {
    id: string; // ou productId
    name: string;
    quantity: number;
    price: number;
    category?: string;
}

export interface Order {
    id: string;
    userId: string;
    type: string;
    status: 'pending_confirmation' | 'validated' | 'paid' | 'received' | 'refused';
    total: number;
    items: OrderItem[];
    refusalReason?: string;
    createdAt: string;
    history?: { status: string; date: string; label?: string }[];
}

interface OrderCardProps {
    order: Order;
    onLeaveReview: (order: Order) => void;
    onClick?: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onLeaveReview, onClick }) => {
    const { t, language } = useLanguage();


    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className={styles.orderCard}>
            <div className={styles.orderHeader}>
                <div className={styles.orderIdGroup}>
                    <span 
                        className={styles.orderLabel} 
                        onClick={() => onClick && onClick(order)}
                        style={{ cursor: onClick ? 'pointer' : 'default' }}
                    ># {order.id}</span>
                    <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                </div>
                <OrderStatusTag status={order.status} />
            </div>

            <div className={styles.orderBody}>
                <div className={styles.orderItemsList}>
                    {order.items.slice(0, 5).map((item, idx) => (
                        <div key={idx} className={styles.orderItem}>
                            <span className={styles.itemName}>{t('product.names.' + (item.name?.trim() || ''))}</span>
                            <span className={styles.itemQty}>x{item.quantity}</span>
                            <span className={styles.itemPrice}>{item.price.toFixed(2)}€</span>
                        </div>
                    ))}
                    {order.items.length > 5 && (
                        <div className={styles.orderItemEllipsis}>
                            <span>...</span>
                        </div>
                    )}
                </div>
                {order.status === 'refused' && order.refusalReason && (
                    <div className={styles.refusalReasonBox}>
                        <strong>{t('account.order_actions.view_refusal_reason')}:</strong> {order.refusalReason}
                    </div>
                )}
            </div>

            <div className={styles.orderFooter}>
                <div className={styles.orderTotal}>
                    <span className={styles.totalLabel}>Total:</span>
                    <span className={styles.totalValue}>{order.total.toFixed(2)}€</span>
                </div>
                <div className={styles.orderActions}>
                    {order.status === 'validated' && (
                        <button className={styles.payButton}>
                            {t('account.order_actions.pay')}
                        </button>
                    )}
                    {order.status === 'received' && (
                        <button 
                            className={styles.reviewButton}
                            onClick={() => onLeaveReview(order)}
                        >
                            {t('account.order_actions.leave_review')}
                        </button>
                    )}
                    {(order.status === 'pending_confirmation' || order.status === 'paid' || order.status === 'refused') && (
                        <button className={styles.disabledButton} disabled>
                            {order.status === 'paid' ? t('account.order_actions.pay') : t('account.order_actions.pay')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderCard;
