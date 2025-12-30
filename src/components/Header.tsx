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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const lastScrollYRef = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
        setIsMounted(true);
        const updateHeader = () => {
            const currentScrollY = window.scrollY;
            
            // 1. Shadow logic
            setIsScrolled(currentScrollY > 20);

            // 2. Smart Sticky logic (Hide logo on scroll down, show on scroll up)
            // Note: This logic will be ignored on mobile via CSS (top: 0) or offset adjustment
            if (currentScrollY < 50) {
                setIsLogoHidden(false);
            } else {
                const delta = currentScrollY - lastScrollYRef.current;
                
                if (delta > 5) {
                    setIsLogoHidden(true);
                } else if (delta < -5) {
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

    // Close menu when resizing above 700px
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 700) {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!isMounted) return <div style={{ height: '165px' }} />;

    return (
        <>
            <header className={`
                ${styles.header} 
                ${isScrolled ? styles.headerScrolled : ''} 
                ${isLogoHidden ? styles.headerHidden : ''}
                ${isMenuOpen ? styles.headerMenuOpen : ''}
            `}>
                <div className={styles.container}>

                    {/* TOP ROW: Logo & Icons */}
                    <div className={styles.topRow}>
                        <div className={styles.spacerLeft}>
                            {/* Burger Menu for mobile (Left aligned or kept as spacer) */}
                        </div>
                        
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
                            {/* Icons hidden on mobile */}
                            <div className={styles.desktopIcons}>
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

                            {/* Burger Icon visible on mobile */}
                            <button 
                                className={styles.menuButton} 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Menu"
                            >
                                <div className={`${styles.burgerIcon} ${isMenuOpen ? styles.burgerActive : ''}`}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* BOTTOM ROW: Navigation (Hidden on mobile) */}
                    <nav className={styles.bottomRow}>
                        <Link href="/" className={styles.link}>Accueil</Link>
                        <div className={styles.navItem}>
                            <a 
                                href="#" 
                                className={styles.link} 
                                onClick={(e) => e.preventDefault()}
                                style={{ cursor: 'default' }}
                            >
                                Traiteur
                            </a>
                            <div className={styles.dropdown}>
                                <Link href="/traiteur?category=buffet" className={styles.dropdownLink}>Buffets</Link>
                                <Link href="/traiteur?category=plateau" className={styles.dropdownLink}>Plateaux repas</Link>
                                <Link href="/traiteur?category=cocktail" className={styles.dropdownLink}>Pièces cocktails</Link>
                            </div>
                        </div>
                        <Link href="/chef-a-domicile" className={styles.link}>Chef à domicile</Link>
                        <Link href="/consultant" className={styles.link}>Consultant</Link>
                        <div className={styles.navItem}>
                            <a 
                                href="#" 
                                className={styles.link} 
                                onClick={(e) => e.preventDefault()}
                                style={{ cursor: 'default' }}
                            >
                                À propos
                            </a>
                            <div className={styles.dropdown}>
                                <Link href="/a-propos/histoire" className={styles.dropdownLink}>Notre Histoire</Link>
                                <Link href="/a-propos/equipe" className={styles.dropdownLink}>L&apos;Équipe</Link>
                                <Link href="/a-propos/collaborations" className={styles.dropdownLink}>Collaborations</Link>
                            </div>
                        </div>
                    </nav>
                </div>
            </header>

            {/* MOBILE MENU OVERLAY */}
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
                <div className={styles.mobileMenuContainer}>
                    <button 
                        className={styles.closeButton} 
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Fermer le menu"
                    >
                        <div className={`${styles.burgerIcon} ${styles.burgerActive}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>
                    <nav className={styles.mobileNav}>
                        <Link href="/" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Accueil</Link>
                        
                        <div className={styles.mobileCategory}>
                            <div className={styles.mobileCategoryTitle}>Traiteur</div>
                            <Link href="/traiteur?category=buffet" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>Buffets</Link>
                            <Link href="/traiteur?category=plateau" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>Plateaux repas</Link>
                            <Link href="/traiteur?category=cocktail" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>Pièces cocktails</Link>
                        </div>

                        <Link href="/chef-a-domicile" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Chef à domicile</Link>
                        <Link href="/consultant" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>Consultant</Link>
                        
                        <div className={styles.mobileCategory}>
                            <div className={styles.mobileCategoryTitle}>À propos</div>
                            <Link href="/a-propos/histoire" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>Notre Histoire</Link>
                            <Link href="/a-propos/equipe" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>L&apos;Équipe</Link>
                            <Link href="/a-propos/collaborations" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>Collaborations</Link>
                        </div>
                        
                        <div className={styles.mobileDivider}></div>
                        
                        <div className={styles.mobileActions}>
                            <Link href="/compte" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                                Mon Compte
                            </Link>
                            <Link href="/panier" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                                Mon Panier ({count})
                            </Link>
                        </div>
                    </nav>
                </div>
            </div>
            
            {/* OVERLAY BACKGROUND */}
            {isMenuOpen && <div className={styles.menuOverlay} onClick={() => setIsMenuOpen(false)} />}
        </>
    );
}
