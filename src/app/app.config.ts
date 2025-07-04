import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { I18nService } from './i18n/i18n.service';

import { routes } from './app.routes';

function getBaseHref() {
  return document.querySelector('base')?.getAttribute('href') || '/';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(
      routes,
      withViewTransitions(),
      // Enable scrolling to top on navigation
    ),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: APP_BASE_HREF, useFactory: getBaseHref },
    importProvidersFrom(QuillModule.forRoot({
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ 'header': 1 }, { 'header': 2 }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'direction': 'rtl' }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'font': [] }],
          [{ 'align': [] }],
          ['clean'],
          ['link', 'image', 'video']
        ]
      },
      theme: 'snow',
      formats: [
        'background', 'bold', 'color', 'font', 'code', 'italic',
        'link', 'size', 'strike', 'script', 'underline', 'blockquote',
        'header', 'indent', 'list', 'align', 'direction', 'code-block',
        'image', 'video'
      ],
      bounds: document.body,
      debug: 'warn'
    })),
    // Provide I18nService for internationalization
    { provide: I18nService, useClass: I18nService }
  ]
};
