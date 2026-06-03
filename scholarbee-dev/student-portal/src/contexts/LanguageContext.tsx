'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import enMessages from '../messages/en.json';
import urMessages from '../messages/ur.json';

type Language = 'en' | 'ur';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Translation messages
const translations: Record<Language, Record<string, unknown>> = {
  en: enMessages,
  ur: urMessages
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load language from localStorage or default to 'en'
    const savedLanguage =
      (localStorage.getItem('language') as Language) || 'en';
    setLanguageState(savedLanguage);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: unknown = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        value = undefined;
        break;
      }
    }

    // If translation not found, try English as fallback
    if (typeof value !== 'string' && language !== 'en') {
      let fallbackValue: unknown = translations.en;
      for (const k of keys) {
        if (
          fallbackValue &&
          typeof fallbackValue === 'object' &&
          k in fallbackValue
        ) {
          fallbackValue = (fallbackValue as Record<string, unknown>)[k];
        } else {
          fallbackValue = undefined;
          break;
        }
      }
      value = typeof fallbackValue === 'string' ? fallbackValue : key;
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace placeholders like {city}
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
