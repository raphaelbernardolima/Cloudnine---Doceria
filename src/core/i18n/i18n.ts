import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ptTranslation from './locales/pt.json';
import enTranslation from './locales/en.json';

// Tenta pegar o idioma salvo no localStorage, ou usa 'pt' como fallback
const savedLanguage = localStorage.getItem('cloudnine-lang') || 'pt';

i18n
  .use(initReactI18next) // passa o i18n para o react-i18next
  .init({
    resources: {
      pt: ptTranslation,
      en: enTranslation,
    },
    lng: savedLanguage,
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false, // React já faz escape contra XSS
    },
  });

export default i18n;
