import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseMixDbDataService } from './base-mixdb-data.service';
import { Order, OrderItem, Customer } from '../models';
import { IPaginationResultModel } from '@mixcore/sdk-client';

@Injectable({
  providedIn: 'root'
})
export class OrderService extends BaseMixDbDataService<Order> {
  protected tableName = 'mix_order';

  /**
   * Create a new order
   */
  createOrder(orderData: Partial<Order>): Observable<Order> {
    const order = {
      ...orderData,
      order_date: new Date(),
      created_date_time: new Date()
    };
    
    return this.create(order);
  }

  /**
   * Get orders for a customer
   */
  getCustomerOrders(customerId: number, page = 0, pageSize = 10): Observable<IPaginationResultModel<Order>> {
    const query = this.buildQuery({
      pageIndex: page,
      pageSize,
      orderBy: 'order_date',
      direction: 'desc',
      loadNestedData: true,
      queries: [{
        fieldName: 'customer_id',
        value: customerId,
        compareOperator: 'Equal'
      }]
    });

    return this.getAll(query);
  }

  /**
   * Get order by ID with full details
   */
  getOrderDetails(orderId: number): Observable<Order> {
    return this.getById(orderId);
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.update(orderId, { status });
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: string, page = 0, pageSize = 10): Observable<IPaginationResultModel<Order>> {
    const query = this.buildQuery({
      pageIndex: page,
      pageSize,
      orderBy: 'order_date',
      direction: 'desc',
      loadNestedData: true,
      queries: [{
        fieldName: 'status',
        value: status,
        compareOperator: 'Equal'
      }]
    });

    return this.getAll(query);
  }

  /**
   * Cancel order
   */
  cancelOrder(orderId: number): Observable<Order> {
    return this.updateOrderStatus(orderId, 'cancelled');
  }

  /**
   * Get recent orders
   */
  getRecentOrders(limit = 5): Observable<Order[]> {
    const query = this.buildQuery({
      pageIndex: 0,
      pageSize: limit,
      orderBy: 'order_date',
      direction: 'desc',
      loadNestedData: true
    });

    return this.getAll(query).pipe(
      map(result => (result.items))
    );;
  }

  /**
   * Search orders by customer name or order ID
   */
  searchOrders(searchTerm: string, page = 0, pageSize = 10): Observable<IPaginationResultModel<Order>> {
    // First try to search by order ID if the search term is numeric
    const isNumeric = /^\d+$/.test(searchTerm);
    
    const query = this.buildQuery({
      pageIndex: page,
      pageSize,
      orderBy: 'order_date',
      direction: 'desc',
      loadNestedData: true,
      queries: isNumeric ? [{
        fieldName: 'id',
        value: parseInt(searchTerm),
        compareOperator: 'Equal'
      }] : [{
        fieldName: 'phone_number',
        value: searchTerm,
        compareOperator: 'Contains'
      }]
    });

    return this.getAll(query);
  }
}
