"use client";

import { useLanguage } from '@/context/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
    const { t } = useLanguage();
    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <p>&copy; {new Date().getFullYear()} Athéna Event Paris. {t('footer.copyright')}</p>
                <div className={styles.links}>
                    <a href="#">{t('footer.legal')}</a>
                    <a href="#">{t('footer.privacy')}</a>
                </div>
            </div>
        </footer>
    );
}
