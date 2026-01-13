"use client";

import { useLanguage } from '@/context/LanguageContext';
import styles from './StarRating.module.css';

interface StarRatingProps {
    rating: number; // Note entre 0 et 5
    showText?: boolean; // Afficher le texte "X.X/5"
    showCount?: boolean; // Afficher le nombre d'avis
    reviewCount?: number; // Nombre d'avis
    size?: 'small' | 'medium' | 'large'; // Taille des étoiles
}

export default function StarRating({ 
    rating, 
    showText = true, 
    showCount = true, 
    reviewCount = 0,
    size = 'small'
}: StarRatingProps) {
    const { t } = useLanguage();
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className={styles.container}>
            <div className={styles.stars}>
                {/* Étoiles pleines */}
                {Array.from({ length: fullStars }).map((_, i) => (
                    <svg
                        key={`full-${i}`}
                        className={`${styles.star} ${styles[size]}`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="currentColor"
                    >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                ))}
                
                {/* Demi-étoile */}
                {hasHalfStar && (
                    <div className={styles.halfStarWrapper}>
                        <svg
                            className={`${styles.star} ${styles[size]}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                        >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <svg
                            className={`${styles.star} ${styles.halfStar} ${styles[size]}`}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="currentColor"
                        >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                )}
                
                {/* Étoiles vides */}
                {Array.from({ length: emptyStars }).map((_, i) => (
                    <svg
                        key={`empty-${i}`}
                        className={`${styles.star} ${styles.empty} ${styles[size]}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                    >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                ))}
            </div>
            
            {showText && (
                <span className={styles.ratingText}>
                    {reviewCount > 0 ? (
                        <>
                            {rating.toFixed(1)}/5
                            {showCount && (
                                <span className={styles.reviewCount}> ({reviewCount} {reviewCount === 1 ? t('product.review_singular') : t('product.review_plural')})</span>
                            )}
                        </>
                    ) : (
                        <span className={styles.noReviews}>{t('product.no_reviews')}</span>
                    )}
                </span>
            )}
        </div>
    );
}
