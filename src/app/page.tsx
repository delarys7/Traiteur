import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import GastronomySection from '@/components/GastronomySection';
import HomeInviteSection from '@/components/HomeInviteSection';

export default function Home() {
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
          <h1 className={styles.title}>L&apos;Art de Recevoir</h1>
          <p className={styles.subtitle}>
            Haute Couture Gastronomique
          </p>
          <Link href="/traiteur" className={styles.primaryButton}>
            Entrer dans la Maison
          </Link>
        </div>
      </section>

      {/* 2. Discover Our Products */}
      <section className={styles.discoverSection}>
        <h2 className={styles.sectionTitle}>Collections Culinaires</h2>
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
                <span className={styles.cardLabel}>Voir la Collection</span>
              </div>
            </div>
            <h3 className={styles.cardTitle}>Buffets & Banquets</h3>
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
                <span className={styles.cardLabel}>Voir la Collection</span>
              </div>
            </div>
            <h3 className={styles.cardTitle}>Plateaux d&apos;Affaires</h3>
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
                <span className={styles.cardLabel}>Voir la Collection</span>
              </div>
            </div>
            <h3 className={styles.cardTitle}>Cocktails & Réceptions</h3>
          </Link>

        </div>
      </section>

      {/* 3. Maison de Haute Gastronomie (New luxury section) */}
      <GastronomySection />

      {/* 4. Nos Prestations */}
      <section className={styles.prestationsSection}>
        <h2 className={styles.prestationsTitle}>Nos Prestations</h2>
        
        {/* Full width Banner */}
        <HomeInviteSection />

        {/* 3 Column Grid */}
        <div className={styles.prestationsGrid}>
          {/* Grands Événements */}
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
              <h3 className={styles.prestationName}>Grands événements</h3>
              <span className={styles.prestationLink}>Découvrir</span>
            </div>
          </Link>

          {/* Réception Corporate */}
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
              <h3 className={styles.prestationName}>Réceptions d&apos;entreprise</h3>
              <span className={styles.prestationLink}>Découvrir</span>
            </div>
          </Link>

          {/* Réceptions Privées */}
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
              <h3 className={styles.prestationName}>Réceptions privées</h3>
              <span className={styles.prestationLink}>Découvrir</span>
            </div>
          </Link>
        </div>
      </section>

    </div>
  );
}
