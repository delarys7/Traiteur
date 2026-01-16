
"use client";

import { useRef, useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import PhoneInput from '@/components/PhoneInput';
import styles from '../compte/page.module.css';
import { useLanguage } from '@/context/LanguageContext';

interface Address {
    id: string;
    name: string;
    address: string;
    postalCode: string;
    city: string;
}

export default function Contact() {
    const { t } = useLanguage();
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { items, total, removeFromCart, clearCart } = useCart();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        motif: '',
        message: '',
        selectedAddress: '',
        eventDate: { day: '', month: '', year: '' },
        budgetPerPerson: '',
        numberOfGuests: '',
        manualAddress: '',
        manualPostalCode: '',
        manualCity: '',
        restaurantName: '',
        kitchenStaff: ''
    });
    const [isManualAddress, setIsManualAddress] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Vérifier si on vient du panier ou avec un motif pré-sélectionné
    useEffect(() => {
        const fromCart = searchParams.get('from') === 'cart';
        const motifParam = searchParams.get('motif');
        
        if (fromCart) {
            setFormData(prev => ({ ...prev, motif: 'commande' }));
        } else if (motifParam) {
            // Valider que le motif est valide
            const validMotifs = ['commande', 'collaboration-entreprise', 'collaboration-particulier', 'prestation-domicile', 'consulting', 'autre'];
            if (validMotifs.includes(motifParam)) {
                setFormData(prev => ({ ...prev, motif: motifParam }));
            }
        }
    }, [searchParams]);

    // Charger les adresses si l'utilisateur est connecté et que le motif requiert une adresse
    // Et initialiser les données utilisateur
    useEffect(() => {
        if (user) {
            const isCollaboration = formData.motif === 'collaboration-entreprise' || formData.motif === 'collaboration-particulier';
            const requiresAddress = formData.motif === 'commande' || isCollaboration || formData.motif === 'prestation-domicile' || formData.motif === 'consulting';
            if (requiresAddress) {
                loadAddresses();
            }
            // Pré-remplir les données utilisateur si non déjà remplies
            setFormData(prev => ({
                ...prev,
                firstName: prev.firstName || user.firstName || '',
                lastName: prev.lastName || user.lastName || '',
                email: prev.email || user.email || '',
                phone: prev.phone || user.phone || '',
                company: prev.company || user.raisonSociale || ''
            }));
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
        const isCollaboration = formData.motif === 'collaboration-entreprise' || formData.motif === 'collaboration-particulier';
        
        if (isCollaboration) {
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
                    firstName: formData.firstName || user.firstName || '',
                    lastName: formData.lastName || user.lastName || '',
                    entreprise: formData.company || (user.type === 'entreprise' ? user.raisonSociale : null),
                    email: formData.email || user.email,
                    phone: formData.phone || null,
                    motif: formData.motif,
                    message: formData.message,
                    selectedAddress: (formData.motif === 'commande' || isCollaboration || formData.motif === 'prestation-domicile' || formData.motif === 'consulting') ? formData.selectedAddress : null,
                    manualAddress: isManualAddress ? formData.manualAddress : null,
                    manualPostalCode: isManualAddress ? formData.manualPostalCode : null,
                    manualCity: isManualAddress ? formData.manualCity : null,
                    restaurantName: (formData.motif === 'consulting' && isManualAddress) ? formData.restaurantName : null,
                    kitchenStaff: (formData.motif === 'consulting' && isManualAddress) ? formData.kitchenStaff : null,
                    eventDate: (isCollaboration) 
                        ? `${formData.eventDate.year}-${formData.eventDate.month.padStart(2, '0')}-${formData.eventDate.day.padStart(2, '0')}`
                        : null,
                    numberOfGuests: (isCollaboration)
                        ? parseInt(formData.numberOfGuests)
                        : null,
                    budgetPerPerson: (isCollaboration)
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

            // Si c'était une commande, vider le panier
            if (formData.motif === 'commande') {
                clearCart();
            }

            // Succès
            setShowToast(true);
            setFormData({ 
                firstName: '',
                lastName: '',
                email: '',
                phone: '', 
                company: '',
                motif: '', 
                message: '', 
                selectedAddress: '',
                eventDate: { day: '', month: '', year: '' },
                budgetPerPerson: '',
                numberOfGuests: '',
                manualAddress: '',
                manualPostalCode: '',
                manualCity: '',
                restaurantName: '',
                kitchenStaff: ''
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
                    <h1 className={styles.authTitle}>{t('contact.loading')}</h1>
                </div>
            </div>
        );
    }

    const isCollaboration = formData.motif === 'collaboration-entreprise' || formData.motif === 'collaboration-particulier';

    return (
        <div className={styles.container}>
            <div className={styles.authBox}>
                <h1 className={styles.authTitle}>{t('contact.title')}</h1>

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
                    }}                    >
                        ⚠️ {t('contact.must_login')} <a href="/compte" style={{ color: '#8a6d3b', textDecoration: 'underline' }}>{t('contact.login_link')}</a>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Informations automatiques si connecté */}
                    {/* Informations automatiques si connecté (mais modifiables) */}
                    {user ? (
                        <>
                            {/* Champ Entreprise pour les professionnels */}
                            {user.type === 'entreprise' && (
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                                        placeholder={t('contact.company')}
                                        required
                                    />
                                </div>
                            )}

                            {/* Nom et Prénom séparés */}
                            <div className={styles.formRow}>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        placeholder={t('contact.firstname')}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        placeholder={t('contact.lastname')}
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder={t('contact.email')}
                                    required
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Champs désactivés si non connecté */}
                            <div className={styles.formRow}>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        placeholder={t('contact.firstname')}
                                        disabled
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        placeholder={t('contact.lastname')}
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
                            placeholder={t('contact.phone')}
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
                            <option value="">{t('contact.reason')}</option>
                            <option value="commande">{t('contact.reasons.order')}</option>
                            <option value="collaboration-entreprise">{t('contact.reasons.collab_company')}</option>
                            <option value="collaboration-particulier">{t('contact.reasons.collab_individual')}</option>
                            <option value="prestation-domicile">{t('contact.reasons.prestation_domicile')}</option>
                            <option value="consulting">{t('contact.reasons.consulting')}</option>
                            <option value="autre">{t('contact.reasons.other')}</option>
                        </select>
                    </div>


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
                                    {t('contact.event_date')}
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

                        </>
                    )}

                    {/* Adresse de l'événement / Lieu de livraison */}
                    {(isCollaboration || formData.motif === 'commande' || formData.motif === 'prestation-domicile' || formData.motif === 'consulting') && user && (
                                <div className={styles.inputGroup}>
                                    {/* Toggle between Dropdown and Manual Entry */}
                                    {!isManualAddress ? (
                                        <>
                                            <select
                                                value={formData.selectedAddress}
                                                onChange={e => setFormData(prev => ({ ...prev, selectedAddress: e.target.value }))}
                                                className={styles.select}
                                                disabled={isLoadingAddresses}
                                                required={!isManualAddress}
                                            >
                                                <option value="">{t('contact.select_address')}</option>
                                                {addresses.map((address) => (
                                                    <option key={address.id} value={address.id}>
                                                        {address.name} - {address.address}, {address.postalCode} {address.city}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsManualAddress(true);
                                                    setFormData(prev => ({ ...prev, selectedAddress: '' })); // Clear selection
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#666',
                                                    textDecoration: 'underline',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    marginTop: '0.5rem',
                                                    padding: 0
                                                }}
                                            >
                                                {t('contact.manual_address_link')}
                                            </button>
                                        </>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {/* Champs supplémentaires pour Consulting en mode manuel */}
                                            {formData.motif === 'consulting' && isManualAddress && (
                                                <input
                                                    type="text"
                                                    placeholder={t('contact.restaurant_name')}
                                                    value={formData.restaurantName}
                                                    onChange={e => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                                                    className={styles.input}
                                                    required={isManualAddress}
                                                />
                                            )}
                                            {/* Manual Address Fields */}
                                            <input
                                                type="text"
                                                placeholder={t('contact.address_street')}
                                                value={formData.manualAddress}
                                                onChange={e => setFormData(prev => ({ ...prev, manualAddress: e.target.value }))}
                                                className={styles.input}
                                                required={isManualAddress}
                                            />
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                                <input
                                                    type="text"
                                                    placeholder={t('contact.postal_code')}
                                                    value={formData.manualPostalCode}
                                                    onChange={e => setFormData(prev => ({ ...prev, manualPostalCode: e.target.value }))}
                                                    className={styles.input}
                                                    required={isManualAddress}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder={t('contact.city')}
                                                    value={formData.manualCity}
                                                    onChange={e => setFormData(prev => ({ ...prev, manualCity: e.target.value }))}
                                                    className={styles.input}
                                                    required={isManualAddress}
                                                />
                                            </div>
                                            {/* Champ supplémentaire pour Consulting en mode manuel */}
                                            {formData.motif === 'consulting' && isManualAddress && (
                                                <input
                                                    type="number"
                                                    placeholder={t('contact.kitchen_staff')}
                                                    value={formData.kitchenStaff}
                                                    onChange={e => setFormData(prev => ({ ...prev, kitchenStaff: e.target.value }))}
                                                    className={styles.input}
                                                    min="0"
                                                    required={isManualAddress}
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setIsManualAddress(false)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#666',
                                                    textDecoration: 'underline',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    alignSelf: 'flex-start',
                                                    padding: 0
                                                }}
                                            >
                                                {t('contact.back_to_select')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isCollaboration && (
                                <>
                                    <div className={styles.inputGroup}>
                                <input
                                    type="number"
                                    placeholder={t('contact.guests')}
                                    value={formData.numberOfGuests}
                                    onChange={e => setFormData(prev => ({ ...prev, numberOfGuests: e.target.value }))}
                                    min="1"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <input
                                    type="number"
                                    placeholder={t('contact.budget')}
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
                        <div className={styles.inputGroup}>
                            <label style={{ 
                                fontSize: '0.9rem', 
                                fontWeight: '500', 
                                marginTop: '0.5rem',
                                display: 'block',
                                color: '#333',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {t('contact.products')}
                            </label>
                            <div style={{
                                backgroundColor: '#fcfcfc',
                                border: '1px solid #e0e0e0',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '0.5rem'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {(() => {
                                        const groups = {
                                            [t('cart.groups.buffets')]: items.filter(i => i.category?.toLowerCase() === 'buffet'),
                                            [t('cart.groups.plateaux')]: items.filter(i => i.category?.toLowerCase() === 'plateau'),
                                            [t('cart.groups.cocktails')]: items.filter(i => i.category?.toLowerCase() === 'cocktail'),
                                            [t('cart.groups.boutique')]: items.filter(i => i.category?.toLowerCase() === 'boutique'),
                                            [t('cart.groups.autres')]: items.filter(i => !['buffet', 'plateau', 'cocktail', 'boutique'].includes(i.category?.toLowerCase() || ''))
                                        };

                                        return Object.entries(groups).map(([groupName, groupItems]) => {
                                            if (groupItems.length === 0) return null;

                                            const sortedItems = [...groupItems].sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity));

                                            return (
                                                <div key={groupName}>
                                                    <h4 style={{ 
                                                        fontSize: '0.95rem', 
                                                        fontWeight: '600', 
                                                        margin: '0 0 0.75rem 0',
                                                        color: '#111',
                                                        textTransform: 'uppercase',
                                                        borderBottom: '1px solid #eee',
                                                        paddingBottom: '0.25rem',
                                                        display: 'inline-block'
                                                    }}>
                                                        {groupName}
                                                    </h4>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {sortedItems.map((item) => (
                                                            <div key={item.id} style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                fontSize: '0.9rem'
                                                            }}>
                                                                <span style={{ fontWeight: '500' }}>{t('product.names.' + (item.name?.trim() || ''))}</span>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                    <span style={{ color: '#666' }}>
                                                                        {item.quantity} × {item.price.toFixed(2)} €
                                                                    </span>
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => removeFromCart(item.id)}
                                                                        style={{
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            cursor: 'pointer',
                                                                            padding: '2px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            color: '#999',
                                                                            transition: 'color 0.2s'
                                                                        }}
                                                                        onMouseOver={(e) => e.currentTarget.style.color = '#ff4d4d'}
                                                                        onMouseOut={(e) => e.currentTarget.style.color = '#999'}
                                                                        title={t('contact.remove_from_cart')}
                                                                    >
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                                <div style={{
                                    marginTop: '1rem',
                                    paddingTop: '0.75rem',
                                    borderTop: '1px solid #eee',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontWeight: '600',
                                    fontSize: '0.95rem'
                                }}>
                                    <span>{t('contact.total')}</span>
                                    <span>{total.toFixed(2)} €</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Message descriptif */}
                    <div className={styles.inputGroup}>
                        <textarea
                            placeholder={t('contact.message')}
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
                        {isSubmitting ? t('contact.sending') : !user ? t('contact.connect_to_send') : t('contact.submit')}
                    </button>
                </form>
            </div>

            {/* Toast de succès */}
            {showToast && (
                <div className={styles.toast}>
                    {t('contact.success')}
                </div>
            )}
        </div>
    );
}
