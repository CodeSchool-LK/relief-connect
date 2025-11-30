import React from 'react';
import { useRouter } from 'next/router';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

export default function LanguageSwitcher({ variant = 'light' }: LanguageSwitcherProps) {
  const router = useRouter();
  const { locale, pathname, asPath, query } = router;

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return;
    
    // Use router.push with current pathname and asPath, just changing the locale
    // This is the recommended way for next-i18next
    router.push(router.pathname, router.asPath, { 
      locale: newLocale,
      scroll: false,
    });
  };

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];
  const isDark = variant === 'dark';

  return (
    <div className="flex items-center gap-2">
      <Globe className={`h-4 w-4 ${isDark ? 'text-white' : 'text-gray-600'}`} />
      <Select value={locale || 'en'} onValueChange={handleLanguageChange}>
        <SelectTrigger className={`w-[140px] h-9 ${isDark ? 'bg-white/20 backdrop-blur-sm border-white/30 text-white' : ''}`}>
          <SelectValue>
            <span className="flex items-center gap-2">
              <span>{currentLanguage.nativeName}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span>{lang.nativeName}</span>
                <span className="text-xs text-gray-500">({lang.name})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

