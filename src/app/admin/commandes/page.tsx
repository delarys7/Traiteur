"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import AdminOrderCard, { AdminOrder } from '@/components/AdminOrderCard';
import RefuseOrderModal from '@/components/RefuseOrderModal';
import styles from './page.module.css';

function CommandesContent() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<AdminOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showRefuseModal, setShowRefuseModal] = useState(false);
    const [orderToRefuse, setOrderToRefuse] = useState<AdminOrder | null>(null);
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
    const [filterType, setFilterType] = useState<'commandes' | 'services' | 'autres'>('commandes');
    
    const galleryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/compte?redirect=/admin/commandes');
            return;
        }

        if (user && user.type !== 'administrateur') {
            router.push('/compte');
            return;
        }

        if (user && user.type === 'administrateur') {
            fetchOrders();
        }
    }, [user, isLoading, router]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/orders');
            
            if (!response.ok) {
                if (response.status === 403) {
                    setError('Accès refusé. Vous devez être administrateur.');
                    router.push('/compte');
                    return;
                }
                throw new Error('Erreur lors du chargement des commandes');
            }

            const data = await response.json();
            setOrders(data.orders || []);
            setFilteredOrders(data.orders || []);
        } catch (err: any) {
            console.error('Erreur:', err);
            setError(err.message || 'Erreur lors du chargement des commandes');
        } finally {
            setLoading(false);
        }
    };

    // Filtrer par recherche et par type
    useEffect(() => {
        let filtered = [...orders];

        // Filtre par type
        if (filterType === 'commandes') {
            filtered = filtered.filter(order => order.serviceType === 'commande');
        } else if (filterType === 'services') {
            filtered = filtered.filter(order => order.serviceType !== 'commande' && order.serviceType !== 'autre');
        } else if (filterType === 'autres') {
            filtered = filtered.filter(order => order.serviceType === 'autre');
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(order => {
                const fullName = `${order.firstName || ''} ${order.lastName || ''}`.toLowerCase();
                return fullName.includes(query);
            });
        }
        setFilteredOrders(filtered);
    }, [searchQuery, orders, filterType]);

    // Grouper par statut (normaliser pending_confirmation en pending)
    const groupedOrders = filteredOrders.reduce((acc, order) => {
        let status = order.status || 'pending';
        // Normaliser pending_confirmation en pending pour l'affichage
        if (status === 'pending_confirmation') {
            status = 'pending';
        }
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(order);
        return acc;
    }, {} as { [key: string]: AdminOrder[] });

    // Trier chaque groupe par date de mise à jour décroissante
    Object.keys(groupedOrders).forEach(status => {
        groupedOrders[status].sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    });

    const scrollGallery = (status: string, direction: 'left' | 'right') => {
        const gallery = galleryRefs.current[status];
        if (gallery) {
            const scrollAmount = 350;
            gallery.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const showNotification = (message: string) => {
        setToast({ message, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    const handleValidate = async (order: AdminOrder) => {
        try {
            const response = await fetch(`/api/admin/orders/${order.id}/validate`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la validation');
            }
            
            await fetchOrders();
            showNotification('Commande approuvée');
        } catch (err: any) {
            console.error('Erreur:', err);
            alert(err.message || 'Erreur lors de la validation');
        }
    };

    const handleRefuse = (order: AdminOrder) => {
        setOrderToRefuse(order);
        setShowRefuseModal(true);
    };

    const handleRefuseConfirm = async (reason: string) => {
        if (!orderToRefuse) return;
        
        try {
            const response = await fetch(`/api/admin/orders/${orderToRefuse.id}/refuse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors du refus');
            }
            
            setShowRefuseModal(false);
            setOrderToRefuse(null);
            await fetchOrders();
            showNotification('Commande refusée');
        } catch (err: any) {
            console.error('Erreur:', err);
            alert(err.message || 'Erreur lors du refus');
        }
    };

    const handleRelaunch = async (order: AdminOrder) => {
        try {
            const response = await fetch(`/api/admin/orders/${order.id}/relaunch`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la relance');
            }
            
            await fetchOrders();
        } catch (err: any) {
            console.error('Erreur:', err);
            alert(err.message || 'Erreur lors de la relance');
        }
    };

    const canRelaunch = (order: AdminOrder): boolean => {
        // Vérifier si 7 jours se sont écoulés depuis le dernier email
        // Pour l'instant, on retourne true (à implémenter avec la table des emails)
        return true;
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'En attente';
            case 'validated': return 'Approuvée';
            case 'paid': return 'Payée';
            case 'received': return 'Réceptionnée';
            case 'refused': return 'Refusée';
            default: return status;
        }
    };

    // Normaliser les statuts dans statusOrder pour éviter les doublons
    const normalizedStatusOrder = ['pending', 'validated', 'paid', 'received', 'refused'];

    if (isLoading || loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Chargement des commandes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error}</div>
            </div>
        );
    }

    if (!user || user.type !== 'administrateur') {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Demandes</h1>
                    <div className={styles.filterButtons}>
                        <button 
                            className={`${styles.filterButton} ${filterType === 'commandes' ? styles.active : ''}`}
                            onClick={() => setFilterType('commandes')}
                        >
                            Commandes
                        </button>
                        <button 
                            className={`${styles.filterButton} ${filterType === 'services' ? styles.active : ''}`}
                            onClick={() => setFilterType('services')}
                        >
                            Services
                        </button>
                        <button 
                            className={`${styles.filterButton} ${filterType === 'autres' ? styles.active : ''}`}
                            onClick={() => setFilterType('autres')}
                        >
                            Autres
                        </button>
                    </div>
                </div>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Rechercher par nom..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {normalizedStatusOrder.map(status => {
                const statusOrders = groupedOrders[status] || [];
                if (statusOrders.length === 0) return null;

                return (
                    <div key={status} className={styles.statusSection}>
                        <div className={styles.statusHeader}>
                            <h2 className={styles.statusTitle}>
                                {getStatusLabel(status)} ({statusOrders.length})
                            </h2>
                            <div className={styles.statusSeparator}></div>
                        </div>
                        <div className={styles.galleryWrapper}>
                            <button 
                                className={`${styles.scrollArrow} ${styles.leftArrow}`}
                                onClick={() => scrollGallery(status, 'left')}
                            >
                                ‹
                            </button>
                            <div 
                                className={styles.ordersGallery} 
                                ref={(el) => { galleryRefs.current[status] = el; }}
                            >
                                {statusOrders.map(order => (
                                    <AdminOrderCard
                                        key={order.id}
                                        order={order}
                                        onDetails={(ord) => {
                                            router.push(`/admin/commandes/${ord.id}`);
                                        }}
                                        onValidate={(order.status === 'pending' || order.status === 'pending_confirmation') ? handleValidate : undefined}
                                        onRefuse={(order.status === 'pending' || order.status === 'pending_confirmation') ? handleRefuse : undefined}
                                        onRelaunch={order.status === 'validated' ? handleRelaunch : undefined}
                                        canRelaunch={order.status === 'validated' ? canRelaunch(order) : false}
                                    />
                                ))}
                            </div>
                            <button 
                                className={`${styles.scrollArrow} ${styles.rightArrow}`}
                                onClick={() => scrollGallery(status, 'right')}
                            >
                                ›
                            </button>
                        </div>
                    </div>
                );
            })}

            {showRefuseModal && orderToRefuse && (
                <RefuseOrderModal
                    order={orderToRefuse}
                    isOpen={showRefuseModal}
                    onClose={() => {
                        setShowRefuseModal(false);
                        setOrderToRefuse(null);
                    }}
                    onConfirm={handleRefuseConfirm}
                />
            )}

            {/* Toast Notification */}
            {toast.visible && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#000',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 2000,
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}

export default function CommandesPage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.loading}>Chargement...</div>
            </div>
        }>
            <CommandesContent />
            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </Suspense>
    );
}
