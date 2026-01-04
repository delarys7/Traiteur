"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { signUp, signIn } from '@/lib/auth-client';
import styles from './page.module.css';

export default function AccountPage() {
    const { user, logout } = useAuth();
    const [isLoginView, setIsLoginView] = useState(true);
    const [accountType, setAccountType] = useState<'particulier' | 'entreprise'>('particulier');
    const [formData, setFormData] = useState({ 
        name: '', 
        firstName: '',
        lastName: '',
        email: '', 
        password: '',
        raisonSociale: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (isLoginView) {
                const { error: signInError } = await signIn.email({
                    email: formData.email,
                    password: formData.password,
                    callbackURL: "/compte"
                });
                if (signInError) throw new Error(signInError.message || 'Erreur de connexion');
            } else {
                const name = accountType === 'entreprise' ? formData.name : `${formData.firstName} ${formData.lastName}`;
                const { error: signUpError } = await signUp.email({
                    email: formData.email,
                    password: formData.password,
                    name: name,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    type: accountType,
                    raisonSociale: formData.raisonSociale,
                    phone: formData.phone,
                    callbackURL: "/compte"
                } as any);
                if (signUpError) throw new Error(signUpError.message || 'Erreur d\'inscription');
                
                setIsLoginView(true);
                setError('Compte créé avec succès. Veuillez vous connecter.');
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (user) {
        return (
            <div className={styles.container}>
                <div className={styles.dashboard}>
                    <h1 className={styles.title}>Bienvenue, {user.name}</h1>
                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <h2>Profil</h2>
                            <p><strong>Type:</strong> {user.type === 'entreprise' ? 'Professionnel' : 'Particulier'}</p>
                            {user.type === 'entreprise' && (
                                <>
                                    <p><strong>Raison Sociale:</strong> {user.raisonSociale}</p>
                                    <p><strong>Responsable:</strong> {user.name}</p>
                                </>
                            )}
                            <p><strong>Email:</strong> {user.email}</p>
                            {user.phone && <p><strong>Téléphone:</strong> {user.phone}</p>}
                        </div>
                        <div className={styles.card}>
                            <h2>Mes Commandes</h2>
                            <p className={styles.empty}>Vous n&apos;avez pas encore passé de commande.</p>
                        </div>
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

                {!isLoginView && (
                    <div className={styles.typeToggle}>
                        <button 
                            type="button"
                            className={`${styles.typeButton} ${accountType === 'particulier' ? styles.typeButtonActive : ''}`}
                            onClick={() => setAccountType('particulier')}
                        >
                            Particulier
                        </button>
                        <button 
                            type="button"
                            className={`${styles.typeButton} ${accountType === 'entreprise' ? styles.typeButtonActive : ''}`}
                            onClick={() => setAccountType('entreprise')}
                        >
                            Professionnel
                        </button>
                    </div>
                )}

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {!isLoginView && (
                        <>
                            {accountType === 'particulier' ? (
                                <>
                                    <div className={styles.inputGroup}>
                                        <label>Nom</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.lastName}
                                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Prénom</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={styles.inputGroup}>
                                        <label>Nom d&apos;entreprise</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.raisonSociale}
                                            onChange={e => setFormData({ ...formData, raisonSociale: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>NOM Prénom (Responsable)</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                            <div className={styles.inputGroup}>
                                <label>Téléphone (Optionnel)</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </>
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

                    <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                        {isSubmitting ? 'Chargement...' : (isLoginView ? 'Se connecter' : "S'inscrire")}
                    </button>
                </form>

                <div className={styles.toggle}>
                    <button onClick={() => setIsLoginView(!isLoginView)}>
                        {isLoginView ? "Besoin d'un compte ? S'inscrire" : "Déjà membre ? Se connecter"}
                    </button>
                </div>
            </div>
        </div>
    );
}
