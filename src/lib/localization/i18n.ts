"use client"
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { common } from './i18n.common'
import { auth } from './i18n.auth'
import { ussdTranslations } from './i18n.ussd'
import { farmer } from './i18n.farmer'
import { dataCollector } from './i18n.dataCollector'

const resources = {
  en: {
    translation: {
      ...common.en,
      common: {
        ...common.en,
      },
      auth: {
        ...auth.en,
      },
      ...ussdTranslations.en,
      farmer: {
        ...farmer.en,
      },
      dataCollector: {
        ...dataCollector.en,
      },
    },
  },
  am: {
    translation: {
      ...common.am,
      common: {
        ...common.am,
      },
      auth: {
        ...auth.am,
      },
      ...ussdTranslations.am,
      farmer: {
        ...farmer.am,
      },
      dataCollector: {
        ...dataCollector.am,
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