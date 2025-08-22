'use client'

import { useEffect, useState } from 'react'
import i18n from '@/lib/localization/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface Language {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
]

const LanguageSelector = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>({ code: 'en', name: 'English', flag: '🇺🇸' })

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language)
    i18n.changeLanguage(language.code)
    try {
      localStorage.setItem('language', language.code)
    } catch {}
  }

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('language') || i18n.language || 'en'
      const lang = languages.find(l => l.code === savedLanguage) || languages[0]
      setCurrentLanguage(lang)
      if (i18n.language !== lang.code) {
        i18n.changeLanguage(lang.code)
      }
    } catch {
      // No-op
    }
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary transition-colors"
          aria-label="Change language"
        >
          <span className="text-sm font-medium text-foreground">
            {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language)}
            className={currentLanguage.code === language.code ? 'font-medium text-primary' : ''}
          >
            <span className="mr-2">{language.flag}</span>
            <span>{language.name}</span>
            {currentLanguage.code === language.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default LanguageSelector
export type { Language }
