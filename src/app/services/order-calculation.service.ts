import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartItem, OrderCalculation, ShippingOption } from '../models';
import { environment } from '../../environments/environment';
import { ShippingService } from './shipping.service';

@Injectable({
  providedIn: 'root'
})
export class OrderCalculationService {

  constructor(private shippingService: ShippingService) {}

  /**
   * Calculate order totals including tax and shipping
   */
  calculateOrderTotal(
    items: CartItem[], 
    shippingOptionId?: number
  ): Observable<OrderCalculation> {
    const subtotal = this.calculateSubtotal(items);
    const tax = this.calculateTax(subtotal);
    
    if (shippingOptionId) {
      return this.shippingService.getShippingOptionById(shippingOptionId).pipe(
        map(shippingOption => {
          const shipping = shippingOption.fee || 0;
          return {
            subtotal,
            tax,
            shipping,
            total: subtotal + tax + shipping,
            taxRate: environment.taxRate
          };
        })
      );
    } else {
      return of({
        subtotal,
        tax,
        shipping: 0,
        total: subtotal + tax,
        taxRate: environment.taxRate
      });
    }
  }

  /**
   * Calculate subtotal from cart items
   */
  calculateSubtotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      const price = item.dish?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  }

  /**
   * Calculate tax amount
   */
  calculateTax(subtotal: number): number {
    return subtotal * environment.taxRate;
  }

  /**
   * Calculate shipping fee
   */
  calculateShipping(shippingOptionId: number): Observable<number> {
    return this.shippingService.calculateShippingFee(shippingOptionId);
  }

  /**
   * Get order summary with all calculations
   */
  getOrderSummary(
    items: CartItem[], 
    shippingOptionId?: number
  ): Observable<{
    items: CartItem[];
    itemCount: number;
    calculation: OrderCalculation;
  }> {
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    
    return this.calculateOrderTotal(items, shippingOptionId).pipe(
      map(calculation => ({
        items,
        itemCount,
        calculation
      }))
    );
  }

  /**
   * Format currency value
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: environment.currency
    }).format(amount);
  }

  /**
   * Check if order qualifies for free shipping
   */
  qualifiesForFreeShipping(subtotal: number, freeShippingThreshold = 50): boolean {
    return subtotal >= freeShippingThreshold;
  }

  /**
   * Calculate amount needed for free shipping
   */
  amountForFreeShipping(subtotal: number, freeShippingThreshold = 50): number {
    if (this.qualifiesForFreeShipping(subtotal, freeShippingThreshold)) {
      return 0;
    }
    return freeShippingThreshold - subtotal;
  }

  /**
   * Validate order minimum
   */
  validateOrderMinimum(subtotal: number, minimumOrder = 10): { 
    isValid: boolean; 
    message?: string; 
    amountNeeded?: number 
  } {
    if (subtotal >= minimumOrder) {
      return { isValid: true };
    }
    
    const amountNeeded = minimumOrder - subtotal;
    return {
      isValid: false,
      message: `Minimum order is ${this.formatCurrency(minimumOrder)}`,
      amountNeeded
    };
  }

  /**
   * Calculate estimated delivery time
   */
  getEstimatedDeliveryTime(preparationMinutes: number = 30): Date {
    const now = new Date();
    now.setMinutes(now.getMinutes() + preparationMinutes);
    return now;
  }

  /**
   * Calculate total preparation time for order
   */
  calculateTotalPreparationTime(items: CartItem[]): number {
    return items.reduce((maxTime, item) => {
      const prepTime = item.dish?.preparation_time || 15; // Default 15 minutes
      return Math.max(maxTime, prepTime);
    }, 0);
  }
}
