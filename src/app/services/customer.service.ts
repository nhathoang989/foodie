import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseMixDbDataService } from './base-mixdb-data.service';
import { Customer } from '../models';
import { MixQuery, IPaginationResultModel } from '@mixcore/sdk-client';

@Injectable({ providedIn: 'root' })
export class CustomerService extends BaseMixDbDataService<Customer> {
  protected tableName = 'mix_customer';

  /**
   * Get all customers (paginated)
   */
  getAllCustomers(pageIndex = 0, pageSize = 100): Observable<IPaginationResultModel<Customer>> {
    const query = this.buildQuery({
      pageIndex,
      pageSize,
      orderBy: 'name',
      direction: 'asc',
      loadNestedData: true
    });
    return this.getAll(query);
  }

  /**
   * Get paginated customers with optional filters
   */
  getPaginatedCustomers(query: Partial<MixQuery> = {}): Observable<IPaginationResultModel<Customer>> {
    const defaultQuery = {
      pageIndex: 0,
      pageSize: 20,
      orderBy: 'name',
      direction: 'asc',
      loadNestedData: true,
      ...query
    };
    return this.getAll(defaultQuery as MixQuery);
  }

  /**
   * Get customer by ID
   */
  getCustomerById(id: number | string): Observable<Customer> {
    return this.getById(id);
  }

  /**
   * Create a new customer
   */
  createCustomer(data: Partial<Customer>): Observable<Customer> {
    return this.create(data);
  }

  /**
   * Update a customer
   */
  updateCustomer(id: number | string, data: Partial<Customer>): Observable<Customer> {
    return this.update(id, data);
  }

  /**
   * Delete a customer
   */
  deleteCustomer(id: number | string): Observable<void> {
    return this.delete(id);
  }
}
