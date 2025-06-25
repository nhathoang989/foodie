import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseMixDbDataService } from './base-mixdb-data.service';
import { ShippingOption } from '../models';
import { IPaginationResultModel } from '@mixcore/sdk-client';

@Injectable({
  providedIn: 'root'
})
export class ShippingService extends BaseMixDbDataService<ShippingOption> {
  protected tableName = 'mix_shipping_option';

  /**
   * Get all shipping options (paginated)
   */
  getAllShippingOptions(pageIndex = 0, pageSize = 50): Observable<IPaginationResultModel<ShippingOption>> {
    const query = this.buildQuery({
      pageIndex,
      pageSize, // Assuming we won't have more than 50 shipping options
      orderBy: 'name',
      direction: 'asc',
      loadNestedData: false
    });

    return this.getAll(query);
  }

  /**
   * Get shipping option by ID
   */
  getShippingOptionById(id: number): Observable<ShippingOption> {
    return this.getById(id);
  }

  /**
   * Get free shipping options (paginated)
   */
  getFreeShippingOptions(pageIndex = 0, pageSize = 50): Observable<IPaginationResultModel<ShippingOption>> {
    const query = this.buildQuery({
      pageIndex,
      pageSize,
      orderBy: 'name',
      direction: 'asc',
      loadNestedData: false,
      queries: [{
        fieldName: 'fee',
        value: 0,
        compareOperator: 'Equal'
      }]
    });

    return this.getAll(query);
  }

  /**
   * Get paid shipping options (paginated)
   */
  getPaidShippingOptions(pageIndex = 0, pageSize = 50): Observable<IPaginationResultModel<ShippingOption>> {
    const query = this.buildQuery({
      pageIndex,
      pageSize,
      orderBy: 'fee',
      direction: 'asc',
      loadNestedData: false,
      queries: [{
        fieldName: 'fee',
        value: 0,
        compareOperator: 'GreaterThan'
      }]
    });

    return this.getAll(query);
  }

  /**
   * Calculate shipping fee for given option
   */
  calculateShippingFee(shippingOptionId: number): Observable<number> {
    return this.getById(shippingOptionId).pipe(
      map((option: ShippingOption) => option.fee || 0)
    );
  }

  /**
   * Get cheapest shipping option
   */
  getCheapestShippingOption(): Observable<ShippingOption | undefined> {
    const query = this.buildQuery({
      pageIndex: 0,
      pageSize: 1,
      orderBy: 'fee',
      direction: 'asc',
      loadNestedData: false
    });

    return this.getAll(query).pipe(
      map(result => result.items[0])
    );
  }
}
