"use client"
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { common } from './i18n.common'
import { auth } from './i18n.auth'

const resources = {
  en: {
    translation: {
      ...common.en,
      auth: {
        ...auth.en,
      },
    },
  },
  am: {
    translation: {
      ...common.en,
      auth: {
        ...auth.am,
      },
    },
  },
}

// Guard for client-side only features
const isBrowser = typeof window !== 'undefined'

// Persist selected language in localStorage (client only)
const initialLanguage = (() => {
  if (!isBrowser) return 'en'
  const saved = window.localStorage.getItem('language')
  return saved || 'en'
})()

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

// Keep language selection persisted (client only)
if (isBrowser) {
  i18n.on('languageChanged', (lng) => {
    try {
      window.localStorage.setItem('language', lng)
    } catch {}
  })
}

export default i18n; 