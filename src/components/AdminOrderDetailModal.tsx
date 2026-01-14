"use client";

import React from 'react';
import styles from './AdminOrderDetailModal.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { AdminOrder, AdminOrderItem } from './AdminOrderCard';

interface AdminOrderDetailModalProps {
    order: AdminOrder;
    isOpen: boolean;
    onClose: () => void;
}

const AdminOrderDetailModal: React.FC<AdminOrderDetailModalProps> = ({ order, isOpen, onClose }) => {
    const { t, language } = useLanguage();

    if (!isOpen) return null;

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

    const calculateGroupTotal = (items: AdminOrderItem[]) => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const getGroupedItems = () => {
        const groups = {
            Buffets: order.items.filter(i => i.category?.toLowerCase() === 'buffet'),
            Plateaux: order.items.filter(i => i.category?.toLowerCase() === 'plateau'),
            Cocktails: order.items.filter(i => i.category?.toLowerCase() === 'cocktail'),
            Boutique: order.items.filter(i => i.category?.toLowerCase() === 'boutique'),
            Autres: order.items.filter(i => !['buffet', 'plateau', 'cocktail', 'boutique'].includes(i.category?.toLowerCase() || ''))
        };
        return groups;
    };

    const groupedItems = getGroupedItems();

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.container} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Détails de la commande #{order.id.substring(0, 8)}</h1>
                    <button onClick={onClose} className={styles.closeButton}>
                        ✕
                    </button>
                </div>

                <div className={styles.grid}>
                    {/* Left Column: Products */}
                    <div className={styles.itemList}>
                        {Object.entries(groupedItems).map(([categoryName, items]) => {
                            if (items.length === 0) return null;
                            
                            const sortedItems = [...items].sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity));
                            
                            return (
                                <div key={categoryName} className={styles.groupSection}>
                                    <h3 className={styles.groupTitle}>{categoryName}</h3>
                                    {sortedItems.map((item, idx) => (
                                        <div key={idx} className={styles.item}>
                                            <div className={styles.itemInfo}>
                                                <div className={styles.itemImagePlaceholder}>
                                                    {item.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className={styles.itemName}>{item.name}</div>
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
                            );
                        })}
                    </div>

                    {/* Right Column: Summary & User Info */}
                    <div className={styles.sidebar}>
                        <div className={styles.summary}>
                            <h2 className={styles.summaryTitle}>Informations client</h2>
                            
                            <div className={styles.userInfoSection}>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Nom:</span>
                                    <span className={styles.infoValue}>{order.firstName} {order.lastName}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Email:</span>
                                    <span className={styles.infoValue}>{order.email}</span>
                                </div>
                                {order.phone && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Téléphone:</span>
                                        <span className={styles.infoValue}>{order.phone}</span>
                                    </div>
                                )}
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Type de compte:</span>
                                    <span className={styles.infoValue}>
                                        {order.userType === 'entreprise' ? 'Professionnel' : 'Particulier'}
                                    </span>
                                </div>
                                {order.entreprise && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Entreprise:</span>
                                        <span className={styles.infoValue}>{order.entreprise}</span>
                                    </div>
                                )}
                            </div>

                            <h2 className={styles.summaryTitle} style={{ marginTop: '2rem' }}>Récapitulatif</h2>
                            
                            {Object.entries(groupedItems).map(([categoryName, items]) => {
                                if (items.length === 0) return null;
                                return (
                                    <div key={categoryName} className={styles.summaryRow}>
                                        <span>{categoryName}</span>
                                        <span>{calculateGroupTotal(items).toFixed(2)}€</span>
                                    </div>
                                );
                            })}
                            
                            <div className={styles.total}>
                                <div className={styles.summaryRow} style={{ marginBottom: 0 }}>
                                    <span>Total</span>
                                    <span>{order.total.toFixed(2)}€</span>
                                </div>
                            </div>
                        </div>

                        {order.status === 'validated' && (
                            <div className={styles.invoiceSection}>
                                <h3 className={styles.summaryTitle} style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                                    Facture
                                </h3>
                                <div className={styles.invoiceActions}>
                                    <button 
                                        className={styles.downloadButton}
                                        onClick={() => {
                                            // TODO: Générer et télécharger la facture
                                            alert('Génération de la facture...');
                                        }}
                                    >
                                        Télécharger la facture
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={styles.historySection}>
                            <h3 className={styles.summaryTitle} style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                                Dates
                            </h3>
                            <div className={styles.timeline}>
                                <div className={styles.timelineEvent}>
                                    <div className={styles.timelineDot}></div>
                                    <div className={styles.timelineContent}>
                                        <span className={styles.eventLabel}>Création de la commande</span>
                                        <span className={styles.eventDate}>{formatDate(order.createdAt)}</span>
                                    </div>
                                </div>
                                <div className={styles.timelineEvent}>
                                    <div className={styles.timelineDot}></div>
                                    <div className={styles.timelineContent}>
                                        <span className={styles.eventLabel}>Dernière mise à jour</span>
                                        <span className={styles.eventDate}>{formatDate(order.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetailModal;
