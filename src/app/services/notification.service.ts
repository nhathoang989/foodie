import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface NotificationConfig {
  message: string;
  action?: string;
  duration?: number;
  type?: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<NotificationConfig>();
  public notifications$ = this.notificationSubject.asObservable();

  /**
   * Show success notification
   */
  showSuccess(message: string, action?: string, duration: number = 3000): void {
    this.show({
      message,
      action,
      duration,
      type: 'success'
    });
  }

  /**
   * Show error notification
   */
  showError(message: string, action?: string, duration: number = 5000): void {
    this.show({
      message,
      action,
      duration,
      type: 'error'
    });
  }

  /**
   * Show warning notification
   */
  showWarning(message: string, action?: string, duration: number = 4000): void {
    this.show({
      message,
      action,
      duration,
      type: 'warning'
    });
  }

  /**
   * Show info notification
   */
  showInfo(message: string, action?: string, duration: number = 3000): void {
    this.show({
      message,
      action,
      duration,
      type: 'info'
    });
  }

  /**
   * Show notification with custom config
   */
  show(config: NotificationConfig): void {
    // Simple console log for now - can be enhanced with toast UI later
    const typeEmoji = this.getTypeEmoji(config.type);
    console.log(`${typeEmoji} ${config.type?.toUpperCase()}: ${config.message}`);
    
    // Emit notification for other components to listen
    this.notificationSubject.next(config);

    // Auto dismiss after duration
    if (config.duration && config.duration > 0) {
      setTimeout(() => {
        // Could implement dismissal logic here
      }, config.duration);
    }
  }

  /**
   * Show loading notification
   */
  showLoading(message: string = 'Loading...'): void {
    console.log(`⏳ LOADING: ${message}`);
  }

  /**
   * Dismiss all notifications
   */
  dismiss(): void {
    console.log('📴 Notifications dismissed');
  }

  private getTypeEmoji(type?: string): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  }

  /**
   * Cart-specific notifications
   */
  showCartAdded(dishName: string): void {
    this.showSuccess(`${dishName} added to cart!`, 'View Cart');
  }

  showCartRemoved(dishName: string): void {
    this.showInfo(`${dishName} removed from cart`);
  }

  showCartUpdated(): void {
    this.showSuccess('Cart updated successfully');
  }

  showCartCleared(): void {
    this.showInfo('Cart cleared');
  }

  /**
   * Order-specific notifications
   */
  showOrderCreated(orderId: number): void {
    this.showSuccess(`Order #${orderId} created successfully!`, 'View Order');
  }

  showOrderError(message: string = 'Failed to create order'): void {
    this.showError(message, 'Retry');
  }

  showOrderStatusUpdated(status: string): void {
    this.showInfo(`Order status updated to: ${status}`);
  }

  /**
   * Generic API notifications
   */
  showApiError(error: any): void {
    const message = error?.message || error?.error?.message || 'An error occurred';
    this.showError(message);
  }

  showConnectionError(): void {
    this.showError('Connection error. Please check your internet connection.', 'Retry');
  }

  showValidationError(message: string): void {
    this.showWarning(message);
  }
}
