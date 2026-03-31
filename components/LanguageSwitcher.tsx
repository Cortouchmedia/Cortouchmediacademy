"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from "framer-motion";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', flag: '🇳🇬' },
] as const;

export const LanguageSwitcher: React.FC<{ showLabel?: boolean }> = ({ showLabel = true }) => {
  const { language, setLanguage } = useAppContext();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={langRef}>
      <button 
        onClick={() => setIsLangOpen(!isLangOpen)}
        className="flex items-center gap-2 text-brand-muted hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200"
        title="Change Language"
      >
        <Icon name="globe" className="w-5 h-5 lg:w-6 lg:h-6" />
        {showLabel && (
          <span className="hidden sm:inline text-xs font-bold uppercase">{language}</span>
        )}
      </button>

      <AnimatePresence>
        {isLangOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
          >
            <div className="px-3 py-2 border-b border-gray-50 mb-1">
              <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Select Language</p>
            </div>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsLangOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  language === lang.code 
                    ? 'bg-brand-primary/5 text-brand-primary font-bold' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
                {language === lang.code && (
                  <Icon name="check" className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
