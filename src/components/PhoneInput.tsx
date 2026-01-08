"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { countries, Country } from '@/data/countries';
import { useLanguage } from '@/context/LanguageContext';
import styles from './PhoneInput.module.css';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export default function PhoneInput({ value, onChange, placeholder = "Téléphone", disabled = false, className }: PhoneInputProps) {
    const { language, t } = useLanguage();
    
    // Créer une liste de pays avec noms traduits et triée selon la langue
    const sortedCountries = useMemo(() => {
        const countriesWithTranslatedNames = countries.map(country => ({
            ...country,
            translatedName: language === 'en' 
                ? (t(`countries.${country.code}`) || country.name)
                : country.name
        }));
        
        // Trier par nom traduit selon la langue
        return countriesWithTranslatedNames.sort((a, b) => {
            const nameA = a.translatedName.toLowerCase();
            const nameB = b.translatedName.toLowerCase();
            return nameA.localeCompare(nameB, language === 'en' ? 'en' : 'fr');
        });
    }, [language, t]);
    
    // Parser la valeur initiale pour extraire le code pays et le numéro
    const getInitialState = () => {
        if (value) {
            const foundCountry = countries.find(country => value.startsWith(country.dialCode));
            if (foundCountry) {
                return {
                    country: foundCountry,
                    phoneNumber: value.replace(foundCountry.dialCode, '').trim()
                };
            }
        }
        // Par défaut France
        const defaultCountry = countries.find(c => c.code === 'FR') || countries[0];
        return {
            country: defaultCountry,
            phoneNumber: value || ''
        };
    };

    const initialState = getInitialState();
    const [selectedCountry, setSelectedCountry] = useState<Country>(initialState.country);
    
    // Fonction pour obtenir le nom traduit d'un pays
    const getCountryName = (country: Country) => {
        if (language === 'en') {
            return t(`countries.${country.code}`) || country.name;
        }
        return country.name;
    };
    const [showCountryList, setShowCountryList] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(initialState.phoneNumber);
    const containerRef = useRef<HTMLDivElement>(null);

    // Mettre à jour quand la valeur externe change
    useEffect(() => {
        if (value) {
            // Si le pays sélectionné correspond déjà au début de la value, on le garde
            // Cela évite de basculer sur le premier pays de la liste (ex: Canada vs USA pour +1)
            if (selectedCountry && value.startsWith(selectedCountry.dialCode)) {
                setPhoneNumber(value.replace(selectedCountry.dialCode, '').trim());
            } else {
                // Sinon on cherche le pays correspondant
                // On trie par longueur de dialCode décroissante pour éviter les faux positifs (+1 vs +1242)
                const foundCountry = [...countries]
                    .sort((a, b) => b.dialCode.length - a.dialCode.length)
                    .find(country => value.startsWith(country.dialCode));
                
                if (foundCountry) {
                    setSelectedCountry(foundCountry);
                    setPhoneNumber(value.replace(foundCountry.dialCode, '').trim());
                } else {
                    setPhoneNumber(value);
                }
            }
        } else {
            setPhoneNumber('');
        }
    }, [value]);

    const handleCountryChange = (country: Country) => {
        setSelectedCountry(country);
        setShowCountryList(false);
        const fullNumber = country.dialCode + (phoneNumber ? ' ' + phoneNumber : '');
        onChange(fullNumber);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const number = e.target.value.replace(/\D/g, '');
        setPhoneNumber(number);
        const fullNumber = selectedCountry.dialCode + (number ? ' ' + number : '');
        onChange(fullNumber);
    };

    // Fermer la liste des pays si on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowCountryList(false);
            }
        };

        if (showCountryList) {
            // Utiliser 'click' au lieu de 'mousedown' pour éviter les conflits avec le onClick du bouton
            // Et ajouter un petit délai pour laisser le onClick se déclencher en premier
            const timeoutId = setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 0);
            
            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [showCountryList]);

    return (
        <div ref={containerRef} className={`${styles.phoneInputContainer} ${className || ''}`}>
            <div className={styles.countrySelector}>
                <button
                    type="button"
                    className={styles.countryButton}
                    onClick={(e) => {
                        if (!disabled) {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowCountryList(prev => !prev);
                        }
                    }}
                    disabled={disabled}
                    title={getCountryName(selectedCountry)}
                >
                    <img 
                        src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w80/${selectedCountry.code.toLowerCase()}.png 2x`}
                        width="20"
                        alt={getCountryName(selectedCountry)}
                        className={styles.flag}
                    />
                    <span className={styles.dialCode}>{selectedCountry.dialCode}</span>
                    <span className={styles.arrow}>▼</span>
                </button>
            </div>
            {showCountryList && !disabled && (
                <div className={styles.countryList}>
                    {sortedCountries.map((country) => (
                        <button
                            key={country.code}
                            type="button"
                            className={styles.countryOption}
                            onClick={() => handleCountryChange(country)}
                        >
                            <img 
                                src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                                srcSet={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png 2x`}
                                width="20"
                                alt={country.translatedName}
                                className={styles.flag}
                                style={{ marginRight: '8px' }}
                            />
                            <span className={styles.countryName}>{country.translatedName} ({country.dialCode})</span>
                        </button>
                    ))}
                </div>
            )}
            <input
                type="tel"
                placeholder={placeholder}
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={disabled}
                className={styles.phoneInput}
            />
        </div>
    );
}
