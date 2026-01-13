"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signUp, signIn, authClient } from '@/lib/auth-client';
import PhoneInput from '@/components/PhoneInput';
import { useLanguage } from '@/context/LanguageContext';
import styles from './page.module.css';
import OrderCard, { Order } from '@/components/OrderCard';
import ReviewModal from '@/components/ReviewModal';



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
    const router = useRouter();
    const { t } = useLanguage();
    // État local pour l'affichage des données utilisateur (mis à jour immédiatement)
    const [displayUser, setDisplayUser] = useState(user || null);
    const [isLoginView, setIsLoginView] = useState(true);
    const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
    const [accountType, setAccountType] = useState<'particulier' | 'entreprise'>('particulier');
    const [resetEmail, setResetEmail] = useState('');
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
    const [isResending, setIsResending] = useState(false);
    const [showResend, setShowResend] = useState(false);
    
    // États pour le dashboard
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        raisonSociale: '',
        allergies: ''
    });
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addressFormData, setAddressFormData] = useState({
        name: '',
        address: '',
        postalCode: '',
        city: ''
    });
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);


    const galleryRef = useRef<HTMLDivElement>(null);

    const scrollGallery = (direction: 'left' | 'right') => {
        if (galleryRef.current) {
            const scrollAmount = 350;
            galleryRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const sortedOrders = [...orders].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
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
                        throw new Error(t('account.error_email_not_verified'));
                    }
                    if (errorMsg.includes('Invalid email or password') || errorMsg.includes('invalid')) {
                        throw new Error(t('account.error_invalid_credentials'));
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
                        throw new Error(t('account.error_user_exists'));
                    }
                    throw new Error(errorMsg || 'Erreur d\'inscription');
                }
                
                setIsLoginView(true);
                setToastMessage(t('account.account_created'));
                setShowToast(true);
                setTimeout(() => setShowToast(false), 5000);
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
            if (resendError) throw new Error(resendError.message || t('common.error'));
            setToastMessage(t('account.verification_sent'));
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setShowResend(false);
        } catch (err: any) {
            setError(err.message || t('common.error'));
        } finally {
            setIsResending(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: resetEmail,
                    callbackURL: window.location.origin + '/compte'
                })
            });

            // Vérifier le content-type avant de parser
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(text || 'Erreur lors de l\'envoi de l\'email de réinitialisation');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'envoi de l\'email de réinitialisation');
            }

            setError('');
            setToastMessage(t('account.reset_email_sent'));
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                setIsForgotPasswordView(false);
                setResetEmail('');
            }, 3000);
        } catch (err: any) {
            console.error('[Client] Erreur forgot-password:', err);
            setError(err.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Synchroniser displayUser avec user du contexte
    useEffect(() => {
        if (user) {
            setDisplayUser(user);
        }
    }, [user]);

    // Charger les adresses au montage
    useEffect(() => {
        if (user) {
            loadAddresses();
            loadOrders();
            if (!isEditing) {
                const currentUser = displayUser || user;
                setEditFormData({
                    firstName: currentUser.firstName || '',
                    lastName: currentUser.lastName || '',
                    phone: currentUser.phone || '',
                    raisonSociale: currentUser.raisonSociale || '',
                    allergies: currentUser.allergies || ''
                });
            }
        }
    }, [user, displayUser]);

    const loadOrders = async () => {
        setIsLoadingOrders(true);
        try {
            console.log('[AccountPage] Loading orders...');
            const response = await fetch('/api/orders');
            if (response.ok) {
                const data = await response.json();
                console.log('[AccountPage] Orders loaded:', data.orders);
                setOrders(data.orders || []);
            } else {
                console.error('[AccountPage] Failed to fetch orders:', response.status);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des commandes:', error);
        } finally {
            setIsLoadingOrders(false);
        }
    };


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

    const resetEditForm = () => {
        const currentUser = displayUser || user;
        if (currentUser) {
            setEditFormData({
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                phone: currentUser.phone || '',
                raisonSociale: currentUser.raisonSociale || '',
                allergies: currentUser.allergies || ''
            });
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
            
            const data = await response.json();
            console.log('[Client] Profil mis à jour:', data);
            
            // Mettre à jour immédiatement l'affichage avec les nouvelles données
            if (data.user) {
                const currentUser = displayUser || user;
                if (currentUser) {
                    setDisplayUser({
                        ...currentUser,
                        firstName: data.user.firstName !== undefined ? data.user.firstName : currentUser.firstName,
                        lastName: data.user.lastName !== undefined ? data.user.lastName : currentUser.lastName,
                        phone: data.user.phone !== undefined ? data.user.phone : currentUser.phone,
                        raisonSociale: data.user.raisonSociale !== undefined ? data.user.raisonSociale : currentUser.raisonSociale,
                        allergies: data.user.allergies !== undefined ? data.user.allergies : currentUser.allergies
                    });
                }
            }
            
            // Mettre à jour editFormData avec les nouvelles valeurs
            setEditFormData({
                firstName: data.user?.firstName || editFormData.firstName,
                lastName: data.user?.lastName || editFormData.lastName,
                phone: data.user?.phone || editFormData.phone,
                raisonSociale: data.user?.raisonSociale || editFormData.raisonSociale,
                allergies: data.user?.allergies || editFormData.allergies
            });
            
            setIsEditing(false);
            setToastMessage(t('account.profile_updated'));
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la mise à jour');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddressId(address.id);
        setAddressFormData({
            name: address.name,
            address: address.address,
            postalCode: address.postalCode,
            city: address.city
        });
        setShowAddressModal(true);
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingAddress(true);
        setError('');
        
        try {
            const isEditing = editingAddressId !== null;
            const url = isEditing ? '/api/addresses' : '/api/addresses';
            const method = isEditing ? 'PUT' : 'POST';
            const body = isEditing 
                ? { id: editingAddressId, ...addressFormData }
                : addressFormData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Erreur lors de ${isEditing ? 'la modification' : 'l\'ajout'} de l'adresse`);
            }
            
            const data = await response.json();
            
            if (isEditing) {
                setAddresses(addresses.map(addr => 
                    addr.id === editingAddressId ? data.address : addr
                ));
                setToastMessage(t('account.address_modified'));
            } else {
                setAddresses([...addresses, data.address]);
                setToastMessage(t('account.address_added'));
            }
            
            setAddressFormData({ name: '', address: '', postalCode: '', city: '' });
            setEditingAddressId(null);
            setShowAddressModal(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la sauvegarde de l\'adresse');
        } finally {
            setIsSavingAddress(false);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!confirm(t('account.delete_address_confirm'))) return;
        
        try {
            const response = await fetch(`/api/addresses?id=${addressId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de la suppression');
            }
            
            setAddresses(addresses.filter(addr => addr.id !== addressId));
            setToastMessage(t('account.address_deleted'));
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la suppression');
        }
    };

    if (user) {
        return (
            <div className={styles.container}>
                <div className={styles.dashboard}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.dashboardGrid}>
                        {/* Section Informations personnelles - Gauche */}
                        <div className={styles.personalInfoSection}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>{t('account.personal_info')}</h2>
                                {!isEditing && (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className={styles.editButton}
                                    >
                                        {t('account.edit')}
                                    </button>
                                )}
                            </div>
                            
                            {isEditing ? (
                                <form onSubmit={handleEditProfile} className={styles.editForm}>
                                    <div className={styles.formRow}>
                                        <div className={styles.inputGroup}>
                                            <label>{t('account.firstname')}</label>
                                            <input
                                                type="text"
                                                value={editFormData.firstName}
                                                onChange={e => setEditFormData({ ...editFormData, firstName: e.target.value })}
                                                className={styles.editInput}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>{t('account.lastname')}</label>
                                            <input
                                                type="text"
                                                value={editFormData.lastName}
                                                onChange={e => setEditFormData({ ...editFormData, lastName: e.target.value })}
                                                className={styles.editInput}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className={styles.inputGroup}>
                                        <label>{t('account.email')}</label>
                                        <input
                                            type="email"
                                            value={displayUser?.email || user?.email || ''}
                                            disabled
                                            className={styles.editInput}
                                        />
                                        <small className={styles.inputHint}>{t('account.email_cannot_edit')}</small>
                                    </div>
                                    
                                    <div className={styles.inputGroup}>
                                        <label>{t('account.phone')}</label>
                                        <PhoneInput
                                            value={editFormData.phone}
                                            onChange={(value: string) => setEditFormData({ ...editFormData, phone: value })}
                                        />
                                    </div>
                                    
                                    {(displayUser?.type || user?.type) === 'entreprise' && (
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
                                    
                                    <div className={styles.inputGroup}>
                                        <label>{t('account.allergies')}</label>
                                        <div className={styles.allergiesContainer}>
                                            <div className={styles.selectedTags}>
                                                {editFormData.allergies.split(',').filter(Boolean).map((allergy) => (
                                                    <span key={allergy} className={styles.allergyTag}>
                                                        {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newAllergies = editFormData.allergies
                                                                    .split(',')
                                                                    .filter(a => a !== allergy)
                                                                    .join(',');
                                                                setEditFormData({ ...editFormData, allergies: newAllergies });
                                                            }}
                                                            className={styles.removeTag}
                                                        >
                                                            ×
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <select
                                                value=""
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value && !editFormData.allergies.split(',').includes(value)) {
                                                        const newAllergies = editFormData.allergies 
                                                            ? `${editFormData.allergies},${value}`
                                                            : value;
                                                        setEditFormData({ ...editFormData, allergies: newAllergies });
                                                    }
                                                }}
                                                className={styles.select}
                                                style={{ padding: '0.9rem', width: '100%', backgroundColor: '#fafafa', borderRadius: '4px', border: '1px solid #ddd' }}
                                            >
                                                <option value="">{t('account.add_allergy')}</option>
                                                {['gluten', 'lactose', 'fruits à coque', 'crustacés', 'sésame']
                                                    .filter(a => !editFormData.allergies.split(',').includes(a))
                                                    .map(opt => (
                                                        <option key={opt} value={opt}>
                                                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    <div className={styles.formActions}>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                resetEditForm();
                                                setIsEditing(false);
                                            }}
                                            className={styles.cancelButton}
                                        >
                                            {t('account.cancel')}
                                        </button>
                                        <button 
                                            type="submit" 
                                            className={styles.saveButton}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? t('account.saving') : t('account.save')}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className={styles.profileInfo}>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>{t('account.account_type')}</span>
                                        <span className={styles.infoValue}>
                                            {(displayUser?.type || user?.type) === 'entreprise' ? t('account.professionnel') : t('account.particulier')}
                                        </span>
                                    </div>
                                    {(displayUser?.type || user?.type) === 'entreprise' && (displayUser?.raisonSociale || user?.raisonSociale) && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Raison Sociale</span>
                                            <span className={styles.infoValue}>{displayUser?.raisonSociale || user?.raisonSociale}</span>
                                        </div>
                                    )}
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>{t('account.full_name')}</span>
                                        <span className={styles.infoValue}>
                                            {(displayUser?.firstName || user?.firstName) && (displayUser?.lastName || user?.lastName)
                                                ? `${displayUser?.firstName || user?.firstName} ${displayUser?.lastName || user?.lastName}`
                                                : displayUser?.name || user?.name}
                                        </span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>{t('account.email')}</span>
                                        <span className={styles.infoValue}>{displayUser?.email || user?.email}</span>
                                    </div>
                                    {(displayUser?.phone || user?.phone) && (
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>{t('account.phone')}</span>
                                            <span className={styles.infoValue}>{displayUser?.phone || user?.phone}</span>
                                        </div>
                                    )}
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>{t('account.allergies')}</span>
                                        <span className={styles.infoValue}>
                                            {(displayUser?.allergies || user?.allergies) ? (
                                                <div className={styles.displayTags}>
                                                    {(displayUser?.allergies || user?.allergies || '').split(',').filter(Boolean).map((allergy: string) => (
                                                        <span key={allergy} className={styles.displayTag}>
                                                            {allergy.charAt(0).toUpperCase() + allergy.slice(1)}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : '-'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section Adresses - Droite */}
                        <div className={styles.addressesSection}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>{t('account.addresses')}</h2>
                                <button 
                                    onClick={() => setShowAddressModal(true)}
                                    className={styles.addAddressButton}
                                >
                                    {t('account.add_address')}
                                </button>
                            </div>
                            
                            {isLoadingAddresses ? (
                                <p className={styles.empty}>{t('account.loading_addresses')}</p>
                            ) : addresses.length === 0 ? (
                                <p className={styles.empty}>{t('account.no_address')}</p>
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
                                            <div className={styles.addressActions}>
                                                <button 
                                                    onClick={() => handleEditAddress(address)}
                                                    className={styles.editAddressButton}
                                                    title="Modifier"
                                                >
                                                    ✎
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteAddress(address.id)}
                                                    className={styles.deleteAddressButton}
                                                    title="Supprimer"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section Commandes - Pleine largeur */}
                    <div className={styles.premiumCard}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>{t('account.orders')}</h2>
                        </div>
                        <div className={styles.galleryWrapper}>
                            <button 
                                className={`${styles.scrollArrow} ${styles.leftArrow}`}
                                onClick={() => scrollGallery('left')}
                            >
                                ‹
                            </button>
                            <div className={styles.ordersGallery} ref={galleryRef}>
                                {isLoadingOrders ? (
                                    <p className={styles.empty}>{t('account.loading')}</p>
                                ) : sortedOrders.length === 0 ? (
                                    <p className={styles.empty}>{t('account.no_orders')}</p>
                                ) : (
                                    sortedOrders.map(order => (
                                        <OrderCard 
                                            key={order.id} 
                                            order={order} 
                                            onLeaveReview={(ord) => {
                                                setSelectedOrder(ord);
                                                setShowReviewModal(true);
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                            <button 
                                className={`${styles.scrollArrow} ${styles.rightArrow}`}
                                onClick={() => scrollGallery('right')}
                            >
                                ›
                            </button>
                        </div>

                    </div>

                    <button onClick={logout} className={styles.logoutButton}>{t('account.logout')}</button>
                </div>

                {/* Toast Notification */}
                {showToast && (
                    <div className={styles.toast}>
                        {toastMessage}
                    </div>
                )}

                {/* Modal Ajout/Modification d'adresse */}
                {showAddressModal && (
                    <div className={styles.modalOverlay} onClick={() => {
                        setShowAddressModal(false);
                        setEditingAddressId(null);
                        setAddressFormData({ name: '', address: '', postalCode: '', city: '' });
                    }}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>{editingAddressId ? t('account.edit_address') : t('account.add_address_modal')}</h2>
                                <button 
                                    onClick={() => {
                                        setShowAddressModal(false);
                                        setEditingAddressId(null);
                                        setAddressFormData({ name: '', address: '', postalCode: '', city: '' });
                                    }}
                                    className={styles.modalClose}
                                >
                                    ×
                                </button>
                            </div>
                            
                            <form onSubmit={handleSaveAddress} className={styles.addressForm}>
                                <div className={styles.inputGroup}>
                                    <label>{t('account.address_name')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={addressFormData.name}
                                        onChange={e => setAddressFormData({ ...addressFormData, name: e.target.value })}
                                        className={styles.modalInput}
                                        placeholder={t('account.address_name_placeholder')}
                                    />
                                </div>
                                
                                <div className={styles.inputGroup}>
                                    <label>{t('account.address_street')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={addressFormData.address}
                                        onChange={e => setAddressFormData({ ...addressFormData, address: e.target.value })}
                                        className={styles.modalInput}
                                        placeholder={t('account.address_street_placeholder')}
                                    />
                                </div>
                                
                                <div className={styles.formRow}>
                                    <div className={styles.inputGroup}>
                                        <label>{t('account.postal_code')}</label>
                                        <input
                                            type="text"
                                            required
                                            value={addressFormData.postalCode}
                                            onChange={e => setAddressFormData({ ...addressFormData, postalCode: e.target.value })}
                                            className={styles.modalInput}
                                            placeholder={t('account.postal_code_placeholder')}
                                        />
                        </div>
                                    <div className={styles.inputGroup}>
                                        <label>{t('account.city')}</label>
                                        <input
                                            type="text"
                                            required
                                            value={addressFormData.city}
                                            onChange={e => setAddressFormData({ ...addressFormData, city: e.target.value })}
                                            className={styles.modalInput}
                                            placeholder={t('account.city_placeholder')}
                                        />
                        </div>
                    </div>
                                
                                <div className={styles.modalActions}>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowAddressModal(false)}
                                        className={styles.cancelButton}
                                    >
                                        {t('account.cancel')}
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={styles.saveButton}
                                        disabled={isSavingAddress}
                                    >
                                        {isSavingAddress 
                                            ? (editingAddressId ? t('account.modifying') : t('account.adding')) 
                                            : (editingAddressId ? t('account.modify') : t('account.add_address'))}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {showReviewModal && selectedOrder && (
                    <ReviewModal 
                        order={selectedOrder}
                        onClose={() => setShowReviewModal(false)}
                        onSuccess={() => {
                            setToastMessage(t('account.review.success'));
                            setShowToast(true);
                            setTimeout(() => setShowToast(false), 3000);
                            loadOrders();
                        }}
                    />
                )}
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.authBox}>
                <h1 className={styles.authTitle}>
                    {isForgotPasswordView ? t('account.forgot_password') : (isLoginView ? t('account.login') : t('account.register'))}
                </h1>

                {isForgotPasswordView ? (
                    <>
                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleForgotPassword} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <input
                                    type="email"
                                    required
                                    placeholder="Email"
                                    value={resetEmail}
                                    onChange={e => setResetEmail(e.target.value)}
                                />
                            </div>

                            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                                {isSubmitting ? t('account.sending') : t('account.reset_password')}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        {!isLoginView && (
                            <div className={styles.typeToggle}>
                                <button 
                                    type="button"
                                    className={`${styles.typeButton} ${accountType === 'particulier' ? styles.typeButtonActive : ''}`}
                                    onClick={() => setAccountType('particulier')}
                                >
                                    {t('account.particulier')}
                                </button>
                                <button 
                                    type="button"
                                    className={`${styles.typeButton} ${accountType === 'entreprise' ? styles.typeButtonActive : ''}`}
                                    onClick={() => setAccountType('entreprise')}
                                >
                                    {t('account.professionnel')}
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
                                            {isResending ? t('account.sending_resend') : t('account.resend_email')}
                                        </button>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {!isLoginView && (
                        <>
                            {accountType === 'entreprise' && (
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        required
                                        placeholder={t('account.company_name')}
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
                                        placeholder={accountType === 'entreprise' ? `${t('account.lastname')} (Responsable)` : t('account.lastname')}
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        required
                                        placeholder={accountType === 'entreprise' ? `${t('account.firstname')} (Responsable)` : t('account.firstname')}
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <input
                                    type="email"
                                    required
                                    placeholder={t('account.email')}
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            
                            <div className={styles.inputGroup}>
                                <PhoneInput
                                    value={formData.phone}
                                    onChange={(value: string) => setFormData({ ...formData, phone: value })}
                                    placeholder={t('account.phone')}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <input
                                    type="password"
                                    required
                                    placeholder={t('account.password')}
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
                                    placeholder={t('account.email')}
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <input
                                    type="password"
                                    required
                                    placeholder={t('account.password')}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                                {isSubmitting ? t('account.loading') : (isLoginView ? t('account.submit_login') : t('account.submit_register'))}
                            </button>
                </form>
                    </>
                )}

                {!isForgotPasswordView && (
                    <>
                        {isLoginView && (
                            <div className={styles.toggle}>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsForgotPasswordView(true);
                                        setError('');
                                    }}
                                    className={styles.toggleLink}
                                >
                                    {t('account.forgot_password')}
                                </button>
                            </div>
                        )}
                        <div className={styles.toggle}>
                            <button 
                                type="button" 
                                onClick={() => {
                                    setIsLoginView(!isLoginView);
                                    setError('');
                                    setShowResend(false);
                                }}
                                className={styles.toggleLink}
                            >
                                {isLoginView ? t('account.need_account') : t('account.already_member')}
                            </button>
                        </div>
                    </>
                )}

                {isForgotPasswordView && (
                    <div className={styles.toggle}>
                        <button 
                            type="button" 
                            onClick={() => {
                                setIsForgotPasswordView(false);
                                setError('');
                                setResetEmail('');
                            }}
                            className={styles.toggleLink}
                        >
                            {t('account.back_to_login')}
                        </button>
                    </div>
                )}

                {/* Toast Notification */}
                {showToast && (
                    <div className={styles.toast}>
                        {toastMessage}
                    </div>
                )}
            </div>
        </div>
    );
}
