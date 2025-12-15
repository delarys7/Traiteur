import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <Image
            src="/images/hero.jpg"
            alt="Art de la table Luxe"
            fill
            className={styles.heroImage}
            priority
          />
        </div>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>L&apos;Excellence Culinaire</h1>
          <p className={styles.subtitle}>
            Une symphonie de saveurs pour vos moments d&apos;exception.
            L&apos;art de recevoir à la française.
          </p>
          <div className={styles.ctaGroup}>
            <Link href="/traiteur" className={styles.primaryButton}>
              La Boutique
            </Link>
            <Link href="/chef-a-domicile" className={styles.secondaryButton}>
              Nos Services
            </Link>
          </div>
        </div>
      </section>

      {/* Savoir-Faire Section */}
      <section className={styles.section}>
        <div className={styles.gridTwo}>
          <div className={styles.textBlock}>
            <h3>Un Savoir-Faire Unique</h3>
            <p>
              Depuis plus de vingt ans, notre Maison incarne l&apos;élégance et la créativité gastronomique.
              Inspirés par les saisons et les produits les plus nobles, nos chefs composent des partitions culinaires
              qui ravissent les palais les plus exigeants. Du caviar impérial à la truffe blanche d&apos;Alba,
              nous sélectionnons l&apos;exceptionnel pour le sublimer.
            </p>
            <Link href="/a-propos" className={styles.link}>Découvrir notre histoire</Link>
          </div>
          <div className={styles.imageBlock}>
            <Image
              src="/images/chef_hero.jpg"
              alt="Chef en action"
              fill
              className={styles.featureImage}
            />
          </div>
        </div>
      </section>

      {/* Traiteur Preview Section */}
      <section className={styles.section} style={{ backgroundColor: '#f9f9f9', width: '100%', maxWidth: '100%', padding: '8rem 10%' }}>
        <h2 className={styles.sectionTitle}>Collections Traiteur</h2>
        <div className={styles.gridTwo}>
          <div className={styles.imageBlock}>
            <Image
              src="/images/cocktail_tray_luxury.jpg"
              alt="Cocktails Prestige"
              fill
              className={styles.featureImage}
              // Fallback if image name is slightly different, using generic naming logic in real app
              // Just using the one copied earlier: cocktail_hero.jpg
              srcSet="/images/cocktail_hero.jpg"
            />
          </div>
          <div className={styles.textBlock}>
            <h3>Cocktails & Réceptions</h3>
            <p>
              Pour vos événements privés ou corporatifs, découvrez nos pièces cocktails d&apos;une finesse absolue.
              Nos collections &quot;Signature&quot; et &quot;Prestige&quot; sont conçues comme des bijoux comestibles,
              aussi beaux à regarder que délicieux à déguster.
            </p>
            <Link href="/traiteur" className={styles.link}>Explorer la carte</Link>
          </div>
        </div>
      </section>

      {/* Chef à Domicile */}
      <section className={styles.section}>
        <div className={styles.gridTwo}>
          <div className={styles.textBlock}>
            <h3>Le Restaurant chez Vous</h3>
            <p>
              Laissez entrer la haute gastronomie dans votre intimité. Notre service de Chef à Domicile
              transforme votre salle à manger en étoilé. Service au gant blanc, vaisselle en porcelaine de Limoges,
              et une discrétion absolue pour un moment hors du temps.
            </p>
            <Link href="/chef-a-domicile" className={styles.link}>Réserver un chef</Link>
          </div>
          <div className={styles.imageBlock}>
            <Image
              src="/images/buffet_hero.jpg"
              alt="Table dressée"
              fill
              className={styles.featureImage}
            />
          </div>
        </div>
      </section>

    </div>
  );
}
