"use client";

import { useState, useEffect } from 'react';
import styles from './PhoneInput.module.css';

interface Country {
    code: string;
    name: string;
    dialCode: string;
    flag: string;
}

const countries: Country[] = [
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
    { code: 'BE', name: 'Belgique', dialCode: '+32', flag: '🇧🇪' },
    { code: 'CH', name: 'Suisse', dialCode: '+41', flag: '🇨🇭' },
    { code: 'LU', name: 'Luxembourg', dialCode: '+352', flag: '🇱🇺' },
    { code: 'GB', name: 'Royaume-Uni', dialCode: '+44', flag: '🇬🇧' },
    { code: 'DE', name: 'Allemagne', dialCode: '+49', flag: '🇩🇪' },
    { code: 'ES', name: 'Espagne', dialCode: '+34', flag: '🇪🇸' },
    { code: 'IT', name: 'Italie', dialCode: '+39', flag: '🇮🇹' },
    { code: 'US', name: 'États-Unis', dialCode: '+1', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
];

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export default function PhoneInput({ value, onChange, placeholder = "Téléphone", disabled = false, className }: PhoneInputProps) {
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
        return {
            country: countries[0],
            phoneNumber: value || ''
        };
    };

    const initialState = getInitialState();
    const [selectedCountry, setSelectedCountry] = useState<Country>(initialState.country);
    const [showCountryList, setShowCountryList] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(initialState.phoneNumber);

    // Mettre à jour quand la valeur externe change
    useEffect(() => {
        if (value) {
            const foundCountry = countries.find(country => value.startsWith(country.dialCode));
            if (foundCountry) {
                setSelectedCountry(foundCountry);
                setPhoneNumber(value.replace(foundCountry.dialCode, '').trim());
            } else {
                setPhoneNumber(value);
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
            const target = event.target as HTMLElement;
            if (showCountryList && !target.closest(`.${styles.countrySelector}`)) {
                setShowCountryList(false);
            }
        };

        if (showCountryList) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showCountryList]);

    return (
        <div className={`${styles.phoneInputContainer} ${className || ''}`}>
            <div className={styles.countrySelector}>
                <button
                    type="button"
                    className={styles.countryButton}
                    onClick={() => !disabled && setShowCountryList(!showCountryList)}
                    disabled={disabled}
                >
                    <span className={styles.flag}>{selectedCountry.flag}</span>
                    <span className={styles.dialCode}>{selectedCountry.dialCode}</span>
                    <span className={styles.arrow}>▼</span>
                </button>
                {showCountryList && !disabled && (
                    <div className={styles.countryList}>
                        {countries.map((country) => (
                            <button
                                key={country.code}
                                type="button"
                                className={styles.countryOption}
                                onClick={() => handleCountryChange(country)}
                            >
                                <span className={styles.flag}>{country.flag}</span>
                                <span className={styles.countryName}>{country.name}</span>
                                <span className={styles.dialCode}>{country.dialCode}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
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
