"use client";

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

const LeafletMap = dynamic(() => import('./LeafletMap'), { 
    ssr: false,
    loading: () => (
        <div className={styles.mapLoading}>
            <p>Chargement de la carte d&apos;exception...</p>
        </div>
    )
});

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

const partnerLogos = [
    { name: "Chanel", src: "/images/Logos collaborations/Chanel-logo-svg.svg" },
    { name: "Aston Martin", src: "/images/Logos collaborations/aston-martin-logo-svg.svg" },
    { name: "Audemars Piguet", src: "/images/Logos collaborations/audemars-piguet-logo-svg.svg" },
    { name: "Cartier", src: "/images/Logos collaborations/cartier-logo-svg.svg" },
    { name: "Dior", src: "/images/Logos collaborations/dior-logo-svg.svg" },
    { name: "Dolce & Gabbana", src: "/images/Logos collaborations/dolce-gabbana-logo-svg.svg" },
    { name: "Hermès", src: "/images/Logos collaborations/hermes-logo-svg.webp" },
    { name: "LVMH", src: "/images/Logos collaborations/lvmh-logo-svg.svg" },
    { name: "Rituals", src: "/images/Logos collaborations/rituals-logo-svg.svg" },
    { name: "Tag Heuer", src: "/images/Logos collaborations/tag-heuer-logo-svg.svg" }
];

const locations = [
    { name: "Place Vendôme", type: "Joaillerie", position: { lat: 48.8675, lng: 2.3294 } },
    { name: "Avenue Montaigne", type: "Mode", position: { lat: 48.8665, lng: 2.3045 } },
    { name: "Le Marais", type: "Art & Culture", position: { lat: 48.8585, lng: 2.3588 } },
    { name: "Saint-Germain-des-Prés", type: "Gastronomie", position: { lat: 48.8540, lng: 2.3315 } },
    { name: "Trocadéro", type: "Événementiel", position: { lat: 48.8619, lng: 2.2890 } }
];

const MAP_CENTER = { lat: 48.8606, lng: 2.3376 };
const MAP_STYLES = [
    { "elementType": "geometry", "stylers": [{ "color": "#f5f5f5" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f5" }] },
    { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
    { "featureType": "road.arterial", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#dadada" }] },
    { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
    { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
    { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#e5e5e5" }] },
    { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#eeeeee" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#c9c9c9" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] }
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
            {/* Header, PartnerStrip, CaseStudies remain unchanged */}
            {/* ... */}
            <section className={styles.header}>
                <p className={styles.label}>Nos Alliances d&apos;Exception</p>
                <h1 className={styles.title}>Collaborations</h1>
                <p className={styles.intro}>
                    Nous accompagnons les plus grandes maisons et institutions dans la création 
                    d&apos;instants sur-mesure. Une confiance mutuelle au service de l&apos;excellence.
                </p>
            </section>

            {/* PARTNER STRIP - INFINITE MARQUEE */}
            <section className={styles.partnerStrip}>
                <div className={styles.marqueeContent}>
                    {partnerLogos.map((logo, i) => (
                        <div key={`logo-1-${i}`} className={styles.logoItem} title={logo.name}>
                            <Image 
                                src={logo.src} 
                                alt={logo.name} 
                                width={120} 
                                height={60} 
                                className={styles.partnerLogoImg}
                            />
                        </div>
                    ))}
                    {partnerLogos.map((logo, i) => (
                        <div key={`logo-2-${i}`} className={styles.logoItem} title={logo.name}>
                            <Image 
                                src={logo.src} 
                                alt={logo.name} 
                                width={120} 
                                height={60} 
                                className={styles.partnerLogoImg}
                            />
                        </div>
                    ))}
                </div>
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
                    <div className={styles.stylizedMap}>
                        <LeafletMap locations={locations} center={MAP_CENTER} />
                    </div>
                </div>
            </section>
        </div>
    );
}
