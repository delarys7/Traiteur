"use client";

import styles from './ProductCard.module.css';
import { useCart } from '@/context/CartContext';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    cuisine?: string;
    dietary?: string;
    allergies?: string;
}

export default function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();

    const handleAdd = () => {
        addToCart(product);
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                {/* Placeholder for actual image */}
                <div className={styles.placeholderImage}>{product.name.charAt(0)}</div>
            </div>
            <div className={styles.info}>
                <div className={styles.header}>
                    <h3 className={styles.name}>{product.name}</h3>
                    <span className={styles.price}>{product.price.toFixed(2)}€</span>
                </div>
                
                <div className={styles.tagContainer}>
                    {product.cuisine && product.cuisine.split(',').map(tag => (
                        <span key={tag} className={`${styles.tag} ${styles.cuisineTag}`}>{tag}</span>
                    ))}
                    {product.dietary && product.dietary.split(',').map(tag => (
                        <span key={tag} className={`${styles.tag} ${styles.dietaryTag}`}>{tag}</span>
                    ))}
                    {product.allergies && product.allergies !== 'aucune' && product.allergies.split(',').map(tag => (
                        <span key={tag} className={`${styles.tag} ${styles.allergyTag}`}>{tag}</span>
                    ))}
                </div>

                <p className={styles.description}>{product.description}</p>
                <button className={styles.button} onClick={handleAdd}>
                    Ajouter
                </button>
            </div>
        </div>
    );
}
