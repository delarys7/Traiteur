"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
    const { count } = useCart();
    const { language, setLanguage, t } = useLanguage();
    const { user } = useAuth();
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
                        <div className={styles.actionsLeft}>
                            {/* Icons hidden on mobile */}
                            <div className={styles.desktopIcons}>
                                <a 
                                    href="https://www.instagram.com/athena_event_paris/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className={styles.iconLink}
                                    aria-label="Instagram"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                    </svg>
                                </a>
                                <button
                                    onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontFamily: 'var(--font-inter)',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        color: '#111',
                                        letterSpacing: '1px',
                                        padding: 0
                                    }}
                                >
                                    <span style={{ opacity: language === 'fr' ? 1 : 0.5 }}>FR</span>
                                    <span style={{ margin: '0 5px' }}>|</span>
                                    <span style={{ opacity: language === 'en' ? 1 : 0.5 }}>EN</span>
                                </button>
                            </div>
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
                        <Link href="/" className={styles.link}>{t('header.home')}</Link>
                        <div className={styles.navItem}>
                            <a 
                                href="#" 
                                className={styles.link} 
                                onClick={(e) => e.preventDefault()}
                                style={{ cursor: 'default' }}
                            >
                                {t('header.caterer')}
                            </a>
                            <div className={styles.dropdown}>
                                <Link href="/traiteur?category=buffet" className={styles.dropdownLink}>{t('header.dropdown.buffets')}</Link>
                                <Link href="/traiteur?category=plateau" className={styles.dropdownLink}>{t('header.dropdown.plateaux')}</Link>
                                <Link href="/traiteur?category=cocktail" className={styles.dropdownLink}>{t('header.dropdown.cocktails')}</Link>
                                <Link href="/traiteur?category=boutique" className={styles.dropdownLink}>{t('header.dropdown.boutique')}</Link>
                            </div>
                        </div>
                        <div className={styles.navItem}>
                            <a 
                                href="#" 
                                className={styles.link} 
                                onClick={(e) => e.preventDefault()}
                                style={{ cursor: 'default' }}
                            >
                                {t('header.services')}
                            </a>
                            <div className={styles.dropdown}>
                                <Link href="/prestations/chef-a-domicile" className={styles.dropdownLink}>{t('header.dropdown.chef_domicile')}</Link>
                                <Link href="/prestations/consulting" className={styles.dropdownLink}>{t('header.dropdown.consulting')}</Link>
                                <Link href="/prestations/evenements?section=grands-evenements" className={styles.dropdownLink}>{t('header.dropdown.grands_evenements')}</Link>
                                <Link href="/prestations/evenements?section=reception-entreprise" className={styles.dropdownLink}>{t('header.dropdown.reception_entreprise')}</Link>
                                <Link href="/prestations/evenements?section=reception-privee" className={styles.dropdownLink}>{t('header.dropdown.reception_privee')}</Link>
                            </div>
                        </div>
                        <div className={styles.navItem}>
                            <a 
                                href="#" 
                                className={styles.link} 
                                onClick={(e) => e.preventDefault()}
                                style={{ cursor: 'default' }}
                            >
                                {t('header.concept')}
                            </a>
                            <div className={styles.dropdown}>
                                <Link href="/a-propos/histoire" className={styles.dropdownLink}>{t('header.dropdown.histoire')}</Link>
                                <Link href="/a-propos/equipe" className={styles.dropdownLink}>{t('header.dropdown.equipe')}</Link>
                                <Link href="/a-propos/collaborations" className={styles.dropdownLink}>{t('header.dropdown.collaborations')}</Link>
                            </div>
                        </div>
                        <Link href="/contact" className={styles.link}>{t('header.contact')}</Link>
                        {isMounted && user?.type === 'administrateur' && (
                            <div className={styles.navItem}>
                                <a 
                                    href="#" 
                                    className={styles.link} 
                                    onClick={(e) => e.preventDefault()}
                                    style={{ cursor: 'default' }}
                                >
                                    {t('header.admin.data')}
                                </a>
                                <div className={styles.dropdown}>
                                    <Link href="/admin/clients" className={styles.dropdownLink}>{t('header.admin.clients')}</Link>
                                    <Link href="/admin/commandes" className={styles.dropdownLink}>{t('header.admin.orders')}</Link>
                                    <Link href="/admin/statistiques" className={styles.dropdownLink}>{t('header.admin.stats')}</Link>
                                </div>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {/* MOBILE MENU OVERLAY */}
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
                <div className={styles.mobileMenuContainer}>
                    <button 
                        className={styles.closeButton} 
                        onClick={() => setIsMenuOpen(false)}
                        aria-label={t('header.close_menu')}
                    >
                        <div className={`${styles.burgerIcon} ${styles.burgerActive}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>
                    <nav className={styles.mobileNav}>
                        <Link href="/" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>{t('header.home')}</Link>
                        
                        <div className={styles.mobileCategory}>
                            <div className={styles.mobileCategoryTitle}>{t('header.caterer')}</div>
                            <Link href="/traiteur?category=buffet" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>{t('header.dropdown.buffets')}</Link>
                            <Link href="/traiteur?category=plateau" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>{t('header.dropdown.plateaux')}</Link>
                            <Link href="/traiteur?category=cocktail" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>{t('header.dropdown.cocktails')}</Link>
                            <Link href="/traiteur?category=boutique" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>{t('header.dropdown.boutique')}</Link>
                        </div>

                        <div className={styles.mobileCategory}>
                            <div className={styles.mobileCategoryTitle}>{t('header.services')}</div>
                            <Link href="/prestations/chef-a-domicile" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>{t('header.dropdown.chef_domicile')}</Link>
                            <Link href="/prestations/consulting" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>{t('header.dropdown.consulting')}</Link>
                            <Link href="/prestations/evenements?section=grands-evenements" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>{t('header.dropdown.grands_evenements')}</Link>
                            <Link href="/prestations/evenements?section=reception-entreprise" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>{t('header.dropdown.reception_entreprise')}</Link>
                            <Link href="/prestations/evenements?section=reception-privee" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>{t('header.dropdown.reception_privee')}</Link>
                        </div>
                        
                        <div className={styles.mobileCategory}>
                            <div className={styles.mobileCategoryTitle}>{t('header.concept')}</div>
                            <Link href="/a-propos/histoire" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>{t('header.dropdown.histoire')}</Link>
                            <Link href="/a-propos/equipe" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>{t('header.dropdown.equipe')}</Link>
                            <Link href="/a-propos/collaborations" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>{t('header.dropdown.collaborations')}</Link>
                        </div>

                        <Link href="/contact" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>{t('header.contact')}</Link>
                        
                        {isMounted && user?.type === 'administrateur' && (
                            <div className={styles.mobileCategory}>
                                <div className={styles.mobileCategoryTitle}>{t('header.admin.data')}</div>
                                <Link href="/admin/clients" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>{t('header.admin.clients')}</Link>
                                <Link href="/admin/commandes" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>{t('header.admin.orders')}</Link>
                                <Link href="/admin/statistiques" className={styles.mobileSubLink} onClick={() => setIsMenuOpen(false)}>{t('header.admin.stats')}</Link>
                            </div>
                        )}
                        
                        <div className={styles.mobileDivider}></div>
                        
                        <div className={styles.mobileActions}>
                            <Link href="/compte" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                                {t('header.account')}
                            </Link>
                            <Link href="/panier" className={styles.mobileLink} onClick={() => setIsMenuOpen(false)}>
                                {t('header.cart')} ({count})
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
