"use client";

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';

// Images pour chaque section
const grandsEvenementsImages = [
    '/images/Grands événements/Indoor.png',
    '/images/Grands événements/Jardin.png',
    '/images/Grands événements/Jardin2.png'
];

const receptionEntrepriseImages = [
    '/images/Réceptions d\'enreprise/seminaire.png',
    '/images/Réceptions d\'enreprise/cocktail.png',
    '/images/Réceptions d\'enreprise/lancement_produit.png'
];

const receptionPriveeImages = [
    '/images/Réceptions privées/Mariage.png',
    '/images/Réceptions privées/Mariage2.png',
    '/images/Réceptions privées/Exposition_art.png'
];

function EvenementsContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const grandsEvenementsRef = useRef<HTMLElement>(null);
    const receptionEntrepriseRef = useRef<HTMLElement>(null);
    const receptionPriveeRef = useRef<HTMLElement>(null);

    // États pour les carousels
    const [grandsEvenementsIndex, setGrandsEvenementsIndex] = useState(0);
    const [receptionEntrepriseIndex, setReceptionEntrepriseIndex] = useState(0);
    const [receptionPriveeIndex, setReceptionPriveeIndex] = useState(0);

    // Auto-rotation des carousels
    useEffect(() => {
        const interval1 = setInterval(() => {
            setGrandsEvenementsIndex((prev) => (prev + 1) % grandsEvenementsImages.length);
        }, 4000);

        const interval2 = setInterval(() => {
            setReceptionEntrepriseIndex((prev) => (prev + 1) % receptionEntrepriseImages.length);
        }, 4000);

        const interval3 = setInterval(() => {
            setReceptionPriveeIndex((prev) => (prev + 1) % receptionPriveeImages.length);
        }, 4000);

        return () => {
            clearInterval(interval1);
            clearInterval(interval2);
            clearInterval(interval3);
        };
    }, []);

    // Scroll vers la section demandée
    useEffect(() => {
        const section = searchParams.get('section');
        if (section) {
            setTimeout(() => {
                let targetRef: HTMLElement | null = null;
                if (section === 'grands-evenements') {
                    targetRef = grandsEvenementsRef.current;
                } else if (section === 'reception-entreprise') {
                    targetRef = receptionEntrepriseRef.current;
                } else if (section === 'reception-privee') {
                    targetRef = receptionPriveeRef.current;
                }
                
                if (targetRef) {
                    targetRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, [searchParams]);

    // Fonctions de navigation pour les carousels
    const goToPrevious = (section: 'grands' | 'entreprise' | 'privee') => {
        if (section === 'grands') {
            setGrandsEvenementsIndex((prev) => (prev - 1 + grandsEvenementsImages.length) % grandsEvenementsImages.length);
        } else if (section === 'entreprise') {
            setReceptionEntrepriseIndex((prev) => (prev - 1 + receptionEntrepriseImages.length) % receptionEntrepriseImages.length);
        } else {
            setReceptionPriveeIndex((prev) => (prev - 1 + receptionPriveeImages.length) % receptionPriveeImages.length);
        }
    };

    const goToNext = (section: 'grands' | 'entreprise' | 'privee') => {
        if (section === 'grands') {
            setGrandsEvenementsIndex((prev) => (prev + 1) % grandsEvenementsImages.length);
        } else if (section === 'entreprise') {
            setReceptionEntrepriseIndex((prev) => (prev + 1) % receptionEntrepriseImages.length);
        } else {
            setReceptionPriveeIndex((prev) => (prev + 1) % receptionPriveeImages.length);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <div className={styles.headerSection}>
                <h1 className={styles.headerTitle}>{t('evenements.header.title')}</h1>
                <div className={styles.headerSeparator}></div>
                <p className={styles.headerDescription}>{t('evenements.header.description')}</p>
            </div>

            {/* Section Grands événements - Texte à gauche */}
            <section 
                id="grands-evenements" 
                ref={grandsEvenementsRef} 
                className={`${styles.section} ${styles.sectionLeft}`}
            >
                <div className={styles.galleryContainer}>
                    <div className={styles.carousel}>
                        {grandsEvenementsImages.map((src, index) => (
                            <div
                                key={index}
                                className={`${styles.carouselSlide} ${
                                    index === grandsEvenementsIndex ? styles.active : ''
                                }`}
                            >
                                <Image
                                    src={src}
                                    alt={`Grands événements ${index + 1}`}
                                    fill
                                    className={styles.galleryImage}
                                    priority={index === 0}
                                    unoptimized
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`${styles.textOverlay} ${styles.textLeft}`}>
                    <h1 className={styles.title}>{t('evenements.grands_evenements.title')}</h1>
                    <div className={styles.descriptionWrapper}>
                        <div className={styles.descriptionLine}></div>
                        <p className={styles.description}>
                            {t('evenements.grands_evenements.description')}
                        </p>
                        <div className={styles.descriptionLine}></div>
                    </div>
                    <div className={styles.carouselControls}>
                        <button
                            className={styles.carouselArrow}
                            onClick={() => goToPrevious('grands')}
                            aria-label="Image précédente"
                        >
                            ‹
                        </button>
                        <div className={styles.carouselIndicators}>
                            {grandsEvenementsImages.map((_, index) => (
                                <button
                                    key={index}
                                    className={`${styles.indicator} ${
                                        index === grandsEvenementsIndex ? styles.active : ''
                                    }`}
                                    onClick={() => setGrandsEvenementsIndex(index)}
                                    aria-label={`Image ${index + 1}`}
                                />
                            ))}
                        </div>
                        <button
                            className={styles.carouselArrow}
                            onClick={() => goToNext('grands')}
                            aria-label="Image suivante"
                        >
                            ›
                        </button>
                    </div>
                </div>
            </section>

            {/* Section Réception d'entreprise - Texte à droite */}
            <section 
                id="reception-entreprise" 
                ref={receptionEntrepriseRef} 
                className={`${styles.section} ${styles.sectionRight}`}
            >
                <div className={styles.galleryContainer}>
                    <div className={styles.carousel}>
                        {receptionEntrepriseImages.map((src, index) => (
                            <div
                                key={index}
                                className={`${styles.carouselSlide} ${
                                    index === receptionEntrepriseIndex ? styles.active : ''
                                }`}
                            >
                                <Image
                                    src={src}
                                    alt={`Réception d'entreprise ${index + 1}`}
                                    fill
                                    className={styles.galleryImage}
                                    priority={index === 0}
                                    unoptimized
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`${styles.textOverlay} ${styles.textRight}`}>
                    <h1 className={styles.title}>{t('evenements.reception_entreprise.title')}</h1>
                    <div className={styles.descriptionWrapper}>
                        <div className={styles.descriptionLine}></div>
                        <p className={styles.description}>
                            {t('evenements.reception_entreprise.description')}
                        </p>
                        <div className={styles.descriptionLine}></div>
                    </div>
                    <div className={styles.carouselControls}>
                        <button
                            className={styles.carouselArrow}
                            onClick={() => goToPrevious('entreprise')}
                            aria-label="Image précédente"
                        >
                            ‹
                        </button>
                        <div className={styles.carouselIndicators}>
                            {receptionEntrepriseImages.map((_, index) => (
                                <button
                                    key={index}
                                    className={`${styles.indicator} ${
                                        index === receptionEntrepriseIndex ? styles.active : ''
                                    }`}
                                    onClick={() => setReceptionEntrepriseIndex(index)}
                                    aria-label={`Image ${index + 1}`}
                                />
                            ))}
                        </div>
                        <button
                            className={styles.carouselArrow}
                            onClick={() => goToNext('entreprise')}
                            aria-label="Image suivante"
                        >
                            ›
                        </button>
                    </div>
                </div>
            </section>

            {/* Section Réception privée - Texte à gauche */}
            <section 
                id="reception-privee" 
                ref={receptionPriveeRef} 
                className={`${styles.section} ${styles.sectionLeft}`}
            >
                <div className={styles.galleryContainer}>
                    <div className={styles.carousel}>
                        {receptionPriveeImages.map((src, index) => (
                            <div
                                key={index}
                                className={`${styles.carouselSlide} ${
                                    index === receptionPriveeIndex ? styles.active : ''
                                }`}
                            >
                                <Image
                                    src={src}
                                    alt={`Réception privée ${index + 1}`}
                                    fill
                                    className={styles.galleryImage}
                                    priority={index === 0}
                                    unoptimized
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`${styles.textOverlay} ${styles.textLeft}`}>
                    <h1 className={styles.title}>{t('evenements.reception_privee.title')}</h1>
                    <div className={styles.descriptionWrapper}>
                        <div className={styles.descriptionLine}></div>
                        <p className={styles.description}>
                            {t('evenements.reception_privee.description')}
                        </p>
                        <div className={styles.descriptionLine}></div>
                    </div>
                    <div className={styles.carouselControls}>
                        <button
                            className={styles.carouselArrow}
                            onClick={() => goToPrevious('privee')}
                            aria-label="Image précédente"
                        >
                            ‹
                        </button>
                        <div className={styles.carouselIndicators}>
                            {receptionPriveeImages.map((_, index) => (
                                <button
                                    key={index}
                                    className={`${styles.indicator} ${
                                        index === receptionPriveeIndex ? styles.active : ''
                                    }`}
                                    onClick={() => setReceptionPriveeIndex(index)}
                                    aria-label={`Image ${index + 1}`}
                                />
                            ))}
                        </div>
                        <button
                            className={styles.carouselArrow}
                            onClick={() => goToNext('privee')}
                            aria-label="Image suivante"
                        >
                            ›
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function Evenements() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div style={{ padding: '8rem 2rem', textAlign: 'center' }}>
                    <p>Chargement...</p>
                </div>
            </div>
        }>
            <EvenementsContent />
        </Suspense>
    );
}
