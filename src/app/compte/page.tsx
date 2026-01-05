"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { signUp, signIn, authClient } from '@/lib/auth-client';
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
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [showResend, setShowResend] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            if (isLoginView) {
                const { error: signInError } = await signIn.email({
                    email: formData.email,
                    password: formData.password,
                    callbackURL: "/compte"
                });
                if (signInError) {
                    if (signInError.message?.includes('Email not verified')) {
                        setShowResend(true);
                        throw new Error('Email non vérifié, veuillez consulter votre boîte mail');
                    }
                    if (signInError.message?.includes('Invalid email or password')) {
                        throw new Error('Email ou mot de passe invalide');
                    }
                    throw new Error(signInError.message || 'Erreur de connexion');
                }
            } else {
                const fullName = `${formData.firstName} ${formData.lastName}`;
                const { error: signUpError } = await signUp.email({
                    email: formData.email,
                    password: formData.password,
                    name: fullName,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    type: accountType,
                    raisonSociale: formData.raisonSociale,
                    phone: formData.phone,
                    callbackURL: "/compte"
                } as any);
                if (signUpError) {
                    if (signUpError.message?.includes('User already exists')) {
                        throw new Error('Cet email est déjà utilisé');
                    }
                    throw new Error(signUpError.message || 'Erreur d\'inscription');
                }
                
                setIsLoginView(true);
                setSuccessMessage('Compte créé ! Veuillez vérifier vos emails pour valider votre compte avant de vous connecter.');
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendEmail = async () => {
        setIsResending(true);
        setError('');
        try {
            const { error: resendError } = await authClient.sendVerificationEmail({
                email: formData.email,
                callbackURL: "/compte"
            });
            if (resendError) throw new Error(resendError.message || "Erreur lors de l'envoi");
            setSuccessMessage('Email de vérification renvoyé !');
            setShowResend(false);
        } catch (err: any) {
            setError(err.message || "Impossible de renvoyer l'email");
        } finally {
            setIsResending(false);
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

                {error && (
                    <div className={styles.error}>
                        {error}
                        {showResend && (
                            <div className={styles.resendWrapper}>
                                <button 
                                    onClick={handleResendEmail} 
                                    className={styles.resendLink}
                                    disabled={isResending}
                                >
                                    {isResending ? 'Envoi...' : 'Renvoyer le mail ?'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {successMessage && <div className={styles.success}>{successMessage}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {!isLoginView && (
                        <div className={styles.formFields}>
                            {accountType === 'entreprise' && (
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Nom d'entreprise"
                                        value={formData.raisonSociale}
                                        onChange={e => setFormData({ ...formData, raisonSociale: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className={styles.formRow}>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        required
                                        placeholder={accountType === 'entreprise' ? "Nom (Responsable)" : "Nom"}
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        required
                                        placeholder={accountType === 'entreprise' ? "Prénom (Responsable)" : "Prénom"}
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="tel"
                                        placeholder="Téléphone (Optionnel)"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <input
                                    type="password"
                                    required
                                    placeholder="Mot de passe"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {isLoginView && (
                        <>
                            <div className={styles.inputGroup}>
                                <input
                                    type="email"
                                    required
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <input
                                    type="password"
                                    required
                                    placeholder="Mot de passe"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                        {isSubmitting ? 'Chargement...' : (isLoginView ? 'Se connecter' : "S'inscrire")}
                    </button>
                </form>

                <div className={styles.toggle}>
                    <button 
                        type="button" 
                        onClick={() => {
                            setIsLoginView(!isLoginView);
                            setError('');
                            setSuccessMessage('');
                            setShowResend(false);
                        }}
                        className={styles.toggleLink}
                    >
                        {isLoginView ? "Besoin d'un compte ? S'inscrire" : "Déjà membre ? Se connecter"}
                    </button>
                </div>
            </div>
        </div>
    );
}
