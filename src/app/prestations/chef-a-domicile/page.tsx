"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function ChefADomicile() {
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
                    <p className={styles.heroSubtitle}>L&apos;Intimité du Goût</p>
                    <h1 className={styles.heroTitle}>L&apos;Excellence s&apos;invite dans votre Demeure</h1>
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
                    <span className={styles.manifestoLabel}>Sélections du Chef</span>
                    <h2 className={styles.experienceTitle}>Menus déjà préparés</h2>
                </div>
                <div className={styles.menusGrid}>
                    <div className={styles.menuCard}>
                        <h3>Menu Signature</h3>
                        <p>Une immersion dans l&apos;univers créatif du Chef.</p>
                        <span className={styles.menuPrice}>À partir de 95€ / pers</span>
                    </div>
                    <div className={styles.menuCard}>
                        <h3>Menu Dégustation</h3>
                        <p>7 étapes gastronomiques pour les gourmets exigeants.</p>
                        <span className={styles.menuPrice}>À partir de 135€ / pers</span>
                    </div>
                    <div className={styles.menuCard}>
                        <h3>Menu Saison</h3>
                        <p>Le meilleur du terroir à l&apos;instant présent.</p>
                        <span className={styles.menuPrice}>À partir de 85€ / pers</span>
                    </div>
                </div>
            </section>

            {/* NEW: GALLERY SECTION */}
            <section 
                className={`${styles.gallerySection} ${styles.reveal}`}
                ref={el => { sectionRefs.current[5] = el; }}
            >
                <div className={styles.sectionHeader}>
                    <span className={styles.manifestoLabel}>Immersion</span>
                    <h2 className={styles.experienceTitle}>Galerie Photos</h2>
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
                <span className={styles.manifestoLabel}>Notre Vision</span>
                <p className={styles.manifestoText}>
                    Plus qu&apos;un dîner, nous orchestrons une <span>expérience sensorielle privée</span>. 
                    Nous transformons votre salle à manger en une table de haut prestige, 
                    où chaque geste du Chef est une promesse d&apos;émotion et chaque plat un 
                    récit de terroir et de modernité.
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
                        <h2 className={styles.experienceTitle}>La Maestria en Cuisine</h2>
                        <p className={styles.experienceDesc}>
                            Nos chefs, issus de maisons étoilées, investissent vos pianos avec la rigueur 
                            et la passion des plus grandes cuisines. De la sélection rigoureuse des 
                            produits de saison au dressage minute devant vos convives, l&apos;art culinaire 
                            s&apos;exprime sans compromis.
                        </p>
                        <div className={styles.luxuryTypography}>Discrétion & Rigueur</div>
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
                            <h4>L&apos;Art du Détail</h4>
                            <p>
                                Chaque pièce est pensée pour sublimer l&apos;instant. 
                                La porcelaine fine, le cristal et l&apos;argenterie 
                                complètent la symphonie des saveurs.
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
                        <h2 className={styles.experienceTitle}>Une Partition Unique</h2>
                        <p className={styles.experienceDesc}>
                            Votre menu est une création exclusive. Après un échange approfondi, 
                            notre Chef imagine une partition culinaire qui reflète vos goûts, 
                            vos envies et l&apos;esprit de votre réception. Une haute couture 
                            gastronomique pour des souvenirs impérissables.
                        </p>
                        <Link href="/contact" className={styles.discoverLink} style={{ color: '#111', borderBottom: '1px solid #111', textDecoration: 'none', paddingBottom: '2px', fontSize: '1rem' }}>
                            Concevoir mon Menu
                        </Link>
                    </div>
                </div>
            </section>

            {/* 6. QUOTE */}
            <section className={styles.quoteSection}>
                <div className={styles.quote}>
                    &quot;La gastronomie est l&apos;art d&apos;utiliser la nourriture pour créer du bonheur.&quot;
                </div>
                <div className={styles.quoteAuthor}>— Théodore Monnot, Chef Exécutif</div>
            </section>

            {/* 7. CTA */}
            <section className={styles.ctaSection}>
                <h2 className={styles.ctaTitle}>Portez l&apos;Excellence à votre Table</h2>
                <Link href="/contact" className={styles.ctaButton}>
                    Réserver une Consultation
                </Link>
            </section>
        </div>
    );
}
