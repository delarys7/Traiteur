"use client";

import React from 'react';
import styles from './AdminOrderCard.module.css';
import { useLanguage } from '@/context/LanguageContext';
import OrderStatusTag from './OrderStatusTag';

export interface AdminOrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    category?: string;
}

export interface AdminOrder {
    id: string;
    userId: string;
    type: string;
    status: 'pending' | 'pending_confirmation' | 'validated' | 'paid' | 'received' | 'refused';
    total: number;
    items: AdminOrderItem[];
    serviceType?: string;
    refusalReason?: string;
    createdAt: string;
    updatedAt: string;
    firstName?: string;
    lastName?: string;
    userType?: string;
    email?: string;
    phone?: string;
    entreprise?: string;
    history?: { status: string; date: string; label?: string }[];
}

interface AdminOrderCardProps {
    order: AdminOrder;
    onDetails: (order: AdminOrder) => void;
    onValidate?: (order: AdminOrder) => void;
    onRefuse?: (order: AdminOrder) => void;
    onRelaunch?: (order: AdminOrder) => void;
    canRelaunch?: boolean;
}

const AdminOrderCard: React.FC<AdminOrderCardProps> = ({ 
    order, 
    onDetails, 
    onValidate, 
    onRefuse,
    onRelaunch,
    canRelaunch = false
}) => {
    const { t, language } = useLanguage();


    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'fr-FR', {
                day: '2-digit',
                month: '2-digit',
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
                        onClick={() => onDetails(order)}
                        style={{ cursor: 'pointer' }}
                    >
                        # {order.id.substring(0, 8)}
                    </span>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>
                            {order.firstName} {order.lastName} - {formatDate(order.createdAt)}
                        </span>
                    </div>
                </div>
                <OrderStatusTag status={order.status} />
            </div>

            <div className={styles.orderBody}>
                <div className={styles.orderItemsList}>
                    {order.items && order.items.slice(0, 5).map((item, idx) => (
                        <div key={idx} className={styles.orderItem}>
                            <span className={styles.itemName}>{item.name}</span>
                            <span className={styles.itemQty}>x{item.quantity}</span>
                            <span className={styles.itemPrice}>{item.price.toFixed(2)}€</span>
                        </div>
                    ))}
                    {order.items && order.items.length > 5 && (
                        <div className={styles.orderItemEllipsis}>
                            <span>...</span>
                        </div>
                    )}
                </div>
                {order.status === 'refused' && order.refusalReason && (
                    <div className={styles.refusalReasonBox}>
                        <strong>Motif du refus:</strong> {order.refusalReason}
                    </div>
                )}
            </div>

            <div className={styles.orderFooter}>
                <div className={styles.orderTotal}>
                    <span className={styles.totalLabel}>Total:</span>
                    <span className={styles.totalValue}>{order.total.toFixed(2)}€</span>
                </div>
                <div className={styles.orderActions}>
                    {(order.status === 'pending' || order.status === 'pending_confirmation') && (
                        <>
                            <button 
                                className={styles.validateButton}
                                onClick={() => onValidate && onValidate(order)}
                                title="Valider"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </button>
                            <button 
                                className={styles.refuseButton}
                                onClick={() => onRefuse && onRefuse(order)}
                                title="Refuser"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </>
                    )}
                    {(order.status === 'paid' || order.status === 'received') && null}
                    <button 
                        className={styles.detailsButton}
                        onClick={() => onDetails(order)}
                    >
                        Détails
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderCard;
