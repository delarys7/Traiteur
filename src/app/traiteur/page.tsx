"use client";

import { useState, useEffect } from 'react';
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

export default function TraiteurPage() {
    const [activeTab, setActiveTab] = useState('buffet');
    const [activeSubTab, setActiveSubTab] = useState('standard'); // For cocktails
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

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
                    className={`${styles.tab} ${activeTab === 'buffet' ? styles.active : ''}`}
                    onClick={() => setActiveTab('buffet')}
                >
                    Buffets / Banquets
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'plateau' ? styles.active : ''}`}
                    onClick={() => setActiveTab('plateau')}
                >
                    Plateaux Repas
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'cocktail' ? styles.active : ''}`}
                    onClick={() => setActiveTab('cocktail')}
                >
                    Pièces Cocktails
                </button>
            </div>

            {activeTab === 'cocktail' && (
                <div className={styles.subTabs}>
                    <button
                        className={`${styles.subTab} ${activeSubTab === 'standard' ? styles.activeSub : ''}`}
                        onClick={() => setActiveSubTab('standard')}
                    >
                        Standard
                    </button>
                    <button
                        className={`${styles.subTab} ${activeSubTab === 'premium' ? styles.activeSub : ''}`}
                        onClick={() => setActiveSubTab('premium')}
                    >
                        Premium
                    </button>
                    <button
                        className={`${styles.subTab} ${activeSubTab === 'deluxe' ? styles.activeSub : ''}`}
                        onClick={() => setActiveSubTab('deluxe')}
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
