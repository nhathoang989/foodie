import { Injectable } from '@angular/core';
import { VI_TRANSLATIONS } from './vi.translations';
import { EN_TRANSLATIONS } from './en.translations';

export type SupportedLanguage = 'vi' | 'en';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguage: SupportedLanguage = 'vi';
  private translations: Record<SupportedLanguage, Record<string, string>> = {
    vi: VI_TRANSLATIONS,
    en: EN_TRANSLATIONS
  };

  constructor() {
    // Load language from localStorage or default to Vietnamese
    const savedLanguage = localStorage.getItem('language') as SupportedLanguage;
    if (savedLanguage && this.translations[savedLanguage]) {
      this.currentLanguage = savedLanguage;
    }
  }

  setLanguage(language: SupportedLanguage): void {
    if (this.translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('language', language);
    }
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  translate(key: string, params?: Record<string, string | number>): string {
    const translation = this.translations[this.currentLanguage][key];
    
    if (!translation) {
      console.warn(`Translation not found for key: ${key}`);
      return key;
    }

    // Replace parameters in translation
    if (params) {
      return Object.keys(params).reduce((text, param) => {
        return text.replace(`{${param}}`, String(params[param]));
      }, translation);
    }

    return translation;
  }

  // Shorthand method for translate
  t(key: string, params?: Record<string, string | number>): string {
    return this.translate(key, params);
  }

  // Get all available languages
  getAvailableLanguages(): SupportedLanguage[] {
    return Object.keys(this.translations) as SupportedLanguage[];
  }

  // Get language display name
  getLanguageDisplayName(language: SupportedLanguage): string {
    const displayNames: Record<SupportedLanguage, string> = {
      vi: 'VN',
      en: 'EN'
    };
    return displayNames[language] || language;
  }
}
