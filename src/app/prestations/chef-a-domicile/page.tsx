"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';

export default function ChefADomicile() {
    const { t } = useLanguage();
    // Simple Intersection Observer for scroll animations
    const sectionRefs = useRef<(HTMLElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(styles.visible);
                }
            });
        }, { threshold: 0.1 });

        sectionRefs.current.forEach(section => {
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className={styles.container}>
            {/* 1. HERO SECTION */}
            <section className={styles.hero}>
                {/* Image can be replaced by <video> if available */}
                <Image
                    src="/images/chef_hero.jpg"
                    alt="Chef Gastronomique à domicile"
                    fill
                    className={styles.heroImage}
                    priority
                />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <p className={styles.heroSubtitle}>{t('chef_domicile.hero_subtitle')}</p>
                    <h1 className={styles.heroTitle}>{t('chef_domicile.hero_title')}</h1>
                    <div className={styles.scrollIndicator}>
                        <div className={styles.scrollLine} />
                    </div>
                </div>
            </section>

            {/* NEW: MENUS SECTION */}
            <section 
                className={`${styles.menusSection} ${styles.reveal}`}
                ref={el => { sectionRefs.current[4] = el; }}
            >
                <div className={styles.sectionHeader}>
                    <span className={styles.manifestoLabel}>{t('chef_domicile.selections')}</span>
                    <h2 className={styles.experienceTitle}>{t('chef_domicile.menus_title')}</h2>
                </div>
                <div className={styles.menusGrid}>
                    <div className={styles.menuCard}>
                        <h3>{t('chef_domicile.menu_signature')}</h3>
                        <p>{t('chef_domicile.menu_signature_desc')}</p>
                        <span className={styles.menuPrice}>{t('chef_domicile.price_from')} 95€ {t('chef_domicile.per_person')}</span>
                    </div>
                    <div className={styles.menuCard}>
                        <h3>{t('chef_domicile.menu_degustation')}</h3>
                        <p>{t('chef_domicile.menu_degustation_desc')}</p>
                        <span className={styles.menuPrice}>{t('chef_domicile.price_from')} 135€ {t('chef_domicile.per_person')}</span>
                    </div>
                    <div className={styles.menuCard}>
                        <h3>{t('chef_domicile.menu_saison')}</h3>
                        <p>{t('chef_domicile.menu_saison_desc')}</p>
                        <span className={styles.menuPrice}>{t('chef_domicile.price_from')} 85€ {t('chef_domicile.per_person')}</span>
                    </div>
                </div>
            </section>

            {/* NEW: GALLERY SECTION */}
            <section 
                className={`${styles.gallerySection} ${styles.reveal}`}
                ref={el => { sectionRefs.current[5] = el; }}
            >
                <div className={styles.sectionHeader}>
                    <span className={styles.manifestoLabel}>{t('chef_domicile.gallery_label')}</span>
                    <h2 className={styles.experienceTitle}>{t('chef_domicile.gallery_title')}</h2>
                </div>
                <div className={styles.galleryGrid}>
                    <div className={styles.galleryItem}>
                        <Image src="/images/hero.jpg" alt="Galerie 1" fill className={styles.galleryImage} />
                    </div>
                    <div className={styles.galleryItem}>
                        <Image src="/images/main_hero.jpg" alt="Galerie 2" fill className={styles.galleryImage} />
                    </div>
                    <div className={styles.galleryItem}>
                        <Image src="/images/dessert_hero.jpg" alt="Galerie 3" fill className={styles.galleryImage} />
                    </div>
                    <div className={styles.galleryItem}>
                        <Image src="/images/cocktail_hero.jpg" alt="Galerie 4" fill className={styles.galleryImage} />
                    </div>
                </div>
            </section>

            {/* 2. MANIFESTO */}
            <section 
                className={`${styles.manifesto} ${styles.reveal}`}
                ref={el => { sectionRefs.current[0] = el; }}
            >
                <span className={styles.manifestoLabel}>{t('chef_domicile.vision_label')}</span>
                <p className={styles.manifestoText}>
                    {t('chef_domicile.vision_text')} <span>{t('chef_domicile.vision_highlight')}</span> {t('chef_domicile.vision_text_2')}
                </p>
            </section>

            {/* 3. EXPERIENCE - ITEM 1 (Chef) */}
            <section 
                className={`${styles.experience} ${styles.reveal}`}
                ref={el => { sectionRefs.current[1] = el; }}
            >
                <div className={styles.experienceGrid}>
                    <div className={styles.experienceItemImage}>
                        <div className={styles.experienceImageWrapper}>
                            <Image
                                src="/images/hero.jpg"
                                alt="La cuisine d'exception"
                                fill
                                className={styles.experienceImage}
                            />
                        </div>
                    </div>
                    <div className={styles.experienceContent}>
                        <span className={styles.experienceNumber}>01</span>
                        <h2 className={styles.experienceTitle}>{t('chef_domicile.experience_01_title')}</h2>
                        <p className={styles.experienceDesc}>
                            {t('chef_domicile.experience_01_desc')}
                        </p>
                        <div className={styles.luxuryTypography}>{t('chef_domicile.experience_01_tag')}</div>
                    </div>
                </div>
            </section>

            {/* 4. ASYMMETRIC SHOWCASE */}
            <section 
                className={`${styles.showcase} ${styles.reveal}`}
                ref={el => { sectionRefs.current[2] = el; }}
            >
                <div className={styles.stackContainer}>
                    <div className={styles.stackItemMain}>
                        <Image
                            src="/images/main_hero.jpg"
                            alt="Plat signature"
                            fill
                            className={styles.experienceImage}
                        />
                    </div>
                    <div className={styles.stackItemFloating}>
                        <Image
                            src="/images/cocktail_hero.jpg"
                            alt="Détail culinaire"
                            fill
                            className={styles.experienceImage}
                        />
                    </div>
                    <div className={styles.stackItemBackground}>
                        <div className={styles.stackInfo}>
                            <h4>{t('chef_domicile.detail_title')}</h4>
                            <p>
                                {t('chef_domicile.detail_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. EXPERIENCE - ITEM 2 (Menu) */}
            <section 
                className={`${styles.experience} ${styles.reveal}`}
                ref={el => { sectionRefs.current[3] = el; }}
            >
                <div className={styles.experienceGrid} style={{ direction: 'rtl' }}>
                    <div className={styles.experienceItemImage} style={{ direction: 'ltr' }}>
                        <div className={styles.experienceImageWrapper}>
                            <Image
                                src="/images/dessert_hero.jpg"
                                alt="Menu sur-mesure"
                                fill
                                className={styles.experienceImage}
                            />
                        </div>
                    </div>
                    <div className={styles.experienceContent} style={{ direction: 'ltr' }}>
                        <span className={styles.experienceNumber}>02</span>
                        <h2 className={styles.experienceTitle}>{t('chef_domicile.experience_02_title')}</h2>
                        <p className={styles.experienceDesc}>
                            {t('chef_domicile.experience_02_desc')}
                        </p>
                        <Link href="/contact" className={styles.discoverLink} style={{ color: '#111', borderBottom: '1px solid #111', textDecoration: 'none', paddingBottom: '2px', fontSize: '1rem' }}>
                            {t('chef_domicile.experience_02_link')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* 6. QUOTE */}
            <section className={styles.quoteSection}>
                <div className={styles.quote}>
                    &quot;{t('chef_domicile.quote')}&quot;
                </div>
                <div className={styles.quoteAuthor}>{t('chef_domicile.quote_author')}</div>
            </section>

            {/* 7. CTA */}
            <section className={styles.ctaSection}>
                <h2 className={styles.ctaTitle}>{t('chef_domicile.cta_title')}</h2>
                <Link href="/contact" className={styles.ctaButton}>
                    {t('chef_domicile.cta_button')}
                </Link>
            </section>
        </div>
    );
}
