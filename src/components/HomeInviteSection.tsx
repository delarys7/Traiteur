import Link from 'next/link';
import styles from './HomeInviteSection.module.css';

export default function HomeInviteSection() {
  return (
    <section className={styles.section}>
      <div className={styles.imageBanner}>
        <div className={styles.overlay} />
        <div className={styles.content}>
          <h2 className={styles.title}>Athéna Event s&apos;invite chez vous</h2>
          <div className={styles.buttonContainer}>
            <Link href="/chef-a-domicile" className={styles.button}>
              Chef à domicile
            </Link>
            <Link href="/consultant" className={styles.button}>
              Consultant
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
