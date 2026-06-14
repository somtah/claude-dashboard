'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Lang, translations, Translations, formatCost } from '@/lib/i18n'
// Translations type is the explicit interface from i18n.ts

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  tr: Translations
  fmt: (usdAmount: number) => string
}

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
  tr: translations.en,
  fmt: (n) => `~$${n.toFixed(2)}`,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  return (
    <LangContext.Provider value={{
      lang,
      setLang,
      tr: translations[lang],
      fmt: (n) => formatCost(n, lang),
    }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
