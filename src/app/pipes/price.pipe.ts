import { Pipe, PipeTransform } from '@angular/core';
import { PriceUtil } from '../utils/price.util';

/**
 * Formats a number as a price string with optional currency symbol
 * 
 * Usage:
 * {{ value | price }}         // With currency symbol (e.g., "10,000 ₫")
 * {{ value | price:false }}   // Without currency symbol (e.g., "10,000")
 */
@Pipe({
  name: 'price',
  standalone: true
})
export class PricePipe implements PipeTransform {
  /**
   * Transform a number into a formatted price string
   * 
   * @param value - The price value to format
   * @param showCurrency - Whether to include the currency symbol (default: true)
   * @returns Formatted price string
   */
  transform(value: number | null | undefined, showCurrency: boolean = true): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    return showCurrency 
      ? PriceUtil.formatPrice(value)
      : PriceUtil.formatPriceOnly(value);
  }
}
