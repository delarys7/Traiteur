import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <p>&copy; {new Date().getFullYear()} Traiteur Prestige. Tous droits réservés.</p>
                <div className={styles.links}>
                    <a href="#">Mentions légales</a>
                    <a href="#">Confidentialité</a>
                </div>
            </div>
        </footer>
    );
}
