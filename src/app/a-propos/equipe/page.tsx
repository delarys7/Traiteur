"use client";

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
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
        image: "/images/L'équipe/Directrice_création.png"
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
        image: "/images/L'équipe/Coordinatrice_évenementielle.png"
    }
];

export default function Equipe() {
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
            <section className={styles.header}>
                <p className={styles.label}>{t('equipe.label')}</p>
                <h1 className={styles.title}>{t('equipe.title')}</h1>
                <p className={styles.intro}>
                    {t('equipe.intro')}
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
                                    <p className={styles.career}>{t(`equipe.members.${member.name}.career`)}</p>
                                    <p className={styles.desc}>{t(`equipe.members.${member.name}.bio`)}</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.info}>
                            <h2 className={styles.name}>{member.name}</h2>
                            <p className={styles.role}>{t(`equipe.members.${member.name}.role`)}</p>
                        </div>
                    </div>
                ))}
            </section>

            <section className={styles.joinUs}>
                <div className={styles.joinContent}>
                    <h3>{t('equipe.join_title')}</h3>
                    <p>{t('equipe.join_text')}</p>
                    <a href="mailto:contact@athena-event.fr" className={styles.contactBtn}>{t('equipe.join_button')}</a>
                </div>
            </section>
        </div>
    );
}
