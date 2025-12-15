import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

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
            <source src="/videos/header_bg.mp4" type="video/mp4" />
          </video>
          <div className={styles.heroFallback}>
            <Image
              src="/images/hero.jpg"
              alt="Hero Fallback"
              fill
              className={styles.heroImage}
              priority
            />
          </div>
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

      {/* 3. Nos Prestations */}
      <section className={styles.servicesSection}>
        <div className={styles.servicesHeader}>
          <div className={styles.servicesTitleBlock}>
            <h2 className={styles.servicesMainTitle}>
              Héritage & <br /> <span>Savoir-Faire</span>
            </h2>
            <p className={styles.servicesDesc}>
              Chaque événement est une page blanche que nous écrivons avec vous.
              De l&apos;intime au grandiose, nos équipes orchestrent une symphonie de saveurs
              et d&apos;élégance pour sublimer vos instants précieux.
            </p>
          </div>
          <div className={styles.servicesHeaderImage}>
            <Image
              src="/images/buffet_hero.jpg"
              alt="Réception grandiose"
              fill
              className={styles.serviceImage}
            />
          </div>
        </div>

        <div className={styles.servicesGrid}>
          {/* Grands Événements */}
          <div className={styles.serviceItem}>
            <div className={styles.serviceItemImage}>
              <Image
                src="/images/hero.jpg"
                alt="Grands Événements"
                fill
                className={styles.serviceImage}
              />
            </div>
            <div className={styles.serviceItemText}>
              <h3>Grands Événements</h3>
              <Link href="/contact" className={styles.discoverLink}>Découvrir</Link>
            </div>
          </div>

          {/* Réceptions d'Entreprise */}
          <div className={styles.serviceItem}>
            <div className={styles.serviceItemTextRight}>
              <h3>Réceptions Corporate</h3>
              <Link href="/contact" className={styles.discoverLink}>Découvrir</Link>
            </div>
            <div className={styles.serviceItemImage}>
              <Image
                src="/images/dessert_hero.jpg"
                alt="Réceptions d'Entreprise"
                fill
                className={styles.serviceImage}
              />
            </div>
          </div>

          {/* Gastronomie */}
          <div className={styles.serviceItem}>
            <div className={styles.serviceItemImage}>
              <Image
                src="/images/chef_hero.jpg"
                alt="La Gastronomie"
                fill
                className={styles.serviceImage}
              />
            </div>
            <div className={styles.serviceItemText}>
              <h3>Haute Gastronomie</h3>
              <Link href="/traiteur" className={styles.discoverLink}>Découvrir</Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
