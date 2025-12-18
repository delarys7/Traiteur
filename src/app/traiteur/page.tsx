"use client";

import { useState, useEffect, Suspense, useRef } from 'react';
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
    cuisine?: string;
    dietary?: string;
    allergies?: string;
}

function TraiteurContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const activeTab = searchParams.get('category') || 'buffet';
    const activeSubTab = searchParams.get('subcategory') || 'standard';

    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [priceMin, setPriceMin] = useState<string>('');
    const [priceMax, setPriceMax] = useState<string>('');
    const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
    const [selectedDietary, setSelectedDietary] = useState<string>('all');
    const [selectedAllergy, setSelectedAllergy] = useState<string>('all');
    
    // UI states
    const [showPricePopup, setShowPricePopup] = useState(false);
    const pricePopupRef = useRef<HTMLDivElement>(null);

    // Options for filters
    const cuisineOptions = ['italienne', 'française', 'espagnole', 'mexicaine', 'libanaise', 'marocaine', 'japonaise', 'chinoise', 'russe', 'américaine'];
    const dietaryOptions = ['végétarien', 'végétalien', 'vegan', 'carnivore', 'poisson'];
    const allergyOptions = ['gluten', 'lactose', 'fruits à coque', 'crustacés', 'sésame'];

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
                setAllProducts(data);
                setFilteredProducts(data);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [activeTab, activeSubTab]);

    // Apply filters
    useEffect(() => {
        let result = [...allProducts];

        if (priceMin) {
            result = result.filter(p => p.price >= parseFloat(priceMin));
        }
        if (priceMax) {
            result = result.filter(p => p.price <= parseFloat(priceMax));
        }
        if (selectedCuisine !== 'all') {
            result = result.filter(p => p.cuisine?.toLowerCase().includes(selectedCuisine.toLowerCase()));
        }
        if (selectedDietary !== 'all') {
            result = result.filter(p => p.dietary?.toLowerCase().includes(selectedDietary.toLowerCase()));
        }
        if (selectedAllergy !== 'all') {
            result = result.filter(p => p.allergies?.toLowerCase().includes(selectedAllergy.toLowerCase()));
        }

        setFilteredProducts(result);
    }, [allProducts, priceMin, priceMax, selectedCuisine, selectedDietary, selectedAllergy]);

    // Close popup on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pricePopupRef.current && !pricePopupRef.current.contains(event.target as Node)) {
                setShowPricePopup(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                    <span className={styles.resultCount}>({filteredProducts.length} résultats)</span>
                </div>
                
                <div className={styles.filterBar}>
                    <div className={styles.filtersLeft}>
                        <span className={styles.filterLabel}>Filtrer par :</span>
                        
                        {/* Price Filter */}
                        <div className={styles.filterItem} ref={pricePopupRef}>
                            <button 
                                className={`${styles.filterButton} ${ (priceMin || priceMax) ? styles.activeFilter : ''}`}
                                onClick={() => setShowPricePopup(!showPricePopup)}
                            >
                                Prix {(priceMin || priceMax) ? `(${priceMin || '0'}€ - ${priceMax || '∞'}€)` : ''}
                            </button>
                            {showPricePopup && (
                                <div className={styles.pricePopup}>
                                    <div className={styles.priceInputGroup}>
                                        <input 
                                            type="number" 
                                            placeholder="Min €" 
                                            value={priceMin} 
                                            onChange={(e) => setPriceMin(e.target.value)}
                                            className={styles.priceInput}
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Max €" 
                                            value={priceMax} 
                                            onChange={(e) => setPriceMax(e.target.value)}
                                            className={styles.priceInput}
                                        />
                                    </div>
                                    <button 
                                        className={styles.clearButton}
                                        onClick={() => { setPriceMin(''); setPriceMax(''); }}
                                    >
                                        Effacer
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Cuisine Filter */}
                        <select 
                            className={`${styles.filterSelect} ${selectedCuisine !== 'all' ? styles.activeFilter : ''}`}
                            value={selectedCuisine}
                            onChange={(e) => setSelectedCuisine(e.target.value)}
                        >
                            <option value="all">Cuisine</option>
                            {cuisineOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                        </select>

                        {/* Dietary Filter */}
                        <select 
                            className={`${styles.filterSelect} ${selectedDietary !== 'all' ? styles.activeFilter : ''}`}
                            value={selectedDietary}
                            onChange={(e) => setSelectedDietary(e.target.value)}
                        >
                            <option value="all">Régime</option>
                            {dietaryOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                        </select>

                        {/* Allergy Filter */}
                        <select 
                            className={`${styles.filterSelect} ${selectedAllergy !== 'all' ? styles.activeFilter : ''}`}
                            value={selectedAllergy}
                            onChange={(e) => setSelectedAllergy(e.target.value)}
                        >
                            <option value="all">Allergies</option>
                            {allergyOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                        </select>
                    </div>

                    <button 
                        className={styles.resetFilters}
                        onClick={() => {
                            setPriceMin('');
                            setPriceMax('');
                            setSelectedCuisine('all');
                            setSelectedDietary('all');
                            setSelectedAllergy('all');
                        }}
                    >
                        Réinitialiser
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Chargement des mets d&apos;exception...</div>
            ) : (
                <div className={styles.grid}>
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className={styles.emptyContainer}>
                            <p className={styles.empty}>Aucun produit ne correspond à vos critères d&apos;exception.</p>
                            <button 
                                className={styles.clearAllButton}
                                onClick={() => {
                                    setPriceMin('');
                                    setPriceMax('');
                                    setSelectedCuisine('all');
                                    setSelectedDietary('all');
                                    setSelectedAllergy('all');
                                }}
                            >
                                Voir toute la collection
                            </button>
                        </div>
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
