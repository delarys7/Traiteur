"use client";

import React from 'react';
import styles from './AdminOrderCard.module.css';
import { useLanguage } from '@/context/LanguageContext';

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

    const getStatusTagClass = (status: string) => {
        // Normaliser pending_confirmation en pending
        const normalizedStatus = status === 'pending_confirmation' ? 'pending' : status;
        switch (normalizedStatus) {
            case 'pending': return styles.status_pending;
            case 'validated': return styles.status_validated;
            case 'paid': return styles.status_paid;
            case 'received': return styles.status_received;
            case 'refused': return styles.status_refused;
            default: return '';
        }
    };

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

    const getStatusLabel = (status: string) => {
        // Normaliser pending_confirmation en pending
        const normalizedStatus = status === 'pending_confirmation' ? 'pending' : status;
        switch (normalizedStatus) {
            case 'pending': return 'En attente';
            case 'validated': return 'Approuvée';
            case 'paid': return 'Payée';
            case 'received': return 'Réceptionnée';
            case 'refused': return 'Refusée';
            default: return status;
        }
    };

    return (
        <div className={styles.orderCard}>
            <div className={styles.orderHeader}>
                <div className={styles.orderIdGroup}>
                    <span className={styles.orderLabel}># {order.id.substring(0, 8)}</span>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>
                            {order.firstName} {order.lastName}
                        </span>
                    </div>
                    <div className={styles.datesRow}>
                        <div className={styles.dates}>
                            <span className={styles.dateLabel}>Création:</span>
                            <span className={styles.dateValue}>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className={styles.dates}>
                            <span className={styles.dateLabel}>Maj statut:</span>
                            <span className={styles.dateValue}>{formatDate(order.updatedAt)}</span>
                        </div>
                    </div>
                </div>
                <div className={`${styles.statusTag} ${getStatusTagClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                </div>
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
                            >
                                Valider
                            </button>
                            <button 
                                className={styles.refuseButton}
                                onClick={() => onRefuse && onRefuse(order)}
                            >
                                Refuser
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
