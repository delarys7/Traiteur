"use client";

import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';
import { useCart } from '@/context/CartContext';

export default function Header() {
    const { count } = useCart();

    return (
        <header className={styles.header}>
            <div className={styles.container}>

                {/* TOP ROW: Logo & Icons */}
                <div className={styles.topRow}>
                    {/* Left Spacer to balance grid */}
                    <div className={styles.spacerLeft}></div>

                    {/* Center: Logo */}
                    <div className={styles.logoCenter}>
                        <Link href="/">
                            <Image
                                src="/images/Logo-NoBG-rogné.png"
                                alt="Athéna Event Paris"
                                width={300}
                                height={120}
                                className={styles.logoImage}
                                priority
                            />
                        </Link>
                    </div>

                    {/* Right: Actions */}
                    <div className={styles.actionsRight}>
                        <Link href="/compte" className={styles.iconLink} aria-label="Mon Compte">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </Link>
                        <Link href="/panier" className={styles.iconLink} aria-label="Mon Panier">
                            <div className={styles.cartIconWrapper}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="8" cy="21" r="1" />
                                    <circle cx="19" cy="21" r="1" />
                                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                                </svg>
                                {count > 0 && <span className={styles.cartCount}>{count}</span>}
                            </div>
                        </Link>
                    </div>
                </div>

                {/* BOTTOM ROW: Navigation */}
                <nav className={styles.bottomRow}>
                    <Link href="/" className={styles.link}>Accueil</Link>
                    <div className={styles.navItem}>
                        <Link href="/traiteur" className={styles.link}>Traiteur</Link>
                        <div className={styles.dropdown}>
                            <Link href="/traiteur?category=buffet" className={styles.dropdownLink}>Buffets</Link>
                            <Link href="/traiteur?category=plateau" className={styles.dropdownLink}>Plateaux repas</Link>
                            <Link href="/traiteur?category=cocktail" className={styles.dropdownLink}>Pièces cocktails</Link>
                        </div>
                    </div>
                    <Link href="/chef-a-domicile" className={styles.link}>Chef à domicile</Link>
                    <Link href="/consultant" className={styles.link}>Consultant</Link>
                    <Link href="/a-propos" className={styles.link}>À propos</Link>
                </nav>

            </div>
        </header>
    );
}
