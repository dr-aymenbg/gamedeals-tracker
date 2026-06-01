/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Language } from '../types';
import { Languages } from 'lucide-react';

interface LanguageSelectorProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function LanguageSelector({ currentLang, onLanguageChange }: LanguageSelectorProps) {
  const languagesList: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div id="language-selector-container" className="flex items-center gap-2 bg-[#131a30] border border-[#222d4a] rounded-lg p-1">
      <div className="p-1 text-purple-400">
        <Languages size={18} id="language-icon" />
      </div>
      <div className="flex gap-1">
        {languagesList.map((lang) => {
          const isSelected = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              id={`lang-btn-${lang.code}`}
              onClick={() => onLanguageChange(lang.code)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)] border-t border-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-[#1b2542]'
              }`}
            >
              <span>{lang.flag}</span>
              <span className="hidden sm:inline">{lang.label}</span>
              <span className="sm:hidden font-mono text-[10px]">{lang.code.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
