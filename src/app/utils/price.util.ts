import { environment } from '../../environments/environment';

/**
 * Utility functions for price formatting
 */
export class PriceUtil {
  /**
   * Format price with currency symbol
   * @param price - The price number to format
   * @returns Formatted price string (e.g., "10,000 ₫")
   */
  static formatPrice(price: number): string {
    // Use environment variable for currency symbol
    // Format: 10,000 ₫ (no decimals)
    return `${Math.round(price).toLocaleString()} ${environment.currencySymbol}`;
  }

  /**
   * Format price without currency symbol
   * @param price - The price number to format
   * @returns Formatted price string without currency (e.g., "10,000")
   */
  static formatPriceOnly(price: number): string {
    return Math.round(price).toLocaleString();
  }

  /**
   * Get currency symbol from environment
   * @returns Currency symbol string
   */
  static getCurrencySymbol(): string {
    return environment.currencySymbol;
  }
}
