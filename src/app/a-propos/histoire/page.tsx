"use client";

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function Histoire() {
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
                    <p className={styles.label}>Héritage & Vision</p>
                    <h1 className={styles.title}>Une Histoire d&apos;Émotion</h1>
                </div>
            </section>

            {/* GENESIS */}
            <section 
                className={`${styles.genesis} ${styles.reveal}`}
                ref={el => { revealRefs.current[0] = el; }}
            >
                <div className={styles.genesisContent}>
                    <h2 className={styles.sectionTitle}>La Naissance d&apos;un Idéal</h2>
                    <p className={styles.text}>
                        Fondée en <span>2015</span> au cœur de Paris, Athéna Event est née d&apos;une ambition simple mais audacieuse : 
                        redéfinir l&apos;art de recevoir par le prisme de la Haute Gastronomie et de l&apos;élégance intemporelle. 
                        Ce qui n&apos;était au départ qu&apos;une passion partagée entre deux gastronomes est devenu aujourd&apos;hui une signature 
                        reconnue dans l&apos;univers du luxe.
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
                        <h3>L&apos;Inspiration</h3>
                        <p>
                            Nous puisons notre essence dans les classiques de la cuisine française, 
                            tout en y insufflant la modernité d&apos;un design épuré. Chaque plat est une 
                            toile où s&apos;expriment les saisons.
                        </p>
                    </div>
                    <div 
                        className={`${styles.visionCard} ${styles.reveal} ${styles.offset}`}
                        ref={el => { revealRefs.current[2] = el; }}
                    >
                        <h3>L&apos;Engagement</h3>
                        <p>
                            La perfection n&apos;est pas un but, c&apos;est un standard. Nous travaillons 
                            exclusivement avec des producteurs locaux dont nous partageons les valeurs 
                            d&apos;excellence et de respect du vivant.
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
                    <h2 className={styles.philoTitle}>&quot;Recevoir est un don de soi.&quot;</h2>
                    <p className={styles.philoDesc}>
                        Pour nous, la gastronomie ne se limite pas au goût. C&apos;est un dialogue, 
                        une orchestration où le décor, le service et l&apos;assiette fusionnent pour 
                        créer un instant hors du temps. Notre vision est celle d&apos;un luxe discret, 
                        profondément humain et sincère.
                    </p>
                </div>
            </section>
        </div>
    );
}
