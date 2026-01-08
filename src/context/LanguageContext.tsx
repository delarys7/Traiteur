"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/data/translations';

type Language = 'fr' | 'en'; // Typed strict
type TranslationKey = keyof typeof translations.fr; 

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string; // Flexible key for nested objects if needed, or strict
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('fr');

    const t = (key: string) => {
        const keys = key.split('.');
        let value: any = translations[language];
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }
        // Si la valeur est un objet, retourner la clé pour éviter les erreurs
        if (typeof value === 'object' && value !== null) {
            return key;
        }
        return value || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
