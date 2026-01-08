"use client";

import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';

function EvenementsContent() {
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const grandsEvenementsRef = useRef<HTMLElement>(null);
    const receptionEntrepriseRef = useRef<HTMLElement>(null);
    const receptionPriveeRef = useRef<HTMLElement>(null);

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

    return (
        <div className={styles.container}>
            {/* Section Grands événements */}
            <section id="grands-evenements" ref={grandsEvenementsRef} className={styles.section}>
                <div className={styles.content}>
                    <span className={styles.label}>{t('evenements.grands_evenements.label')}</span>
                    <h1 className={styles.title}>{t('evenements.grands_evenements.title')}</h1>
                    <p className={styles.description}>
                        {t('evenements.grands_evenements.description')}
                    </p>
                </div>
            </section>

            {/* Section Réception d'entreprise */}
            <section id="reception-entreprise" ref={receptionEntrepriseRef} className={styles.section}>
                <div className={styles.content}>
                    <span className={styles.label}>{t('evenements.reception_entreprise.label')}</span>
                    <h1 className={styles.title}>{t('evenements.reception_entreprise.title')}</h1>
                    <p className={styles.description}>
                        {t('evenements.reception_entreprise.description')}
                    </p>
                </div>
            </section>

            {/* Section Réception privée */}
            <section id="reception-privee" ref={receptionPriveeRef} className={styles.section}>
                <div className={styles.content}>
                    <span className={styles.label}>{t('evenements.reception_privee.label')}</span>
                    <h1 className={styles.title}>{t('evenements.reception_privee.title')}</h1>
                    <p className={styles.description}>
                        {t('evenements.reception_privee.description')}
                    </p>
                </div>
            </section>
        </div>
    );
}

export default function Evenements() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.content} style={{ padding: '8rem 2rem', textAlign: 'center' }}>
                    <p>Chargement...</p>
                </div>
            </div>
        }>
            <EvenementsContent />
        </Suspense>
    );
}
