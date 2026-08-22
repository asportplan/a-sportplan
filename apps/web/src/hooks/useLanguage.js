import { useState, useEffect } from 'react';
import { getCurrentLanguage, setLanguage, toggleLanguage } from '../core/utils/i18n.js';

export function useLanguage() {
  const [lang, setLangState] = useState(getCurrentLanguage());

  useEffect(() => {
    const handleLangChange = (e) => {
      if (e.detail && e.detail.language) {
        setLangState(e.detail.language);
      }
    };

    window.addEventListener('languageChanged', handleLangChange);
    return () => window.removeEventListener('languageChanged', handleLangChange);
  }, []);

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    setLangState(newLang);
  };

  const toggle = () => {
    const newLang = toggleLanguage();
    setLangState(newLang);
  };

  return { lang, changeLanguage, toggle };
}
