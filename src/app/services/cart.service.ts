import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BaseMixDbDataService } from './base-mixdb-data.service';
import { Cart, CartItem, CartState, Dish } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService extends BaseMixDbDataService<Cart> {
  protected tableName = 'mix_cart';
  
  private cartStateSubject = new BehaviorSubject<CartState>({
    items: [],
    total: 0,
    itemCount: 0,
    isLoading: false
  });

  public cartState$ = this.cartStateSubject.asObservable();
  private sessionId: string;

  constructor() {
    super();
    this.sessionId = this.generateSessionId();
    this.loadCartFromStorage();
  }

  /**
   * Get current cart state
   */
  getCurrentCartState(): CartState {
    return this.cartStateSubject.value;
  }

  /**
   * Add item to cart
   */
  addToCart(dish: Dish, quantity: number = 1): Observable<void> {
    this.setLoading(true);
    
    const currentState = this.cartStateSubject.value;
    const existingItemIndex = currentState.items.findIndex(item => item.dish_id === dish.id);
    
    let updatedItems: CartItem[];
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      updatedItems = [...currentState.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };
    } else {
      // Add new item
      const newItem: CartItem = {
        id: Date.now(), // Temporary ID for local state
        cart_id: 0, // Will be set when synced with server
        dish_id: dish.id!,
        quantity,
        dish,
        created_at: new Date(),
        updated_at: new Date()
      };
      updatedItems = [...currentState.items, newItem];
    }

    const newState = this.calculateCartState(updatedItems);
    this.cartStateSubject.next(newState);
    this.saveCartToStorage();
    this.setLoading(false);

    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  /**
   * Remove item from cart
   */
  removeFromCart(dishId: number): Observable<void> {
    this.setLoading(true);
    
    const currentState = this.cartStateSubject.value;
    const updatedItems = currentState.items.filter(item => item.dish_id !== dishId);
    
    const newState = this.calculateCartState(updatedItems);
    this.cartStateSubject.next(newState);
    this.saveCartToStorage();
    this.setLoading(false);

    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  /**
   * Update item quantity
   */
  updateQuantity(dishId: number, quantity: number): Observable<void> {
    if (quantity <= 0) {
      return this.removeFromCart(dishId);
    }

    this.setLoading(true);
    
    const currentState = this.cartStateSubject.value;
    const updatedItems = currentState.items.map(item => 
      item.dish_id === dishId 
        ? { ...item, quantity, updated_at: new Date() }
        : item
    );
    
    const newState = this.calculateCartState(updatedItems);
    this.cartStateSubject.next(newState);
    this.saveCartToStorage();
    this.setLoading(false);

    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  /**
   * Clear cart
   */
  clearCart(): Observable<void> {
    this.setLoading(true);
    
    const newState: CartState = {
      items: [],
      total: 0,
      itemCount: 0,
      isLoading: false
    };
    
    this.cartStateSubject.next(newState);
    this.clearCartFromStorage();
    this.setLoading(false);

    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  /**
   * Get cart items count
   */
  getItemsCount(): number {
    return this.cartStateSubject.value.itemCount;
  }

  /**
   * Get cart total
   */
  getCartTotal(): number {
    return this.cartStateSubject.value.total;
  }

  /**
   * Check if item is in cart
   */
  isInCart(dishId: number): boolean {
    return this.cartStateSubject.value.items.some(item => item.dish_id === dishId);
  }

  /**
   * Get item quantity in cart
   */
  getItemQuantity(dishId: number): number {
    const item = this.cartStateSubject.value.items.find(item => item.dish_id === dishId);
    return item ? item.quantity : 0;
  }

  private calculateCartState(items: CartItem[]): CartState {
    const total = items.reduce((sum, item) => {
      const price = item.dish?.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      total,
      itemCount,
      isLoading: false
    };
  }

  private setLoading(isLoading: boolean): void {
    const currentState = this.cartStateSubject.value;
    this.cartStateSubject.next({
      ...currentState,
      isLoading
    });
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private saveCartToStorage(): void {
    const cartState = this.cartStateSubject.value;
    localStorage.setItem('foodie_cart', JSON.stringify({
      items: cartState.items,
      sessionId: this.sessionId,
      timestamp: new Date().getTime()
    }));
  }

  private loadCartFromStorage(): void {
    try {
      const saved = localStorage.getItem('foodie_cart');
      if (saved) {
        const data = JSON.parse(saved);
        // Check if cart is not older than 24 hours
        const now = new Date().getTime();
        const hoursDiff = (now - data.timestamp) / (1000 * 60 * 60);
        
        if (hoursDiff < 24 && data.items) {
          const cartState = this.calculateCartState(data.items);
          this.cartStateSubject.next(cartState);
          this.sessionId = data.sessionId || this.sessionId;
        }
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    }
  }

  private clearCartFromStorage(): void {
    localStorage.removeItem('foodie_cart');
  }
}
