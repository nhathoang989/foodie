import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule, NgIf, CurrencyPipe } from '@angular/common';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models';
import { AdminOrderDetailComponent } from '../admin-order-detail/admin-order-detail.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

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
    MatFormFieldModule,
    CurrencyPipe,
    NgIf,
    MatPaginatorModule
  ]
})
export class AdminOrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;
  pageIndex = 0;
  pageSize = 15;
  totalCount = 0;

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(event?: PageEvent) {
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
    }
    this.loading = true;
    const query = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      orderBy: 'id',
      direction: 'desc',
      loadNestedData: false
    };
    this.orderService.getAll(query as any).subscribe({
      next: (result: any) => {
        if (Array.isArray(result)) {
          this.orders = result;
          this.totalCount = result.length < this.pageSize && this.pageIndex === 0 ? result.length : 1000;
        } else {
          this.orders = result.items || [];
          this.totalCount = result.totalCount || this.orders.length;
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.message || 'Failed to load orders';
        this.loading = false;
      }
    });
  }

  openDetail(order: Order) {
    this.dialog.open(AdminOrderDetailComponent, {
      width: '600px',
      data: { order }
    });
  }
}
