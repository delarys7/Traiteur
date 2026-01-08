"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import styles from '@/app/compte/page.module.css';

interface Address {
    id: string;
    name: string;
    address: string;
    postalCode: string;
    city: string;
    createdAt: string;
    updatedAt: string;
}

interface Order {
    id: string;
    type: string;
    status: string;
    total: number;
    items: any;
    serviceType: string | null;
    createdAt: string;
}

interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    type: string;
    raisonSociale: string;
    allergies: string;
    createdAt: string;
}

interface Stats {
    orderCount: number;
    averageOrderPrice: number;
    lastOrderDate: string | null;
    lastOrderType: string | null;
    lastOrderPrice: number | null;
}

function ClientDetailContent() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const userId = params.userId as string;
    
    const [client, setClient] = useState<Client | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [pendingMessages, setPendingMessages] = useState<any[]>([]);
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
            fetchClientDetail();
        }
    }, [user, isLoading, userId, router]);

    const fetchClientDetail = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/clients/${userId}/detail`);
            
            if (!response.ok) {
                if (response.status === 403) {
                    setError('Accès refusé. Vous devez être administrateur.');
                    router.push('/compte');
                    return;
                }
                throw new Error('Erreur lors du chargement des détails');
            }

            const data = await response.json();
            setClient(data.client);
            setAddresses(data.addresses || []);
            setOrders(data.orders || []);
            setStats(data.stats);
            setPendingMessages(data.pendingMessages || []);
        } catch (err: any) {
            console.error('Erreur:', err);
            setError(err.message || 'Erreur lors du chargement des détails');
        } finally {
            setLoading(false);
        }
    };

    const getMotifLabel = (motif: string): string => {
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

    if (isLoading || loading) {
        return (
            <div className={styles.container}>
                <div style={{ textAlign: 'center', padding: '3rem' }}>Chargement...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error}</div>
                <Link href="/admin/clients" style={{ display: 'inline-block', marginTop: '1rem', color: '#111' }}>
                    ← Retour à la liste
                </Link>
            </div>
        );
    }

    if (!user || user.type !== 'administrateur' || !client) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.dashboard}>
                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/admin/clients" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
                        ← Retour à la liste des clients
                    </Link>
                </div>

                {/* Section Statistiques */}
                <div className={styles.premiumCard} style={{ marginBottom: '2rem' }}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Statistiques</h2>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Nombre de commandes</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111' }}>{stats?.orderCount || 0}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Panier moyen</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111' }}>
                                {stats?.averageOrderPrice ? `${stats.averageOrderPrice.toFixed(2)} €` : '-'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Dernière commande</div>
                            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111', marginBottom: '0.25rem' }}>
                                {stats?.lastOrderDate 
                                    ? new Date(stats.lastOrderDate).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })
                                    : '-'
                                }
                            </div>
                            {stats?.lastOrderType && (
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{stats.lastOrderType}</div>
                            )}
                            {stats?.lastOrderPrice && (
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>{stats.lastOrderPrice.toFixed(2)} €</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.dashboardGrid}>
                    {/* Section Informations personnelles */}
                    <div className={styles.personalInfoSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Informations personnelles</h2>
                        </div>
                        
                        <div className={styles.profileInfo}>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Type de compte</span>
                                <span className={styles.infoValue}>
                                    {client.type === 'entreprise' ? 'Entreprise' : 'Particulier'}
                                </span>
                            </div>
                            {client.type === 'entreprise' && client.raisonSociale && (
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Raison Sociale</span>
                                    <span className={styles.infoValue}>{client.raisonSociale}</span>
                                </div>
                            )}
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Nom complet</span>
                                <span className={styles.infoValue}>
                                    {client.firstName && client.lastName
                                        ? `${client.firstName} ${client.lastName}`
                                        : '-'}
                                </span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Email</span>
                                <span className={styles.infoValue}>{client.email}</span>
                            </div>
                            {client.phone && (
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Téléphone</span>
                                    <span className={styles.infoValue}>{client.phone}</span>
                                </div>
                            )}
                            {client.type === 'particulier' && (
                                <div className={styles.infoRow}>
                                    <span className={styles.infoLabel}>Allergies</span>
                                    <span className={styles.infoValue}>
                                        {client.allergies ? (
                                            <div className={styles.displayTags}>
                                                {client.allergies.split(',').filter(Boolean).map((allergy: string) => (
                                                    <span key={allergy} className={styles.displayTag}>
                                                        {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : '-'}
                                    </span>
                                </div>
                            )}
                            <div className={styles.infoRow}>
                                <span className={styles.infoLabel}>Date d'inscription</span>
                                <span className={styles.infoValue}>
                                    {new Date(client.createdAt).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Section Adresses */}
                    <div className={styles.addressesSection}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Adresses</h2>
                        </div>
                        
                        {addresses.length === 0 ? (
                            <p className={styles.empty}>Aucune adresse enregistrée</p>
                        ) : (
                            <div className={styles.addressesList}>
                                {addresses.map((address) => (
                                    <div key={address.id} className={styles.addressCard}>
                                        <div className={styles.addressContent}>
                                            <h3 className={styles.addressName}>{address.name}</h3>
                                            <p className={styles.addressDetails}>
                                                {address.address}<br />
                                                {address.postalCode} {address.city}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Section Commandes */}
                <div className={styles.premiumCard}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Commandes</h2>
                    </div>
                    {orders.length === 0 ? (
                        <div className={styles.ordersGallery}>
                            <p className={styles.empty}>Aucune commande</p>
                        </div>
                    ) : (
                        <div style={{ padding: '1.5rem' }}>
                            {orders.map((order) => (
                                <div key={order.id} style={{ 
                                    padding: '1.5rem', 
                                    marginBottom: '1rem', 
                                    border: '1px solid #eee', 
                                    borderRadius: '8px',
                                    backgroundColor: '#fafafa'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                                Commande #{order.id.substring(0, 8)}
                                            </h3>
                                            <p style={{ fontSize: '0.85rem', color: '#666' }}>
                                                {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                                {order.total.toFixed(2)} €
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                {order.type === 'product' ? 'Produits' : (order.serviceType || 'Prestation')}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                                                {order.status}
                                            </div>
                                        </div>
                                    </div>
                                    {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem' }}>Articles :</h4>
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                {order.items.map((item: any, index: number) => (
                                                    <li key={index} style={{ 
                                                        padding: '0.5rem 0', 
                                                        fontSize: '0.85rem', 
                                                        color: '#666',
                                                        borderBottom: index < order.items.length - 1 ? '1px solid #f5f5f5' : 'none'
                                                    }}>
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

                {/* Section Messages en attente */}
                {pendingMessages.length > 0 && (
                    <div className={styles.premiumCard}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Messages en attente de réponse</h2>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            {pendingMessages.map((msg) => (
                                <div key={msg.id} style={{ 
                                    padding: '1rem', 
                                    marginBottom: '1rem', 
                                    border: '1px solid #fff3cd', 
                                    borderRadius: '8px',
                                    backgroundColor: '#fffbf0'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                        <span style={{ 
                                            display: 'inline-block',
                                            padding: '0.25rem 0.75rem',
                                            backgroundColor: '#fff3cd',
                                            color: '#856404',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500'
                                        }}>
                                            {getMotifLabel(msg.motif)}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                            {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: '#333', margin: 0 }}>
                                        {msg.message.substring(0, 200)}{msg.message.length > 200 ? '...' : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ClientDetailPage() {
    return (
        <Suspense fallback={
            <div style={{ padding: '3rem', textAlign: 'center' }}>Chargement...</div>
        }>
            <ClientDetailContent />
        </Suspense>
    );
}
