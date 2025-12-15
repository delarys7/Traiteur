"use client";

import Link from 'next/link';
import styles from './Header.module.css';
import { useCart } from '@/context/CartContext';

export default function Header() {
    const { count } = useCart();

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <Link href="/">TRAITEUR</Link>
                </div>
                <nav className={styles.nav}>
                    <Link href="/" className={styles.link}>Accueil</Link>
                    <Link href="/traiteur" className={styles.link}>Traiteur</Link>
                    <Link href="/chef-a-domicile" className={styles.link}>Chef à domicile</Link>
                    <Link href="/consultant" className={styles.link}>Consultant</Link>
                    <Link href="/a-propos" className={styles.link}>À propos</Link>
                </nav>
                <div className={styles.actions}>
                    <Link href="/panier" className={styles.iconLink}>
                        Panier {count > 0 && `(${count})`}
                    </Link>
                    <Link href="/compte" className={styles.iconLink}>Compte</Link>
                </div>
            </div>
        </header>
    );
}
