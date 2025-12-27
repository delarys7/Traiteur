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

      {/* 4. Athéna Event s'invite chez vous */}
      <HomeInviteSection />

      {/* 5. Nos Prestations */}
      <section className={styles.servicesSection}>
        <div className={styles.servicesGrid}>
          {/* Grands Événements */}
          <div className={styles.serviceItem}>
            <div className={styles.serviceItemTextRight}>
              <h3>Grands Événements</h3>
              <div className={styles.desktopOnly}>
                <p className={styles.servicesDesc}>
                  Chaque événement est une page blanche que nous écrivons avec vous.
                  De l&apos;intime au grandiose, nos équipes orchestrent une symphonie de saveurs
                  et d&apos;élégance pour sublimer vos instants précieux.
                </p>
                <Link href="/contact" className={styles.discoverLink}>Découvrir</Link>
              </div>
            </div>
            <div className={styles.serviceItemImage}>
              <Image
                src="/images/buffet_hero.jpg"
                alt="Grands Événements"
                fill
                className={styles.serviceImage}
              />
              <div className={styles.mobileOverlay}>
                <Link href="/contact" className={styles.mobileDiscoverButton}>Découvrir</Link>
                <p className={styles.mobileDesc}>
                  Chaque événement est une page blanche que nous écrivons avec vous.
                  De l&apos;intime au grandiose, nos équipes orchestrent une symphonie de saveurs
                  et d&apos;élégance pour sublimer vos instants précieux.
                </p>
              </div>
            </div>
          </div>

          {/* Réceptions d'Entreprise */}
          <div className={styles.serviceItem}>
            <div className={styles.serviceItemText}>
              <h3>Réceptions Corporate</h3>
              <div className={styles.desktopOnly}>
                <p className={styles.servicesDesc}>
                  Une expertise dédiée à votre image de marque. De la pause-café au gala prestigieux, 
                  notre Maison sublime vos événements professionnels avec une rigueur absolue 
                  et une créativité sans cesse renouvelée.
                </p>
                <Link href="/contact" className={styles.discoverLink}>Découvrir</Link>
              </div>
            </div>
            <div className={styles.serviceItemImage}>
              <Image
                src="/images/dessert_hero.jpg"
                alt="Réceptions d'Entreprise"
                fill
                className={styles.serviceImage}
              />
              <div className={styles.mobileOverlay}>
                <Link href="/contact" className={styles.mobileDiscoverButton}>Découvrir</Link>
                <p className={styles.mobileDesc}>
                  Une expertise dédiée à votre image de marque. De la pause-café au gala prestigieux, 
                  notre Maison sublime vos événements professionnels.
                </p>
              </div>
            </div>
          </div>

          {/* Gastronmique */}
          <div className={styles.serviceItem}>
            <div className={styles.serviceItemTextRight}>
              <h3>Haute Gastronomie</h3>
              <div className={styles.desktopOnly}>
                <p className={styles.servicesDesc}>
                  L&apos;excellence culinaire portée à son paroxysme. Nos chefs sélectionnent les produits 
                  les plus rares pour composer une symphonie de saveurs qui marquera durablement 
                  l&apos;esprit de vos convives.
                </p>
                <Link href="/traiteur" className={styles.discoverLink}>Découvrir</Link>
              </div>
            </div>
            <div className={styles.serviceItemImage}>
              <Image
                src="/images/chef_hero.jpg"
                alt="La Gastronomie"
                fill
                className={styles.serviceImage}
              />
              <div className={styles.mobileOverlay}>
                <Link href="/traiteur" className={styles.mobileDiscoverButton}>Découvrir</Link>
                <p className={styles.mobileDesc}>
                  L&apos;excellence culinaire portée à son paroxysme. Nos chefs sélectionnent les produits 
                  les plus rares pour une symphonie de saveurs.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
