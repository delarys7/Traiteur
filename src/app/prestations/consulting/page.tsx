"use client";

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Consulting() {
    const { t } = useLanguage();
    return (
        <div style={{ padding: '8rem 2rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '2rem', fontFamily: 'serif' }}>{t('consulting.title')}</h1>
            <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: 1.6, marginBottom: '3rem' }}>
                {t('consulting.description')}
            </p>
            
            <div style={{ padding: '4rem', border: '1px solid #eee', backgroundColor: '#fcfcfc' }}>
                <h2 style={{ fontFamily: 'serif', marginBottom: '1.5rem' }}>{t('consulting.establishments')}</h2>
                <p style={{ fontStyle: 'italic', color: '#888', marginBottom: '2rem' }}>
                    {t('consulting.coming_soon')}
                </p>
                <Link 
                    href="/contact?motif=consulting" 
                    style={{
                        display: 'inline-block',
                        padding: '1rem 2rem',
                        backgroundColor: '#111',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s',
                        marginTop: '1rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#111'}
                >
                    {t('consulting.book_consultation')}
                </Link>
            </div>
        </div>
    );
}
