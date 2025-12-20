"use client";

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import styles from './page.module.css';

const collaborations = [
    {
        name: "Maison Cartier",
        type: "Haute Joaillerie",
        caseStudy: "Dîner de Gala - Lancement de Collection",
        description: "Scénographie culinaire sur le thème de la flore exotique. 150 convives dans les jardins de l'Hôtel Particulier.",
        image: "/images/hero_v2.jpg"
    },
    {
        name: "Galerie Perrotin",
        type: "Art Contemporain",
        caseStudy: "Vernissage - Exposition Exclusive",
        description: "Création de pièces cocktails monochromes et minimalistes en accord avec les œuvres exposées.",
        image: "/images/cocktail_hero.jpg"
    },
    {
        name: "LVMH Group",
        type: "Luxe & Art de vivre",
        caseStudy: "Séminaire de Direction - Sommet Annuel",
        description: "Service de conciergerie gastronomique complet sur trois jours. Chef privé et sommellerie dédiée.",
        image: "/images/buffet_hero.jpg"
    }
];

const locations = [
    { name: "Place Vendôme", type: "Joaillerie", coords: { top: "45%", left: "48%" } },
    { name: "Avenue Montaigne", type: "Mode", coords: { top: "42%", left: "38%" } },
    { name: "Le Marais", type: "Art & Culture", coords: { top: "48%", left: "62%" } },
    { name: "Saint-Germain-des-Prés", type: "Gastronomie", coords: { top: "55%", left: "52%" } },
    { name: "Trocadéro", type: "Événementiel", coords: { top: "45%", left: "32%" } }
];

export default function Collaborations() {
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
            <section className={styles.header}>
                <p className={styles.label}>Nos Alliances d&apos;Exception</p>
                <h1 className={styles.title}>Collaborations</h1>
                <p className={styles.intro}>
                    Nous accompagnons les plus grandes maisons et institutions dans la création 
                    d&apos;instants sur-mesure. Une confiance mutuelle au service de l&apos;excellence.
                </p>
            </section>

            {/* PARTNERS LOGO STRIP (Styled Placeholders) */}
            <section className={styles.partnerStrip}>
                <div className={styles.logoItem}>CARTIER</div>
                <div className={styles.logoItem}>PERROTIN</div>
                <div className={styles.logoItem}>LVMH</div>
                <div className={styles.logoItem}>HERMÈS</div>
                <div className={styles.logoItem}>DIOR</div>
            </section>

            {/* CASE STUDIES */}
            <section className={styles.caseStudies}>
                {collaborations.map((collab, index) => (
                    <div 
                        key={collab.name}
                        className={`${styles.caseCard} ${styles.reveal}`}
                        ref={el => { revealRefs.current[index] = el; }}
                    >
                        <div className={styles.caseImageWrapper}>
                            <Image
                                src={collab.image}
                                alt={collab.name}
                                fill
                                className={styles.caseImage}
                            />
                        </div>
                        <div className={styles.caseInfo}>
                            <span className={styles.collabType}>{collab.type}</span>
                            <h2 className={styles.partnerName}>{collab.name}</h2>
                            <h3 className={styles.caseTitle}>{collab.caseStudy}</h3>
                            <p className={styles.caseDesc}>{collab.description}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* MAP SECTION (STYLIZED PARIS MAP) */}
            <section className={styles.mapSection}>
                <div className={styles.mapHeader}>
                    <h2 className={styles.mapTitle}>Nos Réalisations à Paris</h2>
                    <p className={styles.mapDesc}>
                        De la Rive Gauche à la Place Vendôme, retrouvez les lieux emblématiques 
                        où Athéna Event a laissé son empreinte culinaire.
                    </p>
                </div>
                <div className={styles.mapContainer}>
                    {/* Placeholder for a stylized map image or SVG */}
                    <div className={styles.stylizedMap}>
                        {locations.map(loc => (
                            <div 
                                key={loc.name}
                                className={styles.mapPin}
                                style={{ top: loc.coords.top, left: loc.coords.left }}
                            >
                                <div className={styles.pinDot} />
                                <div className={styles.pinLabel}>
                                    <strong>{loc.name}</strong>
                                    <span>{loc.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
