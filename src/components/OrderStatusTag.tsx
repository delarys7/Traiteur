"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './OrderStatusTag.module.css';

interface OrderStatusTagProps {
    status: 'pending' | 'pending_confirmation' | 'validated' | 'paid' | 'received' | 'refused';
}

const OrderStatusTag: React.FC<OrderStatusTagProps> = ({ status }) => {
    const { t, language } = useLanguage();

    const getStatusTagClass = () => {
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

    const getStatusLabel = () => {
        // Essayer d'abord avec le statut exact
        let statusKey = `account.order_status.${status}`;
        let translated = t(statusKey);
        
        // Si la traduction retourne la clé elle-même, essayer avec pending_confirmation normalisé en pending
        if (translated === statusKey || translated === statusKey.toUpperCase()) {
            if (status === 'pending_confirmation') {
                statusKey = 'account.order_status.pending_confirmation';
                translated = t(statusKey);
            }
            
            // Si toujours pas de traduction, utiliser un fallback basé sur la langue
            if (translated === statusKey || translated === statusKey.toUpperCase()) {
                const statusLabelsFr: { [key: string]: string } = {
                    'pending': 'En attente',
                    'pending_confirmation': 'En attente',
                    'validated': 'Approuvée',
                    'paid': 'Payée',
                    'received': 'Réceptionnée',
                    'refused': 'Refusée'
                };
                const statusLabelsEn: { [key: string]: string } = {
                    'pending': 'Pending',
                    'pending_confirmation': 'Pending',
                    'validated': 'Approved',
                    'paid': 'Paid',
                    'received': 'Received',
                    'refused': 'Refused'
                };
                const labels = language === 'en' ? statusLabelsEn : statusLabelsFr;
                return labels[status] || status;
            }
        }
        return translated;
    };

    return (
        <div className={`${styles.statusTag} ${getStatusTagClass()}`}>
            {getStatusLabel()}
        </div>
    );
};

export default OrderStatusTag;
