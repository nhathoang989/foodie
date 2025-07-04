import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from './i18n.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Make it impure to detect language changes
})
export class TranslatePipe implements PipeTransform {
  constructor(private i18nService: I18nService) {}

  transform(key: string, params?: Record<string, string | number>): string {
    return this.i18nService.translate(key, params);
  }
}
