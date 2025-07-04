import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseMixDbDataService } from './base-mixdb-data.service';
import { Dish, DishFilter, Category } from '../models';
import { IPaginationResultModel } from '@mixcore/sdk-client';

@Injectable({
  providedIn: 'root'
})
export class DishService extends BaseMixDbDataService<Dish> {
  protected tableName = 'mix_dish';
  private dishCache: { [id: number]: Dish } = {};
  private categoryCache: { [id: number]: Category } = {};

  /**
   * Get dish by id and cache it
   */
  override getById(id: number): Observable<Dish> {
    return super.getById(id).pipe(
      map(dish => {
        if (dish && dish.id) {
          this.dishCache[dish.id] = dish;
          if (dish.category && dish.category.id) {
            this.categoryCache[dish.category.id] = dish.category;
          }
        }
        return dish;
      })
    );
  }

  /**
   * Get cached dish by id
   */
  getCachedDish(id: number): Dish | null {
    return this.dishCache[id] || null;
  }

  /**
   * Get dishes with filters (paginated)
   */
  getDishes(filter: DishFilter = {}, page = 0, pageSize = 12): Observable<IPaginationResultModel<Dish>> {
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
      orderBy: filter.sortBy?.field || 'name',
      direction: filter.sortBy?.direction || 'asc',
      loadNestedData: true,
      queries
    });

    return this.getAll(query).pipe(
      map(result => {
        if (result && Array.isArray(result.items)) {
          result.items.forEach(dish => {
            if (dish && dish.id) {
              this.dishCache[dish.id] = dish;
              if (dish.category && dish.category.id) {
                this.categoryCache[dish.category.id] = dish.category;
              }
            }
          });
        }
        return result;
      })
    );
  }

  /**
   * Get recommended dishes (array only)
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

    return this.getAll(query).pipe(
      map(result => {
        if (result && Array.isArray(result.items)) {
          result.items.forEach(dish => {
            if (dish && dish.id) {
              this.dishCache[dish.id] = dish;
              if (dish.category && dish.category.id) {
                this.categoryCache[dish.category.id] = dish.category;
              }
            }
          });
        }
        return result.items;
      })
    );
  }

  /**
   * Get dishes by category
   */
  getDishesByCategory(categoryId: number, page = 0, pageSize = 12): Observable<IPaginationResultModel<Dish>> {
    return this.getDishes({ categoryId }, page, pageSize);
  }

  /**
   * Search dishes by name
   */
  searchDishes(searchTerm: string, page = 0, pageSize = 12): Observable<IPaginationResultModel<Dish>> {
    return this.getDishes({ search: searchTerm }, page, pageSize);
  }

  /**
   * Get available dishes only
   */
  getAvailableDishes(page = 0, pageSize = 12): Observable<IPaginationResultModel<Dish>> {
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
