"use client";

import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import GastronomySection from '@/components/GastronomySection';
import HomeInviteSection from '@/components/HomeInviteSection';
import FadeIn from '@/components/FadeIn';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const { t } = useLanguage();
  return (
    <div className={styles.container}>
      {/* 1. Video Header */}
      <section className={styles.hero}>
        <div className={styles.videoBackground}>
          <video
            autoPlay
            muted
            loop
            playsInline
            className={styles.heroVideo}
          >
            <source src="/videos/9bc924c2-6c02-4374-815e-8e5620df9c90_watermarked.mp4" type="video/mp4" />
          </video>
        </div>

        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>
          <h1 className={styles.title}>{t('home.hero_title')}</h1>
          <p className={styles.subtitle}>
            {t('home.hero_subtitle')}
          </p>
          <Link href="/traiteur" className={styles.primaryButton}>
            {t('home.cta_enter')}
          </Link>
        </div>
      </section>

      {/* 2. Discover Our Products */}
      <section className={styles.discoverSection}>
        <h2 className={styles.sectionTitle}>{t('home.collections_title')}</h2>
        <div className={styles.discoverGrid}>

          {/* Buffets */}
          <Link href="/traiteur?category=buffet" className={styles.discoverCard}>
            <div className={styles.cardImageContainer}>
              <Image
                src="/images/buffet_hero.jpg"
                alt="Buffets & Banquets"
                fill
                className={styles.cardImage}
              />
              <div className={styles.cardOverlay}>
                <span className={styles.cardLabel}>{t('home.see_collection')}</span>
              </div>
            </div>
            <h3 className={styles.cardTitle}>{t('home.buffets')}</h3>
          </Link>

          {/* Plateaux Repas */}
          <Link href="/traiteur?category=plateau" className={styles.discoverCard}>
            <div className={styles.cardImageContainer}>
              <Image
                src="/images/main_hero.jpg"
                alt="Plateaux Repas"
                fill
                className={styles.cardImage}
              />
              <div className={styles.cardOverlay}>
                <span className={styles.cardLabel}>{t('home.see_collection')}</span>
              </div>
            </div>
            <h3 className={styles.cardTitle}>{t('home.trays')}</h3>
          </Link>

          {/* Pièces Cocktails */}
          <Link href="/traiteur?category=cocktail" className={styles.discoverCard}>
            <div className={styles.cardImageContainer}>
              <Image
                src="/images/cocktail_hero.jpg"
                alt="Pièces Cocktails"
                fill
                className={styles.cardImage}
              />
              <div className={styles.cardOverlay}>
                <span className={styles.cardLabel}>{t('home.see_collection')}</span>
              </div>
            </div>
            <h3 className={styles.cardTitle}>{t('home.cocktails')}</h3>
          </Link>

        </div>
      </section>

      {/* 3. Maison de Haute Gastronomie (New luxury section) */}
      <GastronomySection />

      {/* 4. Nos Prestations */}
      <section className={styles.prestationsSection}>
        <h2 className={styles.prestationsTitle}>{t('home.services_title')}</h2>
        
        {/* Full width Banner */}
        <FadeIn>
          <HomeInviteSection />
        </FadeIn>

        {/* 3 Column Grid */}
        <div className={styles.prestationsGrid}>
          {/* Grands Événements */}
          <FadeIn className={styles.prestationWrapper} delay={0.1}>
            <Link href="/traiteur" className={styles.prestationItem}>
              <div className={styles.prestationImageWrapper}>
                <Image
                  src="/images/buffet_hero.png"
                  alt="Grands Événements"
                  fill
                  className={styles.prestationImage}
                />
              </div>
              <div className={styles.prestationContent}>
                <h3 className={styles.prestationName}>{t('home.service_grand')}</h3>
                <span className={styles.prestationLink}>{t('home.services_btn')}</span>
              </div>
            </Link>
          </FadeIn>

          {/* Réception Corporate */}
          <FadeIn className={styles.prestationWrapper} delay={0.2}>
            <Link href="/traiteur" className={styles.prestationItem}>
              <div className={styles.prestationImageWrapper}>
                <Image
                  src="/images/dessert_hero.png"
                  alt="Réception Corporate"
                  fill
                  className={styles.prestationImage}
                />
              </div>
              <div className={styles.prestationContent}>
                <h3 className={styles.prestationName}>{t('home.service_corp')}</h3>
                <span className={styles.prestationLink}>{t('home.services_btn')}</span>
              </div>
            </Link>
          </FadeIn>

          {/* Réceptions Privées */}
          <FadeIn className={styles.prestationWrapper} delay={0.3}>
            <Link href="/traiteur" className={styles.prestationItem}>
              <div className={styles.prestationImageWrapper}>
                <Image
                  src="/images/cocktail_hero.png"
                  alt="Réceptions Privées"
                  fill
                  className={styles.prestationImage}
                />
              </div>
              <div className={styles.prestationContent}>
                <h3 className={styles.prestationName}>{t('home.service_private')}</h3>
                <span className={styles.prestationLink}>{t('home.services_btn')}</span>
              </div>
            </Link>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
