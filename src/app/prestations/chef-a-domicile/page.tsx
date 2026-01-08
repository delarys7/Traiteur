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
        }, { threshold: 0.01, rootMargin: '50px' }); // Lower threshold and add margin

        sectionRefs.current.forEach(section => {
            if (section) observer.observe(section);
        });

        // Force visibility for menus section after a short delay as fallback
        setTimeout(() => {
            if (sectionRefs.current[0] && !sectionRefs.current[0].classList.contains(styles.visible)) {
                sectionRefs.current[0].classList.add(styles.visible);
            }
        }, 500);

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

            {/* MENUS SECTION */}
            <section 
                className={`${styles.menusSection} ${styles.reveal}`}
                ref={el => { 
                    sectionRefs.current[0] = el;
                }}
            >
                <div className={styles.sectionHeader}>
                    <span className={styles.manifestoLabel}>{t('chef_domicile.selections')}</span>
                    <h2 className={styles.experienceTitle}>{t('chef_domicile.menus_title')}</h2>
                </div>
                <div className={styles.menusGrid}>
                    <div className={styles.menuCard}>
                        <h3>{t('chef_domicile.menu_signature.title')}</h3>
                        <div className={styles.menuCourses}>
                            <div className={styles.menuCourse}>
                                <span className={styles.courseLabel}>{t('chef_domicile.menu_signature.courses.entree')}</span>
                                <p className={styles.courseDesc}>{t('chef_domicile.menu_signature.courses.entree_desc')}</p>
                            </div>
                            <div className={styles.menuCourse}>
                                <span className={styles.courseLabel}>{t('chef_domicile.menu_signature.courses.plat1')}</span>
                                <p className={styles.courseDesc}>{t('chef_domicile.menu_signature.courses.plat1_desc')}</p>
                            </div>
                            <div className={styles.menuCourse}>
                                <span className={styles.courseLabel}>{t('chef_domicile.menu_signature.courses.plat2')}</span>
                                <p className={styles.courseDesc}>{t('chef_domicile.menu_signature.courses.plat2_desc')}</p>
                            </div>
                            <div className={styles.menuCourse}>
                                <span className={styles.courseLabel}>{t('chef_domicile.menu_signature.courses.dessert')}</span>
                                <p className={styles.courseDesc}>{t('chef_domicile.menu_signature.courses.dessert_desc')}</p>
                            </div>
                        </div>
                        <span className={styles.menuPrice}>{t('chef_domicile.menu_signature.price')}</span>
                    </div>
                    <div className={styles.menuCard}>
                        <h3>{t('chef_domicile.menu_degustation.title')}</h3>
                        <div className={styles.menuCourses}>
                            <div className={styles.menuCourse}>
                                <span className={styles.courseLabel}>{t('chef_domicile.menu_degustation.courses.entree')}</span>
                                <p className={styles.courseDesc}>{t('chef_domicile.menu_degustation.courses.entree_desc')}</p>
                            </div>
                            <div className={styles.menuCourse}>
                                <span className={styles.courseLabel}>{t('chef_domicile.menu_degustation.courses.plat1')}</span>
                                <p className={styles.courseDesc}>{t('chef_domicile.menu_degustation.courses.plat1_desc')}</p>
                            </div>
                            <div className={styles.menuCourse}>
                                <span className={styles.courseLabel}>{t('chef_domicile.menu_degustation.courses.plat2')}</span>
                                <p className={styles.courseDesc}>{t('chef_domicile.menu_degustation.courses.plat2_desc')}</p>
                            </div>
                            <div className={styles.menuCourse}>
                                <span className={styles.courseLabel}>{t('chef_domicile.menu_degustation.courses.intermezzo')}</span>
                                <p className={styles.courseDesc}>{t('chef_domicile.menu_degustation.courses.intermezzo_desc')}</p>
                            </div>
                            <div className={styles.menuCourse}>
                                <span className={styles.courseLabel}>{t('chef_domicile.menu_degustation.courses.dessert')}</span>
                                <p className={styles.courseDesc}>{t('chef_domicile.menu_degustation.courses.dessert_desc')}</p>
                            </div>
                            <div className={styles.menuCourse}>
                                <span className={styles.courseLabel}>{t('chef_domicile.menu_degustation.courses.mignardises')}</span>
                                <p className={styles.courseDesc}>{t('chef_domicile.menu_degustation.courses.mignardises_desc')}</p>
                            </div>
                        </div>
                        <span className={styles.menuPrice}>{t('chef_domicile.menu_degustation.price')}</span>
                    </div>
                    <div className={styles.menuCard}>
                        <h3>{t('chef_domicile.menu_saison.title')}</h3>
                        <div className={styles.menuCourses}>
                            <div className={styles.menuCourse}>
                                <span className={styles.courseLabel}>{t('chef_domicile.menu_saison.courses.entree')}</span>
                                <p className={styles.courseDesc}>{t('chef_domicile.menu_saison.courses.entree_desc')}</p>
                            </div>
                            <div className={styles.menuCourse}>
                                <span className={styles.courseLabel}>{t('chef_domicile.menu_saison.courses.plat1')}</span>
                                <p className={styles.courseDesc}>{t('chef_domicile.menu_saison.courses.plat1_desc')}</p>
                            </div>
                            <div className={styles.menuCourse}>
                                <span className={styles.courseLabel}>{t('chef_domicile.menu_saison.courses.dessert')}</span>
                                <p className={styles.courseDesc}>{t('chef_domicile.menu_saison.courses.dessert_desc')}</p>
                            </div>
                        </div>
                        <span className={styles.menuPrice}>{t('chef_domicile.menu_saison.price')}</span>
                    </div>
                </div>
            </section>

            {/* GALLERY SECTION - MARQUEE */}
            <section 
                className={`${styles.gallerySection} ${styles.reveal}`}
                ref={el => { sectionRefs.current[1] = el; }}
            >
                {/* First row - scrolls left to right */}
                <div className={styles.galleryMarquee}>
                    <div className={styles.marqueeContent}>
                        {[
                            '/images/hero.jpg',
                            '/images/main_hero.jpg',
                            '/images/dessert_hero.jpg',
                            '/images/cocktail_hero.jpg',
                            '/images/hero.jpg',
                            '/images/main_hero.jpg',
                            '/images/dessert_hero.jpg',
                            '/images/cocktail_hero.jpg'
                        ].map((src, i) => (
                            <div key={`gallery-1-${i}`} className={styles.galleryItem}>
                                <Image src={src} alt={`Galerie ${i + 1}`} width={400} height={300} className={styles.galleryImage} />
                            </div>
                        ))}
                        {[
                            '/images/hero.jpg',
                            '/images/main_hero.jpg',
                            '/images/dessert_hero.jpg',
                            '/images/cocktail_hero.jpg',
                            '/images/hero.jpg',
                            '/images/main_hero.jpg',
                            '/images/dessert_hero.jpg',
                            '/images/cocktail_hero.jpg'
                        ].map((src, i) => (
                            <div key={`gallery-1-dup-${i}`} className={styles.galleryItem}>
                                <Image src={src} alt={`Galerie ${i + 1}`} width={400} height={300} className={styles.galleryImage} />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Second row - scrolls right to left */}
                <div className={styles.galleryMarquee}>
                    <div className={`${styles.marqueeContent} ${styles.marqueeContentReverse}`}>
                        {[
                            '/images/cocktail_hero.jpg',
                            '/images/dessert_hero.jpg',
                            '/images/main_hero.jpg',
                            '/images/hero.jpg',
                            '/images/cocktail_hero.jpg',
                            '/images/dessert_hero.jpg',
                            '/images/main_hero.jpg',
                            '/images/hero.jpg'
                        ].map((src, i) => (
                            <div key={`gallery-2-${i}`} className={styles.galleryItem}>
                                <Image src={src} alt={`Galerie ${i + 1}`} width={400} height={300} className={styles.galleryImage} />
                            </div>
                        ))}
                        {[
                            '/images/cocktail_hero.jpg',
                            '/images/dessert_hero.jpg',
                            '/images/main_hero.jpg',
                            '/images/hero.jpg',
                            '/images/cocktail_hero.jpg',
                            '/images/dessert_hero.jpg',
                            '/images/main_hero.jpg',
                            '/images/hero.jpg'
                        ].map((src, i) => (
                            <div key={`gallery-2-dup-${i}`} className={styles.galleryItem}>
                                <Image src={src} alt={`Galerie ${i + 1}`} width={400} height={300} className={styles.galleryImage} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MANIFESTO / VISION */}
            <section 
                className={`${styles.manifesto} ${styles.reveal}`}
                ref={el => { sectionRefs.current[2] = el; }}
            >
                <span className={styles.manifestoLabel}>{t('chef_domicile.vision_label')}</span>
                <p className={styles.manifestoText}>
                    {t('chef_domicile.vision_text')} <span>{t('chef_domicile.vision_highlight')}</span> {t('chef_domicile.vision_text_2')}
                </p>
            </section>

            {/* QUOTE */}
            <section className={styles.quoteSection}>
                <div className={styles.quote}>
                    &quot;{t('chef_domicile.quote')}&quot;
                </div>
                <div className={styles.quoteAuthor}>{t('chef_domicile.quote_author')}</div>
            </section>

            {/* CTA */}
            <section className={styles.ctaSection}>
                <h2 className={styles.ctaTitle}>{t('chef_domicile.cta_title')}</h2>
                <Link href="/contact?motif=prestation-domicile" className={styles.ctaButton}>
                    {t('chef_domicile.cta_button')}
                </Link>
            </section>
        </div>
    );
}
