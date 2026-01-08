"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import styles from './page.module.css';

interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    type: string;
    entreprise: string;
    allergies: string;
    orderCount: number;
    lastOrderDate: string | null;
    lastOrderType: string | null;
    averageOrderPrice: number;
}

function ClientsContent() {
    const { user, isLoading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
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

        if (user && user.type === 'administrateur') {
            fetchClients();
        }
    }, [user, isLoading, router]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/clients');
            
            if (!response.ok) {
                if (response.status === 403) {
                    setError('Accès refusé. Vous devez être administrateur.');
                    router.push('/compte');
                    return;
                }
                throw new Error('Erreur lors du chargement des clients');
            }

            const data = await response.json();
            setClients(data.clients || []);
        } catch (err: any) {
            console.error('Erreur:', err);
            setError(err.message || 'Erreur lors du chargement des clients');
        } finally {
            setLoading(false);
        }
    };

    if (isLoading || loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Chargement des clients...</div>
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
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Mail</th>
                            <th>Téléphone</th>
                            <th>Type</th>
                            <th>Entreprise</th>
                            <th>Allergies</th>
                            <th>Nb commandes</th>
                            <th>Dernière commande</th>
                            <th>Type dernière commande</th>
                            <th>Prix moyen</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.length === 0 ? (
                            <tr>
                                <td colSpan={12} className={styles.empty}>
                                    Aucun client trouvé
                                </td>
                            </tr>
                        ) : (
                            clients.map((client) => (
                                <tr key={client.id}>
                                    <td>{client.lastName || '-'}</td>
                                    <td>{client.firstName || '-'}</td>
                                    <td>{client.email}</td>
                                    <td>{client.phone || '-'}</td>
                                    <td>
                                        <span className={client.type === 'entreprise' ? styles.badgeEnterprise : styles.badgeParticulier}>
                                            {client.type === 'entreprise' ? 'Entreprise' : 'Particulier'}
                                        </span>
                                    </td>
                                    <td>{client.entreprise || '-'}</td>
                                    <td>{client.allergies || '-'}</td>
                                    <td>{client.orderCount}</td>
                                    <td>
                                        {client.lastOrderDate 
                                            ? new Date(client.lastOrderDate).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })
                                            : '-'
                                        }
                                    </td>
                                    <td>{client.lastOrderType || '-'}</td>
                                    <td>
                                        {client.orderCount > 0 
                                            ? `${client.averageOrderPrice.toFixed(2)} €`
                                            : '-'
                                        }
                                    </td>
                                    <td>
                                        <Link 
                                            href={`/admin/clients/${client.id}/orders`}
                                            className={styles.viewButton}
                                        >
                                            Voir l'historique
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function ClientsPage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.loading}>Chargement...</div>
            </div>
        }>
            <ClientsContent />
        </Suspense>
    );
}
