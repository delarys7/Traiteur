"use client";

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import styles from './page.module.css';

const team = [
    {
        name: "Alexandre Dubois",
        role: "Chef Fondateur",
        career: "Ex-Second de cuisine en Palace étoilé",
        bio: "Visionnaire et passionné par le terroir français, Alexandre insuffle l'âme créative de la maison. Son parcours dans les plus grandes cuisines parisiennes définit l'exigence de chaque assiette.",
        image: "/images/L'équipe/Chef.png"
    },
    {
        name: "Sarah Fredaht",
        role: "Directrice de Création",
        career: "Designer culinaire & Scénographe",
        bio: "Sarah transforme chaque réception en une œuvre visuelle. Pour elle, le plaisir commence par l'œil, orchestrant des décors où chaque détail dialogue avec la gastronomie.",
        image: "/images/L'équipe/Directrice création.png"
    },
    {
        name: "Marc-Antoine Rossi",
        role: "Responsable Sommellerie",
        career: "Maître Sommelier international",
        bio: "Gardien de notre cave, Marc-Antoine sélectionne des pépites rares et des domaines de prestige pour créer des accords mets-vins qui subliment vos expériences.",
        image: "/images/L'équipe/Sommelier.png"
    },
    {
        name: "Sophie Martin",
        role: "Coordinatrice Événementielle",
        career: "Master en Management du Luxe",
        bio: "Cheffe d'orchestre de vos projets, Sophie assure une exécution millimétrée. Son sens du service et sa discrétion font d'elle le pilier logistique de vos réceptions.",
        image: "/images/L'équipe/Coordinatrice évenementielle.png"
    }
];

export default function Equipe() {
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
                <p className={styles.label}>Les Visages de l&apos;Excellence</p>
                <h1 className={styles.title}>L&apos;Équipe</h1>
                <p className={styles.intro}>
                    Derrière chaque instant d&apos;exception se cachent des talents passionnés 
                    qui unissent leur savoir-faire pour porter l&apos;art de recevoir à son apogée.
                </p>
            </section>

            <section className={styles.teamGrid}>
                {team.map((member, index) => (
                    <div 
                        key={member.name}
                        className={`${styles.teamCard} ${styles.reveal}`}
                        ref={el => { revealRefs.current[index] = el; }}
                    >
                        <div className={styles.imageContainer}>
                            <Image
                                src={member.image}
                                alt={member.name}
                                fill
                                className={styles.image}
                            />
                            <div className={styles.overlay}>
                                <div className={styles.bio}>
                                    <p className={styles.career}>{member.career}</p>
                                    <p className={styles.desc}>{member.bio}</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.info}>
                            <h2 className={styles.name}>{member.name}</h2>
                            <p className={styles.role}>{member.role}</p>
                        </div>
                    </div>
                ))}
            </section>

            <section className={styles.joinUs}>
                <div className={styles.joinContent}>
                    <h3>Rejoindre la Maison</h3>
                    <p>Nous sommes toujours à la recherche de talents d&apos;exception. Partagez notre passion de l&apos;excellence.</p>
                    <a href="mailto:contact@athena-event.fr" className={styles.contactBtn}>Postuler</a>
                </div>
            </section>
        </div>
    );
}
