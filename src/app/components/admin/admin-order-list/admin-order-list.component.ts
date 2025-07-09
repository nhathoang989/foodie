import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { OrderService } from '../../../services/order.service';
import { Order, PaginationModel } from '../../../models';
import { AdminOrderDetailComponent } from '../admin-order-detail/admin-order-detail.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PriceUtil } from '../../../utils/price.util';
import { PricePipe } from '../../../pipes/price.pipe';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-admin-order-list',
  templateUrl: './admin-order-list.component.html',
  styleUrls: ['./admin-order-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgIf,
    MatPaginatorModule,
    PricePipe,
  ],
})
export class AdminOrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;
  pagingData = { total: 0, pageSize: 15, pageIndex: 0 };
  orderStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
  selectedStatusFilter: string = 'all';
  
  // Status color map
  statusColorMap: {[key: string]: string} = {
    'pending': 'status-pending',
    'confirmed': 'status-confirmed',
    'delivered': 'status-delivered',
    'cancelled': 'status-cancelled'
  };
  updatingOrderIds: Set<number> = new Set();

  constructor(
    private orderService: OrderService, 
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(event?: PageEvent) {
    if (event) {
      this.pagingData.pageIndex = event.pageIndex;
      this.pagingData.pageSize = event.pageSize;
    } else {
      // Reset to first page when filters change
      this.pagingData.pageIndex = 0;
    }
    
    this.loading = true;
    const query: any = {
      pagingData: this.pagingData,
      orderBy: 'id',
      direction: 'desc',
      loadNestedData: false,
      queries: []
    };
    
    // Add status filter if not 'all'
    if (this.selectedStatusFilter !== 'all') {
      query.queries.push({
        fieldName: 'status',
        value: this.selectedStatusFilter,
        compareOperator: 'Equal'
      });
    }
    
    this.orderService.getAll(query as any).subscribe({
      next: (result: any) => {
        this.orders = result.items || [];
        this.pagingData = result.pagingData || this.pagingData;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.message || 'Failed to load orders';
        this.loading = false;
      },
    });
  }

  openDetail(order: Order) {
    this.dialog.open(AdminOrderDetailComponent, {
      width: '600px',
      data: { order },
    });
  }

  updateOrderStatus(order: Order, newStatus: string) {
    const originalStatus = order.status;
    
    // If the status hasn't actually changed, just return
    if (originalStatus === newStatus || !order.id) {
      return; // No change needed or invalid order
    }
    
    // Add order ID to updating set for UI feedback
    this.updatingOrderIds.add(order.id);
    
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        // Update the order in the local array
        const index = this.orders.findIndex(o => o.id === updatedOrder.id);
        if (index !== -1) {
          this.orders[index].status = updatedOrder.status;
        }
        this.notification.showSuccess(`Order #${order.id} status updated to ${newStatus}`);
        
        // Remove from updating set
        if (order.id) {
          this.updatingOrderIds.delete(order.id);
        }
      },
      error: (err) => {
        this.error = err?.message || 'Failed to update order status';
        this.notification.showError(this.error || 'Failed to update order status');
        
        // Remove from updating set and revert status
        if (order.id) {
          this.updatingOrderIds.delete(order.id);
          
          // Revert the status in the UI
          order.status = originalStatus;
          
          // Also update the order in our array to ensure consistency
          const orderInArray = this.orders.find(o => o.id === order.id);
          if (orderInArray) {
            orderInArray.status = originalStatus;
          }
        }
      }
    });
  }

  isUpdating(orderId?: number): boolean {
    return orderId !== undefined && this.updatingOrderIds.has(orderId);
  }

  /**
   * Get CSS class for status styling
   */
  getStatusClass(status: string): string {
    return this.statusColorMap[status.toLowerCase()] || '';
  }

  formatPrice(price: number): string {
    return PriceUtil.formatPrice(price);
  }
  
  /**
   * Handle status filter change
   */
  onStatusFilterChange(newFilter: string) {
    this.selectedStatusFilter = newFilter;
    this.loadOrders();
  }
}
