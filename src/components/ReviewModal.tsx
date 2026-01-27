"use client";

import React, { useState } from 'react';
import styles from '@/app/compte/page.module.css';
import { useLanguage } from '@/context/LanguageContext';
import { Order, OrderItem } from './OrderCard';

interface ReviewModalProps {
    order: Order;
    onClose: () => void;
    onSuccess: () => void;
}

const StarRating: React.FC<{ rating: number; onChange: (rating: number) => void }> = ({ rating, onChange }) => {
    return (
        <div className={styles.starRating}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`${styles.star} ${star <= rating ? styles.starActive : ''}`}
                    onClick={() => onChange(star)}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

const ReviewModal: React.FC<ReviewModalProps> = ({ order, onClose, onSuccess }) => {
    const { t } = useLanguage();
    const [reviewType, setReviewType] = useState<'global' | 'items'>('global');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Global review state
    const [globalRating, setGlobalRating] = useState(5);
    const [globalComment, setGlobalComment] = useState('');

    // Individual items review state
    const [itemReviews, setItemReviews] = useState<Record<string | number, { rating: number; comment: string }>>(
        order.items.reduce((acc, item) => ({
            ...acc,
            [item.id]: { rating: 5, comment: '' }
        }), {} as Record<string | number, { rating: number; comment: string }>)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const body = {
                orderId: order.id,
                type: reviewType,
                ...(reviewType === 'global' 
                    ? { rating: globalRating, comment: globalComment }
                    : { reviews: itemReviews, generalComment: globalComment }
                )
            };

            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de l\'envoi de l\'avis');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{t('account.review.title')}</h2>
                    <button onClick={onClose} className={styles.modalClose}>×</button>
                </div>

                <div className={styles.reviewTypeToggle}>
                    <button 
                        className={`${styles.reviewTypeBtn} ${reviewType === 'global' ? styles.active : ''}`}
                        onClick={() => setReviewType('global')}
                    >
                        {t('account.review.rate_order')}
                    </button>
                    <button 
                        className={`${styles.reviewTypeBtn} ${reviewType === 'items' ? styles.active : ''}`}
                        onClick={() => setReviewType('items')}
                    >
                        {t('account.review.rate_items')}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.reviewForm}>
                    {error && <div className={styles.error}>{error}</div>}

                    {reviewType === 'global' ? (
                        <div className={styles.globalReviewSection}>
                            <StarRating rating={globalRating} onChange={setGlobalRating} />
                            
                            <div className={styles.inputGroup}>
                                <label>{t('account.review.general_comment')}</label>
                                <textarea
                                    value={globalComment}
                                    onChange={(e) => setGlobalComment(e.target.value)}
                                    placeholder={t('account.review.general_comment')}
                                    className={styles.reviewTextarea}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className={styles.itemsReviewSection}>
                            {order.items.map((item) => (
                                <div key={item.id} className={styles.itemReviewCard}>
                                    <div className={styles.itemReviewHeader}>
                                        <span className={styles.itemReviewName}>{t('product.names.' + (item.name?.trim() || ''))}</span>
                                        <StarRating 
                                            rating={itemReviews[item.id].rating} 
                                            onChange={(r) => setItemReviews({
                                                ...itemReviews,
                                                [item.id]: { ...itemReviews[item.id], rating: r }
                                            })} 
                                        />
                                    </div>
                                    <textarea
                                        value={itemReviews[item.id].comment}
                                        onChange={(e) => setItemReviews({
                                            ...itemReviews,
                                            [item.id]: { ...itemReviews[item.id], comment: e.target.value }
                                        })}
                                        placeholder={t('account.review.product_comment')}
                                        className={styles.itemReviewTextarea}
                                    />
                                </div>
                            ))}
                            
                            <div className={styles.inputGroup}>
                                <label>{t('account.review.general_comment')}</label>
                                <textarea
                                    value={globalComment}
                                    onChange={(e) => setGlobalComment(e.target.value)}
                                    placeholder={t('account.review.general_comment')}
                                    className={styles.reviewTextarea}
                                />
                            </div>
                        </div>
                    )}

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>
                            {t('account.cancel')}
                        </button>
                        <button type="submit" className={styles.saveButton} disabled={isSubmitting}>
                            {isSubmitting ? t('account.loading') : t('account.review.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
