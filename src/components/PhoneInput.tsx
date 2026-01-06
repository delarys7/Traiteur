"use client";

import { useState, useEffect } from 'react';
import { countries, Country } from '@/data/countries';
import styles from './PhoneInput.module.css';

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
        // Par défaut France
        const defaultCountry = countries.find(c => c.code === 'FR') || countries[0];
        return {
            country: defaultCountry,
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
                    title={selectedCountry.name}
                >
                    <img 
                        src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w80/${selectedCountry.code.toLowerCase()}.png 2x`}
                        width="20"
                        alt={selectedCountry.name}
                        className={styles.flag}
                    />
                    <span className={styles.dialCode}>{selectedCountry.dialCode}</span>
                    <span className={styles.arrow}>▼</span>
                </button>
            </div>
            {showCountryList && !disabled && (
                <div className={styles.countryList}>
                    {countries.map((country) => (
                        <button
                            key={country.code}
                            type="button"
                            className={styles.countryOption}
                            onClick={() => handleCountryChange(country)}
                        >
                            <span className={styles.countryName}>{country.name} ({country.dialCode})</span>
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
