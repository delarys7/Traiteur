"use client";

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';

export default function Histoire() {
    const { t } = useLanguage();
    const revealRefs = useRef<(HTMLElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(styles.visible);
                }
            });
        }, { threshold: 0.1 });

        revealRefs.current.forEach(el => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className={styles.container}>
            {/* HERO HISTORY */}
            <section className={styles.hero}>
                <Image
                    src="/images/hero_v2.jpg"
                    alt="Heritage Athéna Event"
                    fill
                    className={styles.heroImage}
                    priority
                />
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <p className={styles.label}>{t('histoire.label')}</p>
                    <h1 className={styles.title}>{t('histoire.title')}</h1>
                </div>
            </section>

            {/* GENESIS */}
            <section 
                className={`${styles.genesis} ${styles.reveal}`}
                ref={el => { revealRefs.current[0] = el; }}
            >
                <div className={styles.genesisContent}>
                    <h2 className={styles.sectionTitle}>{t('histoire.genesis_title')}</h2>
                    <p className={styles.text}>
                        {t('histoire.genesis_text')} <span>2015</span> {t('histoire.genesis_text_2')}
                    </p>
                </div>
                <div className={styles.sideImage}>
                    <Image
                        src="/images/chef_hero.jpg"
                        alt="Artisanat culinaire"
                        fill
                        className={styles.coverImage}
                    />
                </div>
            </section>

            {/* VISION CARDS (Asymmetric) */}
            <section className={styles.vision}>
                <div className={styles.visionGrid}>
                    <div 
                        className={`${styles.visionCard} ${styles.reveal}`}
                        ref={el => { revealRefs.current[1] = el; }}
                    >
                        <h3>{t('histoire.inspiration_title')}</h3>
                        <p>
                            {t('histoire.inspiration_text')}
                        </p>
                    </div>
                    <div 
                        className={`${styles.visionCard} ${styles.reveal} ${styles.offset}`}
                        ref={el => { revealRefs.current[2] = el; }}
                    >
                        <h3>{t('histoire.engagement_title')}</h3>
                        <p>
                            {t('histoire.engagement_text')}
                        </p>
                    </div>
                </div>
            </section>

            {/* PHILOSOPHY SECTION */}
            <section 
                className={`${styles.philosophy} ${styles.reveal}`}
                ref={el => { revealRefs.current[3] = el; }}
            >
                <div className={styles.philosophyOverlay}>
                    <h2 className={styles.philoTitle}>&quot;{t('histoire.philosophy_quote')}&quot;</h2>
                    <p className={styles.philoDesc}>
                        {t('histoire.philosophy_text')}
                    </p>
                </div>
            </section>
        </div>
    );
}
