"use client";

import React from 'react';
import styles from './OrderDetailModal.module.css';
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

    // Calculate subtotal for each group
    const calculateGroupTotal = (items: AdminOrderItem[]) => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    // Grouping logic consistent with Cart and Contact pages
    const getGroupedItems = () => {
        const groups = {
            [t('cart.groups.buffets')]: order.items.filter(i => i.category?.toLowerCase() === 'buffet'),
            [t('cart.groups.plateaux')]: order.items.filter(i => i.category?.toLowerCase() === 'plateau'),
            [t('cart.groups.cocktails')]: order.items.filter(i => i.category?.toLowerCase() === 'cocktail'),
            [t('cart.groups.boutique')]: order.items.filter(i => i.category?.toLowerCase() === 'boutique'),
            [t('cart.groups.autres')]: order.items.filter(i => !['buffet', 'plateau', 'cocktail', 'boutique'].includes(i.category?.toLowerCase() || ''))
        };
        return groups;
    };

    const groupedItems = getGroupedItems();

    const getMotifLabel = (motif?: string) => {
        if (!motif) return '';
        const labels: { [key: string]: string } = {
            'commande': 'Commande / Devis',
            'collaboration-entreprise': 'Collaboration - Entreprise',
            'collaboration-particulier': 'Collaboration - Particulier',
            'prestation-domicile': 'Prestation à domicile',
            'consulting': 'Consulting',
            'autre': 'Autre'
        };
        return labels[motif] || motif;
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Détail de la commande #{order.id}</h1>
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

                        {/* Client Information Section - Full Width Below Products */}
                        <div className={styles.clientInfoSection}>
                            <h3 className={styles.groupTitle} style={{ marginTop: '2rem' }}>Informations client</h3>
                            
                            <div className={styles.clientInfoGrid}>
                                <div className={styles.clientInfoRow}>
                                    <span className={styles.clientInfoLabel}>Nom:</span>
                                    <span className={styles.clientInfoValue}>{order.firstName} {order.lastName}</span>
                                </div>
                                <div className={styles.clientInfoRow}>
                                    <span className={styles.clientInfoLabel}>Email:</span>
                                    <span className={styles.clientInfoValue}>{order.email}</span>
                                </div>
                                {order.phone && (
                                    <div className={styles.clientInfoRow}>
                                        <span className={styles.clientInfoLabel}>Téléphone:</span>
                                        <span className={styles.clientInfoValue}>{order.phone}</span>
                                    </div>
                                )}
                                <div className={styles.clientInfoRow}>
                                    <span className={styles.clientInfoLabel}>Type de compte:</span>
                                    <span className={styles.clientInfoValue}>
                                        {order.userType === 'entreprise' ? 'Professionnel' : 'Particulier'}
                                    </span>
                                </div>
                                {order.entreprise && (
                                    <div className={styles.clientInfoRow}>
                                        <span className={styles.clientInfoLabel}>Entreprise:</span>
                                        <span className={styles.clientInfoValue}>{order.entreprise}</span>
                                    </div>
                                )}
                                {order.contactData?.motif && (
                                    <div className={styles.clientInfoRow}>
                                        <span className={styles.clientInfoLabel}>Motif:</span>
                                        <span className={styles.clientInfoValue}>{getMotifLabel(order.contactData.motif)}</span>
                                    </div>
                                )}
                                {order.contactData?.address && (
                                    <div className={styles.clientInfoRow}>
                                        <span className={styles.clientInfoLabel}>Adresse:</span>
                                        <span className={styles.clientInfoValue}>{order.contactData.address}</span>
                                    </div>
                                )}
                                {order.contactData?.message && (
                                    <div className={styles.clientInfoRow} style={{ gridColumn: '1 / -1' }}>
                                        <span className={styles.clientInfoLabel}>Message:</span>
                                        <span className={styles.clientInfoValue} style={{ whiteSpace: 'pre-wrap' }}>{order.contactData.message}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Summary & History */}
                    <div className={styles.sidebar}>
                        {/* Summary Section */}
                        <div className={styles.summary}>
                            <h2 className={styles.summaryTitle}>{t('account.your_selection')}</h2>
                            
                            {/* Summary Rows by Category */}
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

                        {/* Invoice Section for validated orders */}
                        {order.status === 'validated' && (
                            <div className={styles.historySection}>
                                <h3 className={styles.summaryTitle} style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                                    Facture
                                </h3>
                                <div className={styles.actions}>
                                    <button 
                                        className={styles.reviewButton}
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

                        {/* History Section */}
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
                                                    {event.status === 'validated' ? 'Approuvée' : 
                                                     event.status === 'pending' || event.status === 'pending_confirmation' ? 'En attente' :
                                                     event.status === 'paid' ? 'Payée' :
                                                     event.status === 'received' ? 'Réceptionnée' :
                                                     event.status === 'refused' ? 'Refusée' :
                                                     event.label || event.status}
                                                </span>
                                                <span className={styles.eventDate}>{formatDate(event.date)}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.timelineEvent}>
                                        <div className={styles.timelineDot}></div>
                                        <div className={styles.timelineContent}>
                                            <span className={styles.eventLabel}>Création de la commande</span>
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

export default AdminOrderDetailModal;
