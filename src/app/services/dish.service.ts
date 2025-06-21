import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseMixDbDataService } from './base-mixdb-data.service';
import { Dish, DishFilter, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DishService extends BaseMixDbDataService<Dish> {
  protected tableName = 'mix_dish';

  /**
   * Get dishes with filters
   */
  getDishes(filter: DishFilter = {}, page = 0, pageSize = 12): Observable<PaginatedResponse<Dish>> {
    const queries: Array<{ fieldName: string; value: any; compareOperator: string }> = [];

    if (filter.categoryId) {
      queries.push({
        fieldName: 'category_id',
        value: filter.categoryId,
        compareOperator: 'Equal'
      });
    }

    if (filter.search) {
      queries.push({
        fieldName: 'name',
        value: filter.search,
        compareOperator: 'Like'
      });
    }

    if (filter.priceMin !== undefined) {
      queries.push({
        fieldName: 'price',
        value: filter.priceMin,
        compareOperator: 'GreaterThanOrEqual'
      });
    }

    if (filter.priceMax !== undefined) {
      queries.push({
        fieldName: 'price',
        value: filter.priceMax,
        compareOperator: 'LessThanOrEqual'
      });
    }

    if (filter.isRecommended !== undefined) {
      queries.push({
        fieldName: 'is_recommended',
        value: filter.isRecommended,
        compareOperator: 'Equal'
      });
    }

    if (filter.availability !== undefined) {
      queries.push({
        fieldName: 'availability',
        value: filter.availability,
        compareOperator: 'Equal'
      });
    }

    const query = this.buildQuery({
      pageIndex: page,
      pageSize,
      orderBy: 'name',
      direction: 'asc',
      loadNestedData: true,
      queries
    });

    return this.getPaginated(query).pipe(
      map(result => ({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        hasNext: (result.page + 1) * result.pageSize < result.total,
        hasPrevious: result.page > 0
      }))
    );
  }

  /**
   * Get recommended dishes
   */
  getRecommendedDishes(limit = 6): Observable<Dish[]> {
    const query = this.buildQuery({
      pageIndex: 0,
      pageSize: limit,
      orderBy: 'name',
      direction: 'asc',
      loadNestedData: true,
      queries: [{
        fieldName: 'is_recommended',
        value: true,
        compareOperator: 'Equal'
      }]
    });

    return this.getAll(query);
  }

  /**
   * Get dishes by category
   */
  getDishesByCategory(categoryId: number, page = 0, pageSize = 12): Observable<PaginatedResponse<Dish>> {
    return this.getDishes({ categoryId }, page, pageSize);
  }

  /**
   * Search dishes by name
   */
  searchDishes(searchTerm: string, page = 0, pageSize = 12): Observable<PaginatedResponse<Dish>> {
    return this.getDishes({ search: searchTerm }, page, pageSize);
  }

  /**
   * Get available dishes only
   */
  getAvailableDishes(page = 0, pageSize = 12): Observable<PaginatedResponse<Dish>> {
    return this.getDishes({ availability: true }, page, pageSize);
  }

  /**
   * Update dish inventory
   */
  updateInventory(dishId: number, newInventory: number): Observable<Dish> {
    return this.update(dishId, { inventory: newInventory });
  }

  /**
   * Toggle dish availability
   */
  toggleAvailability(dishId: number, availability: boolean): Observable<Dish> {
    return this.update(dishId, { availability });
  }
}
