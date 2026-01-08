"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import styles from './page.module.css';

function SendMessageContent() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const userId = params.userId as string;
    
    const [clientEmail, setClientEmail] = useState('');
    const [clientName, setClientName] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/compte?redirect=/admin/clients');
            return;
        }

        if (user && user.type !== 'administrateur') {
            router.push('/compte');
            return;
        }

        if (user && user.type === 'administrateur' && userId) {
            fetchClientInfo();
        }
    }, [user, isLoading, userId, router]);

    const fetchClientInfo = async () => {
        try {
            const response = await fetch(`/api/admin/clients/${userId}/detail`);
            if (response.ok) {
                const data = await response.json();
                setClientEmail(data.client.email);
                setClientName(`${data.client.firstName} ${data.client.lastName}`);
            }
        } catch (err) {
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSending(true);

        if (!subject.trim() || !message.trim()) {
            setError('Veuillez remplir tous les champs');
            setSending(false);
            return;
        }

        try {
            // TODO: Implémenter l'envoi du message
            // Pour l'instant, on simule l'envoi
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setSuccess(true);
            setTimeout(() => {
                router.push(`/admin/clients/${userId}/detail`);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'envoi du message');
        } finally {
            setSending(false);
        }
    };

    if (isLoading || loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Chargement...</div>
            </div>
        );
    }

    if (!user || user.type !== 'administrateur') {
        return null;
    }

    if (success) {
        return (
            <div className={styles.container}>
                <div className={styles.success}>
                    Message envoyé avec succès !
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Link href={`/admin/clients/${userId}/detail`} className={styles.backLink}>
                ← Retour
            </Link>

            <div className={styles.formContainer}>
                <h1 className={styles.title}>Envoyer un message</h1>
                <p className={styles.subtitle}>À : {clientName} ({clientEmail})</p>

                {error && (
                    <div className={styles.error}>{error}</div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Sujet</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className={styles.textarea}
                            rows={10}
                            required
                        />
                    </div>

                    <div className={styles.formActions}>
                        <Link 
                            href={`/admin/clients/${userId}/detail`}
                            className={styles.cancelButton}
                        >
                            Annuler
                        </Link>
                        <button 
                            type="submit" 
                            className={styles.submitButton}
                            disabled={sending}
                        >
                            {sending ? 'Envoi...' : 'Envoyer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function SendMessagePage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.loading}>Chargement...</div>
            </div>
        }>
            <SendMessageContent />
        </Suspense>
    );
}
