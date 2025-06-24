import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { interval, Subscription, Observable, combineLatest } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { OrderService } from '../../../services/order.service';
import { DishService } from '../../../services/dish.service';
import { CustomerService } from '../../../services/customer.service';

interface DashboardMetrics {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  activeUsers: number;
  totalDishes: number;
  totalCustomers: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'customer' | 'dish';
  message: string;
  timestamp: Date;
  status?: string;
}

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
  lastUpdate: Date;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatListModule,
    MatProgressBarModule,
    MatChipsModule,
    RouterModule,
    DecimalPipe,
    DatePipe
  ]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  metrics: DashboardMetrics = {
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    activeUsers: 0,
    totalDishes: 0,
    totalCustomers: 0
  };

  recentActivities: RecentActivity[] = [];
  systemHealth: SystemHealth = {
    database: 'healthy',
    api: 'healthy',
    storage: 'healthy',
    lastUpdate: new Date()
  };

  loading = true;
  private refreshSubscription?: Subscription;

  constructor(
    private orderService: OrderService,
    private dishService: DishService,
    private customerService: CustomerService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
    // Refresh data every 30 seconds
    this.refreshSubscription = interval(30000)
      .pipe(startWith(0))
      .subscribe(() => this.loadDashboardData());
  }

  ngOnDestroy() {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
  private loadDashboardData() {
    this.loading = true;

    // Load metrics data
    const orders$ = this.orderService.getRecentOrders(1000); // Get more orders for metrics
    const dishes$ = this.dishService.getAll({ pageIndex: 0, pageSize: 1000 } as any);
    const customers$ = this.customerService.getAllCustomers();

    combineLatest([orders$, dishes$, customers$]).subscribe({
      next: ([orders, dishes, customers]) => {
        this.calculateMetrics(orders, dishes, customers);
        this.generateRecentActivities(orders);
        this.updateSystemHealth();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  private calculateMetrics(orders: any[], dishes: any[], customers: any[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.order_date);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    this.metrics = {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
      todayRevenue: todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
      activeUsers: customers.filter(customer => {
        // Consider users active if they have orders in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return orders.some(order => 
          order.customer_id === customer.id && 
          new Date(order.order_date) > thirtyDaysAgo
        );
      }).length,
      totalDishes: dishes.length,
      totalCustomers: customers.length
    };
  }

  private generateRecentActivities(orders: any[]) {
    // Generate recent activities from orders
    this.recentActivities = orders
      .slice(-10) // Get last 10 orders
      .reverse()
      .map(order => ({
        id: order.id,
        type: 'order' as const,
        message: `New order #${order.id} - $${order.total_amount?.toFixed(2)}`,
        timestamp: new Date(order.order_date),
        status: order.status
      }));
  }

  private updateSystemHealth() {
    // Simulate system health checks
    this.systemHealth = {
      database: Math.random() > 0.1 ? 'healthy' : 'warning',
      api: Math.random() > 0.05 ? 'healthy' : 'warning',
      storage: Math.random() > 0.02 ? 'healthy' : 'warning',
      lastUpdate: new Date()
    };
  }

  getHealthIcon(status: string): string {
    switch (status) {
      case 'healthy': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'help';
    }
  }

  getHealthColor(status: string): string {
    switch (status) {
      case 'healthy': return 'primary';
      case 'warning': return 'accent';
      case 'error': return 'warn';
      default: return '';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'order': return 'shopping_cart';
      case 'customer': return 'person';
      case 'dish': return 'restaurant';
      default: return 'info';
    }
  }

  refreshData() {
    this.loadDashboardData();
  }
}
