"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import styles from '../compte/page.module.css';

export default function Contact() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { items, total } = useCart();
    
    const [formData, setFormData] = useState({
        phone: '',
        motif: '',
        message: ''
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Vérifier si on vient du panier (pour pré-sélectionner "Commande")
    useEffect(() => {
        const fromCart = searchParams.get('from') === 'cart';
        if (fromCart) {
            setFormData(prev => ({ ...prev, motif: 'commande' }));
        }
    }, [searchParams]);

    // Pas de redirection automatique - la page est accessible sans connexion

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Vérifier que l'utilisateur est connecté
        if (!user) {
            setError('Vous devez être connecté pour envoyer un message');
            router.push('/compte?redirect=/contact');
            return;
        }

        setIsSubmitting(true);

        if (!formData.motif) {
            setError('Veuillez sélectionner un motif');
            setIsSubmitting(false);
            return;
        }

        if (!formData.message || formData.message.trim().length < 10) {
            setError('Veuillez saisir un message d\'au moins 10 caractères');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: user?.type === 'entreprise' ? user.raisonSociale : `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                    email: user?.email,
                    phone: formData.phone || null,
                    motif: formData.motif,
                    message: formData.message,
                    cartItems: formData.motif === 'commande' ? items : null,
                    cartTotal: formData.motif === 'commande' ? total : null
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'envoi du message');
            }

            // Succès
            setShowToast(true);
            setFormData({ phone: '', motif: '', message: '' });
            setTimeout(() => {
                setShowToast(false);
            }, 3000);
        } catch (err: any) {
            console.error('[Client] Erreur contact:', err);
            setError(err.message || 'Erreur lors de l\'envoi du message');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.authBox}>
                    <h1 className={styles.authTitle}>Chargement...</h1>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.authBox}>
                <h1 className={styles.authTitle}>Contact</h1>

                {error && (
                    <div className={styles.error} style={{ marginBottom: '1rem' }}>
                        {error}
                    </div>
                )}

                {!user && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: '#fff9f0',
                        border: '1px solid #ffe7c4',
                        borderRadius: '4px',
                        marginBottom: '1.5rem',
                        color: '#8a6d3b',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        ⚠️ Vous devez être connecté pour envoyer un message. <a href="/compte" style={{ color: '#8a6d3b', textDecoration: 'underline' }}>Se connecter</a>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Informations automatiques si connecté, sinon champs libres */}
                    {user ? (
                        <>
                            <div className={styles.inputGroup}>
                                <input
                                    type="text"
                                    value={user.type === 'entreprise' ? user.raisonSociale || '' : `${user.firstName || ''} ${user.lastName || ''}`.trim()}
                                    disabled
                                    placeholder={user.type === 'entreprise' ? 'Raison sociale' : 'Nom et prénom'}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <input
                                    type="email"
                                    value={user.email || ''}
                                    disabled
                                    placeholder="Email"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.inputGroup}>
                                <input
                                    type="text"
                                    placeholder="Nom et prénom"
                                    disabled
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    disabled
                                />
                            </div>
                        </>
                    )}

                    {/* Téléphone optionnel */}
                    <div className={styles.inputGroup}>
                        <input
                            type="tel"
                            placeholder="Téléphone (optionnel)"
                            value={formData.phone}
                            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                    </div>

                    {/* Choix du motif */}
                    <div className={styles.inputGroup}>
                        <select
                            value={formData.motif}
                            onChange={e => setFormData(prev => ({ ...prev, motif: e.target.value }))}
                            required
                            className={styles.select}
                        >
                            <option value="">Sélectionner un motif</option>
                            <option value="commande">Commande / Devis</option>
                            <option value="collaboration-entreprise">Collaboration - Entreprise</option>
                            <option value="collaboration-particulier">Collaboration - Particulier</option>
                            <option value="autre">Autre (renseignements, etc.)</option>
                        </select>
                    </div>

                    {/* Récapitulatif du panier si motif = commande */}
                    {formData.motif === 'commande' && items.length > 0 && (
                        <div style={{
                            backgroundColor: '#fcfcfc',
                            border: '1px solid #eee',
                            padding: '1.5rem',
                            borderRadius: '4px',
                            marginBottom: '1rem'
                        }}>
                            <h3 style={{
                                fontSize: '1.2rem',
                                marginBottom: '1rem',
                                paddingBottom: '0.5rem',
                                borderBottom: '1px solid #eee',
                                fontWeight: '500'
                            }}>
                                Récapitulatif du panier
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {items.map((item) => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '0.9rem'
                                    }}>
                                        <span style={{ fontWeight: '500' }}>{item.name}</span>
                                        <span style={{ color: '#666' }}>
                                            {item.quantity} × {(item.price / 100).toFixed(2)} € = {((item.price * item.quantity) / 100).toFixed(2)} €
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div style={{
                                marginTop: '1rem',
                                paddingTop: '1rem',
                                borderTop: '2px solid #111',
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontWeight: '600',
                                fontSize: '1rem'
                            }}>
                                <span>Total</span>
                                <span>{(total / 100).toFixed(2)} €</span>
                            </div>
                        </div>
                    )}

                    {/* Message descriptif */}
                    <div className={styles.inputGroup}>
                        <textarea
                            placeholder="Votre message..."
                            value={formData.message}
                            onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            required
                            minLength={10}
                            rows={6}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={styles.submitButton} 
                        disabled={isSubmitting || !user}
                    >
                        {isSubmitting ? 'Envoi...' : !user ? 'Connectez-vous pour envoyer' : 'Envoyer'}
                    </button>
                </form>
            </div>

            {/* Toast de succès */}
            {showToast && (
                <div className={styles.toast}>
                    Message envoyé avec succès !
                </div>
            )}
        </div>
    );
}
