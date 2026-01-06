"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import styles from '../compte/page.module.css';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);

    // Vérifier que le token est présent et valide au chargement
    useEffect(() => {
        if (!token) {
            setError('Token de réinitialisation manquant');
            setIsValidating(false);
            return;
        }

        // Vérifier la validité du token
        fetch('/api/auth/reset-password/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        })
        .then(async (res) => {
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await res.text();
                throw new Error(text || 'Erreur de validation du token');
            }
            return res.json();
        })
        .then((data) => {
            if (data.valid) {
                setIsValidToken(true);
            } else {
                setError(data.error || 'Token invalide ou expiré');
            }
        })
        .catch((err) => {
            console.error('[Client] Erreur validation token:', err);
            setError(err.message || 'Erreur de validation du token');
        })
        .finally(() => {
            setIsValidating(false);
        });
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!password || password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password
                })
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(text || 'Erreur lors de la réinitialisation');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la réinitialisation');
            }

            // IMPORTANT : Déconnecter l'utilisateur avant la redirection
            // pour s'assurer qu'il n'est pas automatiquement connecté
            try {
                await signOut();
            } catch (signOutError) {
                console.warn('[Client] Erreur lors de la déconnexion (peut être ignorée):', signOutError);
            }

            // Attendre un peu pour que la déconnexion soit effective
            await new Promise(resolve => setTimeout(resolve, 500));

            // Succès : rediriger vers la page de connexion
            router.push('/compte?reset=success');
        } catch (err: any) {
            console.error('[Client] Erreur reset-password:', err);
            setError(err.message || 'Erreur lors de la réinitialisation');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isValidating) {
        return (
            <div className={styles.container}>
                <div className={styles.authBox}>
                    <h1 className={styles.authTitle}>Vérification du token...</h1>
                </div>
            </div>
        );
    }

    if (!isValidToken) {
        return (
            <div className={styles.container}>
                <div className={styles.authBox}>
                    <h1 className={styles.authTitle}>Réinitialisation du mot de passe</h1>
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}
                    <button 
                        onClick={() => router.push('/compte')}
                        className={styles.submitButton}
                    >
                        Retour à la connexion
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.authBox}>
                <h1 className={styles.authTitle}>Réinitialiser son mot de passe</h1>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            required
                            placeholder="Nouveau mot de passe"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            minLength={6}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <input
                            type="password"
                            required
                            placeholder="Confirmer le mot de passe"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            minLength={6}
                        />
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                        {isSubmitting ? 'Traitement...' : 'Confirmer la réinitialisation'}
                    </button>
                </form>
            </div>
        </div>
    );
}
