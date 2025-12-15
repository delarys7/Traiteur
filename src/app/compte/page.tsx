"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function AccountPage() {
    const { user, login, logout } = useAuth();
    const [isLoginView, setIsLoginView] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Une erreur est survenue');
            }

            if (isLoginView) {
                login(data.user);
            } else {
                // Auto login after register or ask to login
                setIsLoginView(true);
                setError('Compte créé avec succès. Veuillez vous connecter.');
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Une erreur est survenue');
            }
        }
    };

    if (user) {
        return (
            <div className={styles.container}>
                <div className={styles.dashboard}>
                    <h1 className={styles.title}>Bienvenue, {user.name}</h1>
                    <div className={styles.card}>
                        <h2>Mes Informations</h2>
                        <p>Email: {user.email}</p>
                    </div>
                    <div className={styles.card}>
                        <h2>Mes Commandes</h2>
                        <p className={styles.empty}>Aucune commande récente.</p>
                    </div>
                    <button onClick={logout} className={styles.logoutButton}>Se déconnecter</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.authBox}>
                <h1 className={styles.authTitle}>{isLoginView ? 'Connexion' : 'Créer un compte'}</h1>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {!isLoginView && (
                        <div className={styles.inputGroup}>
                            <label>Nom complet</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className={styles.submitButton}>
                        {isLoginView ? 'Se connecter' : "S'inscrire"}
                    </button>
                </form>

                <div className={styles.toggle}>
                    <button onClick={() => setIsLoginView(!isLoginView)}>
                        {isLoginView ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
                    </button>
                </div>
            </div>
        </div>
    );
}
