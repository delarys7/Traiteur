"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import styles from './page.module.css';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    subcategory?: string;
    image: string;
}

function TraiteurContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialCategory = searchParams.get('category') || 'buffet';
    const initialSubcategory = searchParams.get('subcategory') || 'standard';

    const [activeTab, setActiveTab] = useState(initialCategory);
    const [activeSubTab, setActiveSubTab] = useState(initialSubcategory);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Update state when URL params change
    useEffect(() => {
        const cat = searchParams.get('category');
        const sub = searchParams.get('subcategory');
        if (cat) setActiveTab(cat);
        if (sub) setActiveSubTab(sub);
    }, [searchParams]);

    // Update URL when state changes (optional, but good for UX)
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        const url = new URL(window.location.href);
        url.searchParams.set('category', tab);
        if (tab !== 'cocktail') url.searchParams.delete('subcategory');
        router.push(url.pathname + url.search);
    };

    const handleSubTabChange = (sub: string) => {
        setActiveSubTab(sub);
        const url = new URL(window.location.href);
        url.searchParams.set('subcategory', sub);
        router.push(url.pathname + url.search);
    };

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            let url = `/api/products?category=${activeTab}`;
            if (activeTab === 'cocktail') {
                url += `&subcategory=${activeSubTab}`;
            }

            try {
                const res = await fetch(url);
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [activeTab, activeSubTab]);

    const getTitle = () => {
        switch (activeTab) {
            case 'buffet': return 'Buffets & Banquets';
            case 'plateau': return 'Plateaux Repas';
            case 'cocktail':
                const sub = activeSubTab.charAt(0).toUpperCase() + activeSubTab.slice(1);
                return `Pièces Cocktails ${sub}`;
            default: return 'Traiteur';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.pageTitle}>{getTitle()}</h1>
                    <span className={styles.resultCount}>({products.length} résultats)</span>
                </div>
                
                <div className={styles.filterBar}>
                    {/* Placeholder for future filters */}
                    <div className={styles.filterPlaceholder}>
                        <span className={styles.filterLabel}>Filtrer par :</span>
                        <div className={styles.dummyFilters}>
                            <div className={styles.dummyFilter}>Prix</div>
                            <div className={styles.dummyFilter}>Type</div>
                            <div className={styles.dummyFilter}>Régime</div>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Chargement des mets d&apos;exception...</div>
            ) : (
                <div className={styles.grid}>
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    {products.length === 0 && (
                        <p className={styles.empty}>Aucun produit disponible dans cette catégorie pour le moment.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default function TraiteurPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '5rem' }}>Chargement...</div>}>
            <TraiteurContent />
        </Suspense>
    );
}
