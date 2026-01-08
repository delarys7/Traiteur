"use client";

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
    pendingMessageMotif: string | null;
}

type SortField = 'lastName' | 'firstName' | 'email' | 'type' | 'orderCount' | 'lastOrderDate';
type SortDirection = 'asc' | 'desc';
type GroupBy = 'none' | 'type' | 'entreprise' | 'status';

function ClientsContent() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // États pour recherche, filtres, tri, groupement
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('lastName');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [groupBy, setGroupBy] = useState<GroupBy>('none');

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

    // Fonction pour obtenir le label du motif
    const getMotifLabel = (motif: string | null): string => {
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

    // Filtrer et trier les clients
    const filteredAndSortedClients = useMemo(() => {
        let filtered = [...clients];

        // Recherche
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(client => 
                client.firstName.toLowerCase().includes(searchLower) ||
                client.lastName.toLowerCase().includes(searchLower) ||
                client.email.toLowerCase().includes(searchLower) ||
                client.phone?.toLowerCase().includes(searchLower) ||
                client.entreprise?.toLowerCase().includes(searchLower)
            );
        }

        // Filtre par type
        if (filterType !== 'all') {
            filtered = filtered.filter(client => client.type === filterType);
        }

        // Filtre par statut
        if (filterStatus !== 'all') {
            if (filterStatus === 'pending') {
                filtered = filtered.filter(client => client.pendingMessageMotif !== null);
            } else if (filterStatus === 'none') {
                filtered = filtered.filter(client => client.pendingMessageMotif === null);
            }
        }

        // Tri
        filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (sortField) {
                case 'lastName':
                    aValue = a.lastName || '';
                    bValue = b.lastName || '';
                    break;
                case 'firstName':
                    aValue = a.firstName || '';
                    bValue = b.firstName || '';
                    break;
                case 'email':
                    aValue = a.email;
                    bValue = b.email;
                    break;
                case 'type':
                    aValue = a.type;
                    bValue = b.type;
                    break;
                case 'orderCount':
                    aValue = a.orderCount;
                    bValue = b.orderCount;
                    break;
                case 'lastOrderDate':
                    aValue = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
                    bValue = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [clients, search, filterType, filterStatus, sortField, sortDirection]);

    // Grouper les clients
    const groupedClients = useMemo(() => {
        if (groupBy === 'none') {
            return { '': filteredAndSortedClients };
        }

        const groups: { [key: string]: Client[] } = {};
        
        filteredAndSortedClients.forEach(client => {
            let key = '';
            switch (groupBy) {
                case 'type':
                    key = client.type === 'entreprise' ? 'Entreprise' : 'Particulier';
                    break;
                case 'entreprise':
                    key = client.entreprise || 'Sans entreprise';
                    break;
                case 'status':
                    key = client.pendingMessageMotif ? 'En attente' : 'RAS';
                    break;
            }
            
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(client);
        });

        return groups;
    }, [filteredAndSortedClients, groupBy]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
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
            {/* Barre de recherche et filtres */}
            <div className={styles.toolbar}>
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Rechercher un client..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                
                <div className={styles.filters}>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">Tous les types</option>
                        <option value="particulier">Particulier</option>
                        <option value="entreprise">Entreprise</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En attente de réponse</option>
                        <option value="none">RAS</option>
                    </select>

                    <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                        className={styles.filterSelect}
                    >
                        <option value="none">Aucun groupement</option>
                        <option value="type">Grouper par type</option>
                        <option value="entreprise">Grouper par entreprise</option>
                        <option value="status">Grouper par statut</option>
                    </select>
                </div>
            </div>

            {/* Tableau */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('lastName')} className={styles.sortable}>
                                Nom {sortField === 'lastName' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('firstName')} className={styles.sortable}>
                                Prénom {sortField === 'firstName' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th onClick={() => handleSort('email')} className={styles.sortable}>
                                Mail {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Téléphone</th>
                            <th onClick={() => handleSort('type')} className={styles.sortable}>
                                Type {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>Entreprise</th>
                            <th>Allergies</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(groupedClients).length === 0 || filteredAndSortedClients.length === 0 ? (
                            <tr>
                                <td colSpan={9} className={styles.empty}>
                                    Aucun client trouvé
                                </td>
                            </tr>
                        ) : (
                            Object.entries(groupedClients).map(([groupKey, groupClients]) => (
                                <React.Fragment key={groupKey}>
                                    {groupBy !== 'none' && (
                                        <tr className={styles.groupHeader}>
                                            <td colSpan={9} className={styles.groupTitle}>
                                                {groupKey}
                                            </td>
                                        </tr>
                                    )}
                                    {groupClients.map((client) => (
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
                                            <td>{client.type === 'entreprise' ? (client.entreprise || '-') : '-'}</td>
                                            <td>{client.type === 'particulier' ? (client.allergies || '-') : '-'}</td>
                                            <td>
                                                {client.pendingMessageMotif ? (
                                                    <span className={styles.statusTag}>
                                                        {getMotifLabel(client.pendingMessageMotif)}
                                                    </span>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td>
                                                <div className={styles.actionButtons}>
                                                    <Link 
                                                        href={`/admin/clients/${client.id}/detail`}
                                                        className={styles.detailButton}
                                                    >
                                                        Détail
                                                    </Link>
                                                    <Link 
                                                        href={`/admin/clients/${client.id}/send-message`}
                                                        className={styles.messageButton}
                                                    >
                                                        Message
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
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
