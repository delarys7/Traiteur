"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import styles from './GastronomySection.module.css';

export default function GastronomySection() {
    const { t } = useLanguage();
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [imagesVisible, setImagesVisible] = useState(false);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.2
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            });
        }, observerOptions);

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setImagesVisible(true);
                }
            });
        }, { threshold: 0.1 });

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
            const mosaic = sectionRef.current.querySelector(`.${styles.mosaicContainer}`);
            if (mosaic) imageObserver.observe(mosaic);
        }

        return () => {
            observer.disconnect();
            imageObserver.disconnect();
        };
    }, []);

    return (
        <section className={styles.section} ref={sectionRef}>
            <div className={`${styles.intro} ${isVisible ? styles.visible : ''}`}>
                <div className={`${styles.lineRow} ${styles.lineRowLeft}`}>
                    <div className={styles.line} />
                    <span className={`${styles.text} ${styles.textHaute}`}>Haute</span>
                    <div className={styles.spacer} />
                </div>
                <div className={`${styles.lineRow} ${styles.lineRowRight}`}>
                    <div className={styles.spacer} />
                    <span className={`${styles.text} ${styles.textGastronomy}`}>Gastronomie</span>
                    <div className={styles.line} />
                </div>
            </div>

            <div className={styles.mosaicContainer}>
                <div className={`${styles.imageBox} ${styles.mainImage} ${imagesVisible ? styles.imageBoxVisible : ''}`}>
                    <Image 
                        src="/images/chef_hero.jpg" 
                        alt="Art de la table" 
                        fill 
                        className={styles.img}
                        sizes="(max-width: 900px) 100vw, 50vw"
                    />
                </div>
                <div className={`${styles.imageBox} ${styles.sideImageLeft} ${imagesVisible ? styles.imageBoxVisible : ''}`} style={{ transitionDelay: '0.3s' }}>
                    <Image 
                        src="/images/gastronomy_side_1.png" 
                        alt="Poisson d'exception" 
                        fill 
                        className={styles.img}
                        sizes="(max-width: 900px) 100vw, 30vw"
                    />
                </div>
                <div className={`${styles.imageBox} ${styles.sideImageRight} ${imagesVisible ? styles.imageBoxVisible : ''}`} style={{ transitionDelay: '0.6s' }}>
                    <Image 
                        src="/images/gastronomy_side_2.png" 
                        alt="Dessert signature" 
                        fill 
                        className={styles.img}
                        sizes="(max-width: 900px) 100vw, 30vw"
                    />
                </div>
            </div>

            <div className={styles.descriptionBox}>
                <p className={`${styles.descText} ${imagesVisible ? styles.descVisible : ''}`}>
                    {t('home.gastronomy_text')}
                </p>
            </div>
        </section>
    );
}
