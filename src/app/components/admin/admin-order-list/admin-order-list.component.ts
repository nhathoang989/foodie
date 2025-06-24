import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule, NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models';
import { AdminOrderDetailComponent } from '../admin-order-detail/admin-order-detail.component';

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
    NgFor
  ]
})
export class AdminOrderListComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    const query = {
      pageIndex: 0,
      pageSize: 100,
      orderBy: 'id',
      direction: 'desc',
      loadNestedData: false
    };
    this.orderService.getAll(query as any).subscribe({
      next: (orders: Order[]) => {
        this.orders = orders;
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
