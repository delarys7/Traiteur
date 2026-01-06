"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import PhoneInput from '@/components/PhoneInput';
import styles from '../compte/page.module.css';

interface Address {
    id: string;
    name: string;
    address: string;
    postalCode: string;
    city: string;
}

export default function Contact() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { items, total } = useCart();
    
    const [formData, setFormData] = useState({
        phone: '',
        motif: '',
        message: '',
        selectedAddress: '',
        eventDate: { day: '', month: '', year: '' },
        budgetPerPerson: '',
        numberOfGuests: ''
    });
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
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

    // Charger les adresses si l'utilisateur est connecté et que le motif est "commande"
    useEffect(() => {
        if (user && formData.motif === 'commande') {
            loadAddresses();
        }
    }, [user, formData.motif]);

    const loadAddresses = async () => {
        if (!user) return;
        setIsLoadingAddresses(true);
        try {
            const response = await fetch('/api/addresses');
            if (response.ok) {
                const data = await response.json();
                setAddresses(data.addresses || []);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des adresses:', error);
        } finally {
            setIsLoadingAddresses(false);
        }
    };

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

        // Validation pour les collaborations
        if ((formData.motif === 'collaboration-entreprise' || formData.motif === 'collaboration-particulier')) {
            if (!formData.eventDate.day || !formData.eventDate.month || !formData.eventDate.year) {
                setError('Veuillez saisir la date de l\'événement');
                setIsSubmitting(false);
                return;
            }
            if (!formData.numberOfGuests || parseInt(formData.numberOfGuests) <= 0) {
                setError('Veuillez saisir un nombre d\'invités valide');
                setIsSubmitting(false);
                return;
            }
            if (!formData.budgetPerPerson || parseFloat(formData.budgetPerPerson) <= 0) {
                setError('Veuillez saisir un budget par personne valide');
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    entreprise: user.type === 'entreprise' ? user.raisonSociale : null,
                    email: user?.email,
                    phone: formData.phone || null,
                    motif: formData.motif,
                    message: formData.message,
                    selectedAddress: formData.motif === 'commande' ? formData.selectedAddress : null,
                    eventDate: (formData.motif === 'collaboration-entreprise' || formData.motif === 'collaboration-particulier') 
                        ? `${formData.eventDate.year}-${formData.eventDate.month.padStart(2, '0')}-${formData.eventDate.day.padStart(2, '0')}`
                        : null,
                    numberOfGuests: (formData.motif === 'collaboration-entreprise' || formData.motif === 'collaboration-particulier')
                        ? parseInt(formData.numberOfGuests)
                        : null,
                    budgetPerPerson: (formData.motif === 'collaboration-entreprise' || formData.motif === 'collaboration-particulier')
                        ? parseFloat(formData.budgetPerPerson)
                        : null,
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
            setFormData({ 
                phone: '', 
                motif: '', 
                message: '', 
                selectedAddress: '',
                eventDate: { day: '', month: '', year: '' },
                budgetPerPerson: '',
                numberOfGuests: ''
            });
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

    const isCollaboration = formData.motif === 'collaboration-entreprise' || formData.motif === 'collaboration-particulier';

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
                    {/* Informations automatiques si connecté */}
                    {user ? (
                        <>
                            {/* Champ Entreprise pour les professionnels */}
                            {user.type === 'entreprise' && (
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        value={user.raisonSociale || ''}
                                        disabled
                                        placeholder="Entreprise"
                                    />
                                </div>
                            )}

                            {/* Nom et Prénom séparés */}
                            <div className={styles.formRow}>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        value={user.firstName || ''}
                                        disabled
                                        placeholder="Prénom"
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        value={user.lastName || ''}
                                        disabled
                                        placeholder="Nom"
                                    />
                                </div>
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
                            {/* Champs désactivés si non connecté */}
                            {user?.type === 'entreprise' && (
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        placeholder="Entreprise"
                                        disabled
                                    />
                                </div>
                            )}
                            <div className={styles.formRow}>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        placeholder="Prénom"
                                        disabled
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        placeholder="Nom"
                                        disabled
                                    />
                                </div>
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
                        <PhoneInput
                            value={formData.phone}
                            onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                            placeholder="Téléphone (optionnel)"
                        />
                    </div>

                    {/* Choix du motif */}
                    <div className={styles.inputGroup}>
                        <select
                            value={formData.motif}
                            onChange={e => setFormData(prev => ({ ...prev, motif: e.target.value, selectedAddress: '', eventDate: { day: '', month: '', year: '' }, budgetPerPerson: '', numberOfGuests: '' }))}
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

                    {/* Sélection d'adresse pour les commandes */}
                    {formData.motif === 'commande' && user && (
                        <div className={styles.inputGroup}>
                            <select
                                value={formData.selectedAddress}
                                onChange={e => setFormData(prev => ({ ...prev, selectedAddress: e.target.value }))}
                                className={styles.select}
                                disabled={isLoadingAddresses}
                            >
                                <option value="">Sélectionner une adresse</option>
                                {addresses.map((address) => (
                                    <option key={address.id} value={address.id}>
                                        {address.name} - {address.address}, {address.postalCode} {address.city}
                                    </option>
                                ))}
                            </select>
                            {addresses.length === 0 && !isLoadingAddresses && (
                                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                                    Aucune adresse enregistrée. <a href="/compte" style={{ color: '#111', textDecoration: 'underline' }}>Ajouter une adresse</a>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Date de l'événement et Budget pour les collaborations */}
                    {isCollaboration && (
                        <>
                            <div className={styles.inputGroup}>
                                <label style={{ 
                                    fontSize: '0.9rem', 
                                    fontWeight: '500', 
                                    marginBottom: '0.5rem',
                                    display: 'block',
                                    color: '#333'
                                }}>
                                    Date de l'événement
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        placeholder="DD"
                                        maxLength={2}
                                        value={formData.eventDate.day}
                                        onChange={e => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                                            if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 31)) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    eventDate: { ...prev.eventDate, day: value }
                                                }));
                                            }
                                        }}
                                        style={{
                                            width: '60px',
                                            textAlign: 'center',
                                            padding: '1rem',
                                            border: '1px solid #d1d1d1',
                                            borderRadius: '4px',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            backgroundColor: 'white',
                                            color: '#333'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#111';
                                            e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.05)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#d1d1d1';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                    <span style={{ color: '#999', fontSize: '1rem' }}>/</span>
                                    <input
                                        type="text"
                                        placeholder="MM"
                                        maxLength={2}
                                        value={formData.eventDate.month}
                                        onChange={e => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                                            if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    eventDate: { ...prev.eventDate, month: value }
                                                }));
                                            }
                                        }}
                                        style={{
                                            width: '60px',
                                            textAlign: 'center',
                                            padding: '1rem',
                                            border: '1px solid #d1d1d1',
                                            borderRadius: '4px',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            backgroundColor: 'white',
                                            color: '#333'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#111';
                                            e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.05)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#d1d1d1';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                    <span style={{ color: '#999', fontSize: '1rem' }}>/</span>
                                    <input
                                        type="text"
                                        placeholder="YYYY"
                                        maxLength={4}
                                        value={formData.eventDate.year}
                                        onChange={e => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                            setFormData(prev => ({
                                                ...prev,
                                                eventDate: { ...prev.eventDate, year: value }
                                            }));
                                        }}
                                        style={{
                                            width: '80px',
                                            textAlign: 'center',
                                            padding: '1rem',
                                            border: '1px solid #d1d1d1',
                                            borderRadius: '4px',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            transition: 'all 0.2s',
                                            backgroundColor: 'white',
                                            color: '#333'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#111';
                                            e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.05)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#d1d1d1';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <input
                                    type="number"
                                    placeholder="Nombre d'invités"
                                    value={formData.numberOfGuests}
                                    onChange={e => setFormData(prev => ({ ...prev, numberOfGuests: e.target.value }))}
                                    min="1"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <input
                                    type="number"
                                    placeholder="Budget par personne (€)"
                                    value={formData.budgetPerPerson}
                                    onChange={e => setFormData(prev => ({ ...prev, budgetPerPerson: e.target.value }))}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </>
                    )}

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
