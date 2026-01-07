"use client";

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import styles from './HomeInviteSection.module.css';

export default function HomeInviteSection() {
  const { t } = useLanguage();
  return (
    <section className={styles.section}>
      <div className={styles.imageBanner}>
        <div className={styles.overlay} />
        <div className={styles.content}>
          <h2 className={styles.title}>{t('home.invite_title')}</h2>
          <div className={styles.buttonContainer}>
            <Link href="/chef-a-domicile" className={styles.button}>
              {t('home.invite_chef')}
            </Link>
            <Link href="/consultant" className={styles.button}>
              {t('home.invite_consultant')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
