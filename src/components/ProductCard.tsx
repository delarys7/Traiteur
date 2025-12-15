"use client";

import styles from './ProductCard.module.css';
import { useCart } from '@/context/CartContext';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
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
                <p className={styles.description}>{product.description}</p>
                <button className={styles.button} onClick={handleAdd}>
                    Ajouter
                </button>
            </div>
        </div>
    );
}
