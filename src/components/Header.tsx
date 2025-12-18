"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';
import { useCart } from '@/context/CartContext';

export default function Header() {
    const { count } = useCart();
    const [isLogoHidden, setIsLogoHidden] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const lastScrollYRef = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
        setIsMounted(true);
        const updateHeader = () => {
            const currentScrollY = window.scrollY;
            
            // 1. Shadow logic
            setIsScrolled(currentScrollY > 20);

            // 2. Smart Sticky logic (Hide logo on scroll down, show on scroll up)
            if (currentScrollY < 50) {
                setIsLogoHidden(false);
            } else {
                const delta = currentScrollY - lastScrollYRef.current;
                
                if (delta > 20) {
                    // Scrolling down significantly
                    setIsLogoHidden(true);
                } else if (delta < -10) {
                    // Scrolling up significantly
                    setIsLogoHidden(false);
                }
            }
            
            lastScrollYRef.current = currentScrollY;
            ticking.current = false;
        };

        const onScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(updateHeader);
                ticking.current = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    if (!isMounted) return <div style={{ height: '195px' }} />;

    return (
        <header className={`
            ${styles.header} 
            ${isScrolled ? styles.headerScrolled : ''} 
            ${isLogoHidden ? styles.headerHidden : ''}
        `}>
            <div className={styles.container}>

                {/* TOP ROW: Logo & Icons (138px height) */}
                <div className={styles.topRow}>
                    <div className={styles.spacerLeft}></div>
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

                {/* BOTTOM ROW: Navigation (55px approximate height) */}
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
