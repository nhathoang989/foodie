import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface LoadingState {
  [key: string]: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({});
  public loading$ = this.loadingSubject.asObservable();

  /**
   * Set loading state for a specific key
   */
  setLoading(key: string, loading: boolean): void {
    const currentState = this.loadingSubject.value;
    this.loadingSubject.next({
      ...currentState,
      [key]: loading
    });
  }

  /**
   * Get loading state for a specific key
   */
  isLoading(key: string): Observable<boolean> {
    return new Observable(observer => {
      this.loading$.subscribe(state => {
        observer.next(state[key] || false);
      });
    });
  }

  /**
   * Get current loading state for a key
   */
  isCurrentlyLoading(key: string): boolean {
    return this.loadingSubject.value[key] || false;
  }

  /**
   * Check if any loading is active
   */
  isAnyLoading(): Observable<boolean> {
    return new Observable(observer => {
      this.loading$.subscribe(state => {
        const hasLoading = Object.values(state).some(loading => loading);
        observer.next(hasLoading);
      });
    });
  }

  /**
   * Clear loading state for a specific key
   */
  clearLoading(key: string): void {
    this.setLoading(key, false);
  }

  /**
   * Clear all loading states
   */
  clearAllLoading(): void {
    this.loadingSubject.next({});
  }

  /**
   * Predefined loading keys for common operations
   */
  static readonly KEYS = {
    DISHES: 'dishes',
    CATEGORIES: 'categories',
    CART: 'cart',
    ORDER: 'order',
    CHECKOUT: 'checkout',
    SHIPPING: 'shipping',
    SEARCH: 'search',
    DISH_DETAILS: 'dishDetails',
    ORDER_HISTORY: 'orderHistory',
    INITIAL_LOAD: 'initialLoad'
  } as const;

  /**
   * Convenience methods for common operations
   */
  setDishesLoading(loading: boolean): void {
    this.setLoading(LoadingService.KEYS.DISHES, loading);
  }

  setCategoriesLoading(loading: boolean): void {
    this.setLoading(LoadingService.KEYS.CATEGORIES, loading);
  }

  setCartLoading(loading: boolean): void {
    this.setLoading(LoadingService.KEYS.CART, loading);
  }

  setOrderLoading(loading: boolean): void {
    this.setLoading(LoadingService.KEYS.ORDER, loading);
  }

  setCheckoutLoading(loading: boolean): void {
    this.setLoading(LoadingService.KEYS.CHECKOUT, loading);
  }

  setShippingLoading(loading: boolean): void {
    this.setLoading(LoadingService.KEYS.SHIPPING, loading);
  }

  setSearchLoading(loading: boolean): void {
    this.setLoading(LoadingService.KEYS.SEARCH, loading);
  }

  setDishDetailsLoading(loading: boolean): void {
    this.setLoading(LoadingService.KEYS.DISH_DETAILS, loading);
  }

  setOrderHistoryLoading(loading: boolean): void {
    this.setLoading(LoadingService.KEYS.ORDER_HISTORY, loading);
  }

  setInitialLoading(loading: boolean): void {
    this.setLoading(LoadingService.KEYS.INITIAL_LOAD, loading);
  }

  /**
   * Get loading observables for common operations
   */
  isDishesLoading(): Observable<boolean> {
    return this.isLoading(LoadingService.KEYS.DISHES);
  }

  isCategoriesLoading(): Observable<boolean> {
    return this.isLoading(LoadingService.KEYS.CATEGORIES);
  }

  isCartLoading(): Observable<boolean> {
    return this.isLoading(LoadingService.KEYS.CART);
  }

  isOrderLoading(): Observable<boolean> {
    return this.isLoading(LoadingService.KEYS.ORDER);
  }

  isCheckoutLoading(): Observable<boolean> {
    return this.isLoading(LoadingService.KEYS.CHECKOUT);
  }

  isShippingLoading(): Observable<boolean> {
    return this.isLoading(LoadingService.KEYS.SHIPPING);
  }

  isSearchLoading(): Observable<boolean> {
    return this.isLoading(LoadingService.KEYS.SEARCH);
  }

  isDishDetailsLoading(): Observable<boolean> {
    return this.isLoading(LoadingService.KEYS.DISH_DETAILS);
  }

  isOrderHistoryLoading(): Observable<boolean> {
    return this.isLoading(LoadingService.KEYS.ORDER_HISTORY);
  }

  isInitialLoading(): Observable<boolean> {
    return this.isLoading(LoadingService.KEYS.INITIAL_LOAD);
  }
}
