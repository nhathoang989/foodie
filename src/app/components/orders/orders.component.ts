import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { Order, OrderItem } from '../../models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  filterStatus: string = '';
  filterDate: string = '';
  expandedOrderId: number | null = null;
  isLoading = false;

  constructor(
    private orderService: OrderService,
    private cartService: CartService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    // For demo, fetch all orders (replace with customer ID if available)
    this.orderService.getCustomerOrders(0).subscribe({
      next: res => {
        this.orders.set(res.items);
        this.isLoading = false;
      },
      error: () => {
        this.notification.showError('Failed to load orders');
        this.isLoading = false;
      }
    });
  }

  filterOrders() {
    let filtered = this.orders();
    if (this.filterStatus) {
      filtered = filtered.filter(o => o.status === this.filterStatus);
    }
    if (this.filterDate) {
      filtered = filtered.filter(o => o.order_date && o.order_date.toString().startsWith(this.filterDate));
    }
    return filtered;
  }

  toggleExpand(orderId: number) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  reorder(order: Order) {
    if (!order.items) return;
    order.items.forEach(item => {
      this.cartService.addToCart(item.dish!, item.quantity).subscribe();
    });
    this.notification.showSuccess('Items added to cart!');
  }
}
