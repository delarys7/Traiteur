"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import styles from '../../page.module.css';

interface Order {
    id: string;
    type: string;
    status: string;
    total: number;
    items: any;
    serviceType: string | null;
    createdAt: string;
    updatedAt: string;
}

interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    type: string;
    entreprise: string;
    allergies: string;
}

function OrdersContent() {
    const { user, isLoading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const params = useParams();
    const userId = params.userId as string;
    
    const [client, setClient] = useState<Client | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/compte?redirect=/admin/clients');
            return;
        }

        if (user && user.type !== 'administrateur') {
            router.push('/compte');
            return;
        }

        if (user && user.type === 'administrateur' && userId) {
            fetchOrders();
        }
    }, [user, isLoading, userId, router]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/clients/${userId}/orders`);
            
            if (!response.ok) {
                if (response.status === 403) {
                    setError('Accès refusé. Vous devez être administrateur.');
                    router.push('/compte');
                    return;
                }
                throw new Error('Erreur lors du chargement des commandes');
            }

            const data = await response.json();
            setClient(data.client);
            setOrders(data.orders || []);
        } catch (err: any) {
            console.error('Erreur:', err);
            setError(err.message || 'Erreur lors du chargement des commandes');
        } finally {
            setLoading(false);
        }
    };

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
                <Link href="/admin/clients" className={styles.viewButton} style={{ marginTop: '1rem', display: 'inline-block' }}>
                    Retour à la liste
                </Link>
            </div>
        );
    }

    if (!user || user.type !== 'administrateur') {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin/clients" className={styles.backLink}>
                    ← Retour à la liste
                </Link>
                <h1 className={styles.title}>
                    Historique des commandes - {client?.firstName} {client?.lastName}
                </h1>
                <p className={styles.subtitle}>{client?.email}</p>
            </div>

            {orders.length === 0 ? (
                <div className={styles.empty}>
                    Aucune commande pour ce client
                </div>
            ) : (
                <div className={styles.ordersList}>
                    {orders.map((order) => (
                        <div key={order.id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <div>
                                    <h3 className={styles.orderId}>
                                        Commande #{order.id.substring(0, 8)}
                                    </h3>
                                    <p className={styles.orderDate}>
                                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className={styles.orderInfo}>
                                    <span className={styles.orderType}>
                                        {order.type === 'product' ? 'Produits' : (order.serviceType || 'Prestation')}
                                    </span>
                                    <span className={styles.orderStatus}>
                                        {order.status}
                                    </span>
                                    <span className={styles.orderTotal}>
                                        {order.total.toFixed(2)} €
                                    </span>
                                </div>
                            </div>
                            {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                                <div className={styles.orderItems}>
                                    <h4>Articles :</h4>
                                    <ul>
                                        {order.items.map((item: any, index: number) => (
                                            <li key={index}>
                                                {item.name || item.productName} - 
                                                {item.quantity ? ` x${item.quantity}` : ''} - 
                                                {item.price ? `${item.price.toFixed(2)} €` : ''}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ClientOrdersPage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.loading}>Chargement...</div>
            </div>
        }>
            <OrdersContent />
        </Suspense>
    );
}
