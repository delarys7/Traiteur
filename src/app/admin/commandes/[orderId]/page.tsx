"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import AdminOrderDetailModal from '@/components/AdminOrderDetailModal';
import { AdminOrder } from '@/components/AdminOrderCard';
import styles from '../page.module.css';

function OrderDetailContent() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const fromClients = searchParams.get('from') === 'clients';
    const orderId = params.orderId as string;
    const { t } = useLanguage();
    
    const [order, setOrder] = useState<AdminOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/compte?redirect=/admin/commandes');
            return;
        }

        if (user && user.type !== 'administrateur') {
            router.push('/compte');
            return;
        }

        if (user && user.type === 'administrateur' && orderId) {
            fetchOrder();
        }
    }, [user, isLoading, orderId, router]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/orders');
            
            if (!response.ok) {
                if (response.status === 403) {
                    setError('Accès refusé. Vous devez être administrateur.');
                    router.push('/compte');
                    return;
                }
                throw new Error('Erreur lors du chargement de la commande');
            }

            const data = await response.json();
            const foundOrder = data.orders.find((o: AdminOrder) => o.id === orderId);
            
            if (!foundOrder) {
                setError('Commande introuvable');
                return;
            }
            
            setOrder(foundOrder);
        } catch (err: any) {
            console.error('Erreur:', err);
            setError(err.message || 'Erreur lors du chargement de la commande');
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Chargement de la commande...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error}</div>
                <Link href={fromClients ? "/admin/clients" : "/admin/commandes"} className={styles.backLink}>
                    {fromClients ? "← Retour aux clients" : "← Retour aux commandes"}
                </Link>
            </div>
        );
    }

    if (!user || user.type !== 'administrateur') {
        return null;
    }

    if (!order) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>Commande introuvable</div>
                <Link href={fromClients ? "/admin/clients" : "/admin/commandes"} className={styles.backLink}>
                    {fromClients ? "← Retour aux clients" : "← Retour aux commandes"}
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Link href={fromClients ? "/admin/clients" : "/admin/commandes"} className={styles.backLink}>
                {fromClients ? "← Retour aux clients" : "← Retour aux commandes"}
            </Link>
            <AdminOrderDetailModal
                order={order}
                isOpen={true}
                onClose={() => router.push(fromClients ? '/admin/clients' : '/admin/commandes')}
            />
        </div>
    );
}

export default function OrderDetailPage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.loading}>Chargement...</div>
            </div>
        }>
            <OrderDetailContent />
        </Suspense>
    );
}
