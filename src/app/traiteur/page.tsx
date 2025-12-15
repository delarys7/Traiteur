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

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>La Carte Traiteur</h1>
                <p className={styles.subtitle}>Une sélection d&apos;excellence pour vos convives.</p>
            </header>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'buffet' ? styles.activeTab : ''}`} // Fixed styles.active -> styles.activeTab
                    onClick={() => handleTabChange('buffet')}
                >
                    Buffets / Banquets
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'plateau' ? styles.activeTab : ''}`}
                    onClick={() => handleTabChange('plateau')}
                >
                    Plateaux Repas
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'cocktail' ? styles.activeTab : ''}`}
                    onClick={() => handleTabChange('cocktail')}
                >
                    Pièces Cocktails
                </button>
            </div>

            {activeTab === 'cocktail' && (
                <div className={styles.subTabs}>
                    <button
                        className={`${styles.subTab} ${activeSubTab === 'standard' ? styles.activeSubTab : ''}`} // Fixed activeSub -> activeSubTab
                        onClick={() => handleSubTabChange('standard')}
                    >
                        Standard
                    </button>
                    <button
                        className={`${styles.subTab} ${activeSubTab === 'premium' ? styles.activeSubTab : ''}`}
                        onClick={() => handleSubTabChange('premium')}
                    >
                        Premium
                    </button>
                    <button
                        className={`${styles.subTab} ${activeSubTab === 'deluxe' ? styles.activeSubTab : ''}`}
                        onClick={() => handleSubTabChange('deluxe')}
                    >
                        Deluxe
                    </button>
                </div>
            )}

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
