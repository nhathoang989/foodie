import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule, NgIf } from '@angular/common';
import { OrderService } from '../../../services/order.service';
import { Order, PaginationModel } from '../../../models';
import { AdminOrderDetailComponent } from '../admin-order-detail/admin-order-detail.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PriceUtil } from '../../../utils/price.util';
import { PricePipe } from '../../../pipes/price.pipe';

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

  constructor(private orderService: OrderService, private dialog: MatDialog) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(event?: PageEvent) {
    if (event) {
      this.pagingData.pageIndex = event.pageIndex;
      this.pagingData.pageSize = event.pageSize;
    }
    this.loading = true;
    const query = {
      pagingData: this.pagingData,
      orderBy: 'id',
      direction: 'desc',
      loadNestedData: false,
    };
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

  formatPrice(price: number): string {
    return PriceUtil.formatPrice(price);
  }
}
