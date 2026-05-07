import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../i18n';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

interface LanguageSelectorProps {
  variant?: 'floating' | 'outline';
  onChange?: (lang: Language) => void;
  className?: string;
}

export default function LanguageSelector({ variant = 'floating', onChange, className = '' }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (langCode: Language) => {
    if (onChange) {
      onChange(langCode);
    } else {
      setLanguage(langCode);
    }
    setIsOpen(false);
  };

  const baseStyles = "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary-500";
  
  const variants = {
    floating: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
    outline: "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-primary-500 dark:hover:border-primary-400"
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${baseStyles} ${variants[variant]}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Globe className={`w-4 h-4 transition-transform group-hover:rotate-12 ${variant === 'floating' ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'}`} />
        <span className="text-sm font-medium hidden sm:inline">{currentLang.label}</span>
        <span className="text-sm sm:hidden">{currentLang.flag}</span>
        <ChevronDown className={`w-3 h-3 text-primary-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right`}>
          <div className="py-1" role="listbox">
            <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
              {t.common?.selectLanguage || 'Seleccionar Idioma'}
            </div>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                  ${language === lang.code
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                role="option"
                aria-selected={language === lang.code}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {language === lang.code && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
