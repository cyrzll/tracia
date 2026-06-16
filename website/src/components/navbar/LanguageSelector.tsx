import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { ASEAN_LANGUAGES, type LangCode } from '../../utils/lang';

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<LangCode>('en');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load saved language or default to browser language or English
    const savedLang = window.localStorage.getItem('tracia_lang') as LangCode;
    if (savedLang && ['id', 'my', 'en', 'th', 'ph', 'vn'].includes(savedLang)) {
      setCurrentLang(savedLang);
    } else {
      const browserLang = navigator.language.split('-')[0] as LangCode;
      if (['id', 'my', 'en', 'th', 'ph', 'vn'].includes(browserLang)) {
        setCurrentLang(browserLang);
        window.localStorage.setItem('tracia_lang', browserLang);
      } else {
        setCurrentLang('en');
        window.localStorage.setItem('tracia_lang', 'en');
      }
    }

    // Close dropdown on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (code: LangCode) => {
    setCurrentLang(code);
    window.localStorage.setItem('tracia_lang', code);
    setIsOpen(false);
    
    // Dispatch custom event to notify all components to reload translations
    window.dispatchEvent(new CustomEvent('tracia-lang-changed', { detail: { lang: code } }));
  };

  const selectedLangInfo = ASEAN_LANGUAGES.find(l => l.code === currentLang) || ASEAN_LANGUAGES[2];

  return (
    <div className="relative inline-block text-left z-50 font-sans" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all cursor-pointer h-8"
      >
        <span className="text-sm">{selectedLangInfo.flag}</span>
        <span className="uppercase font-mono tracking-wider text-[10px] hidden sm:inline">{selectedLangInfo.code}</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-zinc-800 bg-zinc-950/90 backdrop-blur-lg shadow-xl shadow-black/80 py-1.5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-zinc-900 text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
            ASEAN Region Language
          </div>
          {ASEAN_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left text-xs font-medium transition-all ${
                lang.code === currentLang 
                  ? 'bg-zinc-850/80 text-white font-bold' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <span className="text-sm">{lang.flag}</span>
              <span className="flex-1">{lang.name}</span>
              {lang.code === currentLang && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
