import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { I18nService } from '../../../i18n/i18n.service';
import { SupportedLanguage } from '../../../i18n/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatMenuModule, MatIconModule],
  template: `
    <button mat-button [matMenuTriggerFor]="languageMenu" class="language-button">
      <mat-icon>language</mat-icon>
      {{ i18nService.getLanguageDisplayName(i18nService.getCurrentLanguage()) }}
    </button>
    <mat-menu #languageMenu="matMenu">
      <button 
        mat-menu-item 
        *ngFor="let lang of availableLanguages" 
        (click)="switchLanguage(lang)"
        [class.active]="lang === currentLanguage"
      >
        {{ i18nService.getLanguageDisplayName(lang) }}
      </button>
    </mat-menu>
  `,
  styles: [`
    .language-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .active {
      font-weight: bold;
      background-color: rgba(0,0,0,0.04);
    }
  `]
})
export class LanguageSwitcherComponent {
  availableLanguages: SupportedLanguage[] = [];
  currentLanguage: SupportedLanguage;

  constructor(public i18nService: I18nService) {
    this.availableLanguages = this.i18nService.getAvailableLanguages();
    this.currentLanguage = this.i18nService.getCurrentLanguage();
  }

  switchLanguage(language: SupportedLanguage): void {
    this.i18nService.setLanguage(language);
    this.currentLanguage = language;
    
    // Reload the page to apply the language change
    // You can also implement more sophisticated change detection
    window.location.reload();
  }
}
