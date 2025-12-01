'use client'

import { useState } from 'react'
import { GlobeIcon } from 'lucide-react'

import { Button } from '@/components/atoms/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'si', label: 'Sinhala' },
  { code: 'ta', label: 'Tamil' },
]

export function LanguageSelector() {
  const [currentLanguage, setCurrentLanguage] = useState('en')

  const currentLanguageLabel = languages.find((lang) => lang.code === currentLanguage)?.label || 'English'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-white hover:bg-white/10">
          <GlobeIcon className="size-4" />
          <span className="ml-2">{currentLanguageLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setCurrentLanguage(language.code)}
            className={currentLanguage === language.code ? 'bg-accent' : ''}
          >
            {language.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

