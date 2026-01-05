"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { signUp, signIn, authClient } from '@/lib/auth-client';
import styles from './page.module.css';

interface Address {
    id: string;
    name: string;
    address: string;
    postalCode: string;
    city: string;
    createdAt: string;
    updatedAt: string;
}

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
    
    // États pour le dashboard
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        raisonSociale: ''
    });
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressFormData, setAddressFormData] = useState({
        name: '',
        address: '',
        postalCode: '',
        city: ''
    });
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            if (isLoginView) {
                console.log('[Client] Tentative de connexion avec:', formData.email);
                const result = await signIn.email({
                    email: formData.email,
                    password: formData.password,
                    callbackURL: "/compte"
                });
                
                console.log('[Client] Résultat signIn:', result);
                
                if (result.error) {
                    console.error('[Client] Erreur signIn:', result.error);
                    const errorMsg = result.error.message || JSON.stringify(result.error);
                    
                    if (errorMsg.includes('Email not verified') || errorMsg.includes('email not verified')) {
                        setShowResend(true);
                        throw new Error('Email non vérifié, veuillez consulter votre boîte mail');
                    }
                    if (errorMsg.includes('Invalid email or password') || errorMsg.includes('invalid')) {
                        throw new Error('Email ou mot de passe invalide');
                    }
                    throw new Error(errorMsg || 'Erreur de connexion');
                }
            } else {
                const fullName = `${formData.firstName} ${formData.lastName}`;
                console.log('[Client] Tentative d\'inscription avec:', formData.email, 'Type:', accountType);
                
                const result = await signUp.email({
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
                
                console.log('[Client] Résultat signUp:', result);
                
                if (result.error) {
                    console.error('[Client] Erreur signUp:', result.error);
                    const errorMsg = result.error.message || JSON.stringify(result.error);
                    
                    if (errorMsg.includes('User already exists') || errorMsg.includes('already exists')) {
                        throw new Error('Cet email est déjà utilisé');
                    }
                    throw new Error(errorMsg || 'Erreur d\'inscription');
                }
                
                setIsLoginView(true);
                setSuccessMessage('Compte créé ! Veuillez vérifier vos emails pour valider votre compte avant de vous connecter.');
            }
        } catch (err: any) {
            console.error('[Client] Exception capturée:', err);
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

    // Charger les adresses au montage
    useEffect(() => {
        if (user) {
            loadAddresses();
            if (!isEditing) {
                setEditFormData({
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    phone: user.phone || '',
                    raisonSociale: user.raisonSociale || ''
                });
            }
        }
    }, [user]);

    const loadAddresses = async () => {
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

    const handleEditProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData)
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de la mise à jour');
            }
            
            setIsEditing(false);
            setSuccessMessage('Profil mis à jour avec succès');
            setTimeout(() => setSuccessMessage(''), 3000);
            
            // Recharger la page pour afficher les nouvelles données
            window.location.reload();
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la mise à jour');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingAddress(true);
        setError('');
        
        try {
            const response = await fetch('/api/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addressFormData)
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de l\'ajout de l\'adresse');
            }
            
            const data = await response.json();
            setAddresses([...addresses, data.address]);
            setAddressFormData({ name: '', address: '', postalCode: '', city: '' });
            setShowAddressModal(false);
            setSuccessMessage('Adresse ajoutée avec succès');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de l\'ajout de l\'adresse');
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) return;
        
        try {
            const response = await fetch(`/api/addresses?id=${addressId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de la suppression');
            }
            
            setAddresses(addresses.filter(addr => addr.id !== addressId));
            setSuccessMessage('Adresse supprimée avec succès');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la suppression');
        }
    };

    if (user) {
        return (
            <div className={styles.container}>
                <div className={styles.dashboard}>
                    {successMessage && <div className={styles.success}>{successMessage}</div>}
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.dashboardGrid}>
                        {/* Section Informations personnelles - Gauche */}
                        <div className={styles.personalInfoSection}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Informations personnelles</h2>
                                {!isEditing && (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className={styles.editButton}
                                    >
                                        Modifier
                                    </button>
                                )}
                            </div>
                            
                            {isEditing ? (
                                <form onSubmit={handleEditProfile} className={styles.editForm}>
                                    <div className={styles.formRow}>
                                        <div className={styles.inputGroup}>
                                            <label>Prénom</label>
                                            <input
                                                type="text"
                                                value={editFormData.firstName}
                                                onChange={e => setEditFormData({ ...editFormData, firstName: e.target.value })}
                                                className={styles.editInput}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Nom</label>
                                            <input
                                                type="text"
                                                value={editFormData.lastName}
                                                onChange={e => setEditFormData({ ...editFormData, lastName: e.target.value })}
                                                className={styles.editInput}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className={styles.inputGroup}>
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            disabled
                                            className={styles.editInput}
                                        />
                                        <small className={styles.inputHint}>L&apos;email ne peut pas être modifié</small>
                                    </div>
                                    
                                    <div className={styles.inputGroup}>
                                        <label>Téléphone</label>
                                        <input
                                            type="tel"
                                            value={editFormData.phone}
                                            onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                                            className={styles.editInput}
                                            placeholder="+33 6 12 34 56 78"
                                        />
                                    </div>
                                    
                                    {user.type === 'entreprise' && (
                                        <div className={styles.inputGroup}>
                                            <label>Raison Sociale</label>
                                            <input
                                                type="text"
                                                value={editFormData.raisonSociale}
                                                onChange={e => setEditFormData({ ...editFormData, raisonSociale: e.target.value })}
                                                className={styles.editInput}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className={styles.formActions}>
                                        <button 
                                            type="button" 
                                            onClick={() => setIsEditing(false)}
                                            className={styles.cancelButton}
                                        >
                                            Annuler
                                        </button>
                                        <button 
                                            type="submit" 
                                            className={styles.saveButton}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className={styles.profileInfo}>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Type de compte</span>
                                        <span className={styles.infoValue}>
                                            {user.type === 'entreprise' ? 'Professionnel' : 'Particulier'}
                                        </span>
                                    </div>
                                    {user.type === 'entreprise' && user.raisonSociale && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Raison Sociale</span>
                                            <span className={styles.infoValue}>{user.raisonSociale}</span>
                                        </div>
                                    )}
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Nom complet</span>
                                        <span className={styles.infoValue}>
                                            {user.firstName && user.lastName 
                                                ? `${user.firstName} ${user.lastName}`
                                                : user.name}
                                        </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Email</span>
                                        <span className={styles.infoValue}>{user.email}</span>
                                    </div>
                                    {user.phone && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Téléphone</span>
                                            <span className={styles.infoValue}>{user.phone}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Section Adresses - Droite */}
                        <div className={styles.addressesSection}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Adresses</h2>
                                <button 
                                    onClick={() => setShowAddressModal(true)}
                                    className={styles.addAddressButton}
                                >
                                    + Ajouter une adresse
                                </button>
                            </div>
                            
                            {isLoadingAddresses ? (
                                <p className={styles.empty}>Chargement...</p>
                            ) : addresses.length === 0 ? (
                                <p className={styles.empty}>Aucune adresse enregistrée</p>
                            ) : (
                                <div className={styles.addressesList}>
                                    {addresses.map((address) => (
                                        <div key={address.id} className={styles.addressCard}>
                                            <div className={styles.addressContent}>
                                                <h3 className={styles.addressName}>{address.name}</h3>
                                                <p className={styles.addressDetails}>
                                                    {address.address}<br />
                                                    {address.postalCode} {address.city}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteAddress(address.id)}
                                                className={styles.deleteAddressButton}
                                                title="Supprimer"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section Commandes - Pleine largeur */}
                    <div className={styles.premiumCard}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Commandes</h2>
                        </div>
                        <div className={styles.ordersGallery}>
                            <p className={styles.empty}>Vous n&apos;avez pas encore passé de commande.</p>
                        </div>
                    </div>

                    <button onClick={logout} className={styles.logoutButton}>Se déconnecter</button>
                </div>

                {/* Modal Ajout d'adresse */}
                {showAddressModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowAddressModal(false)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Ajouter une adresse</h2>
                                <button 
                                    onClick={() => setShowAddressModal(false)}
                                    className={styles.modalClose}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <form onSubmit={handleAddAddress} className={styles.addressForm}>
                                <div className={styles.inputGroup}>
                                    <label>Nom de l&apos;adresse</label>
                                    <input
                                        type="text"
                                        required
                                        value={addressFormData.name}
                                        onChange={e => setAddressFormData({ ...addressFormData, name: e.target.value })}
                                        className={styles.modalInput}
                                        placeholder="Ex: Domicile, Bureau, etc."
                                    />
                                </div>
                                
                                <div className={styles.inputGroup}>
                                    <label>Adresse</label>
                                    <input
                                        type="text"
                                        required
                                        value={addressFormData.address}
                                        onChange={e => setAddressFormData({ ...addressFormData, address: e.target.value })}
                                        className={styles.modalInput}
                                        placeholder="Numéro et nom de rue"
                                    />
                                </div>
                                
                                <div className={styles.formRow}>
                                    <div className={styles.inputGroup}>
                                        <label>Code postal</label>
                                        <input
                                            type="text"
                                            required
                                            value={addressFormData.postalCode}
                                            onChange={e => setAddressFormData({ ...addressFormData, postalCode: e.target.value })}
                                            className={styles.modalInput}
                                            placeholder="75001"
                                        />
                                    </div>
                                    <div className={styles.inputGroup}>
                                        <label>Ville</label>
                                        <input
                                            type="text"
                                            required
                                            value={addressFormData.city}
                                            onChange={e => setAddressFormData({ ...addressFormData, city: e.target.value })}
                                            className={styles.modalInput}
                                            placeholder="Paris"
                                        />
                                    </div>
                                </div>
                                
                                <div className={styles.modalActions}>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowAddressModal(false)}
                                        className={styles.cancelButton}
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={styles.saveButton}
                                        disabled={isSavingAddress}
                                    >
                                        {isSavingAddress ? 'Ajout...' : 'Ajouter'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
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
                        <>
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
                        </>
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
