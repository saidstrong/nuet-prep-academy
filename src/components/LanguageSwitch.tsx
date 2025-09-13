"use client";
import { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';

interface LanguageSwitchProps {
  className?: string;
}

export default function LanguageSwitch({ className = '' }: LanguageSwitchProps) {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'ru'>('en');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('nuet-language') as 'en' | 'ru' | null;
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (lang: 'en' | 'ru') => {
    setCurrentLanguage(lang);
    localStorage.setItem('nuet-language', lang);
    setIsOpen(false);
    
    // You can add more language switching logic here
    // For now, we'll just store the preference
    console.log(`Language switched to: ${lang}`);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-blue-100 hover:text-white hover:bg-blue-700/50 rounded-lg transition-all duration-200 font-medium text-sm"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLang?.flag}</span>
        <span className="hidden lg:inline">{currentLang?.name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
          <div className="py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code as 'en' | 'ru')}
                className="w-full flex items-center justify-between px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </div>
                {currentLanguage === lang.code && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
