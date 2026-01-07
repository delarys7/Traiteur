"use client";

import Image from 'next/image';
import { useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';

// LeafletMap loading component
function MapLoading({ t }: { t: (key: string) => string }) {
    return (
        <div className={styles.mapLoading}>
            <p>{t('collaborations.map_loading')}</p>
        </div>
    );
}

const LeafletMap = dynamic(() => import('./LeafletMap'), { 
    ssr: false
});

const collaborations = [
    {
        name: "Maison Cartier",
        type: "Haute Joaillerie",
        caseStudy: "Dîner de Gala - Lancement de Collection",
        description: "Scénographie culinaire sur le thème de la flore exotique. 150 convives dans les jardins de l'Hôtel Particulier.",
        image: "/images/collaborations/cartier.png"
    },
    {
        name: "Galerie Perrotin",
        type: "Art Contemporain",
        caseStudy: "Vernissage - Exposition Exclusive",
        description: "Création de pièces cocktails monochromes et minimalistes en accord avec les œuvres exposées.",
        image: "/images/collaborations/perrotin.png"
    },
    {
        name: "LVMH Group",
        type: "Luxe & Art de vivre",
        caseStudy: "Séminaire de Direction - Sommet Annuel",
        description: "Service de conciergerie gastronomique complet sur trois jours. Chef privé et sommellerie dédiée.",
        image: "/images/collaborations/lvmh.png"
    }
];

const partnerLogos = [
    { name: "Chanel", src: "/images/Logos collaborations/Chanel-logo-svg.jpg", type: "crop" },
    { name: "Aston Martin", src: "/images/Logos collaborations/aston-martin-logo-svg.jpg", type: "square" },
    { name: "AP", src: "/images/Logos collaborations/audemars-piguet-logo-svg.jpg", type: "square" }, // SVG remains best for this one if not replaced
    { name: "Cartier", src: "/images/Logos collaborations/cartier-logo-svg.jpg", type: "crop" },
    { name: "Dior", src: "/images/Logos collaborations/dior-logo-svg.jpg", type: "square" },
    { name: "D&G", src: "/images/Logos collaborations/dolce-gabbana-logo-svg.jpg", type: "square" },
    { name: "Hermès", src: "/images/Logos collaborations/hermes-logo-svg.jpg", type: "crop" },
    { name: "LVMH", src: "/images/Logos collaborations/lvmh-logo-svg.jpg", type: "square" }, // Directory showed .jpg exists
    { name: "Rituals", src: "/images/Logos collaborations/rituals-logo-svg.svg", type: "rituals" },
    { name: "Tag Heuer", src: "/images/Logos collaborations/tag-heuer-logo-svg.jpg", type: "square" }
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
            {/* Header, PartnerStrip, CaseStudies remain unchanged */}
            {/* ... */}
            <section className={styles.header}>
                <p className={styles.label}>{t('collaborations.label')}</p>
                <h1 className={styles.title}>{t('collaborations.title')}</h1>
                <p className={styles.intro}>
                    {t('collaborations.intro')}
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
                            <span className={styles.collabType}>{t(`collaborations.cases.${collab.name}.type`)}</span>
                            <h2 className={styles.partnerName}>{collab.name}</h2>
                            <h3 className={styles.caseTitle}>{t(`collaborations.cases.${collab.name}.caseStudy`)}</h3>
                            <p className={styles.caseDesc}>{t(`collaborations.cases.${collab.name}.description`)}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* MAP SECTION (STYLIZED PARIS MAP) */}
            <section className={styles.mapSection}>
                <div className={styles.mapHeader}>
                    <h2 className={styles.mapTitle}>{t('collaborations.map_title')}</h2>
                    <p className={styles.mapDesc}>
                        {t('collaborations.map_desc')}
                    </p>
                </div>
                <div className={styles.mapContainer}>
                    <div className={styles.stylizedMap}>
                        <Suspense fallback={<MapLoading t={t} />}>
                            <LeafletMap locations={locations} center={MAP_CENTER} />
                        </Suspense>
                    </div>
                </div>
            </section>
        </div>
    );
}
