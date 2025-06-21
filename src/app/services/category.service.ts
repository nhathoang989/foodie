import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseMixDbDataService } from './base-mixdb-data.service';
import { Category } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends BaseMixDbDataService<Category> {
  protected tableName = 'mix_category';

  /**
   * Get all categories
   */
  getAllCategories(): Observable<Category[]> {
    const query = this.buildQuery({
      pageIndex: 0,
      pageSize: 100, // Assuming we won't have more than 100 categories
      orderBy: 'name',
      direction: 'asc',
      loadNestedData: false
    });

    return this.getAll(query);
  }

  /**
   * Get category with dishes
   */
  getCategoryWithDishes(categoryId: number): Observable<Category> {
    const query = this.buildQuery({
      loadNestedData: true
    });

    return this.getById(categoryId);
  }

  /**
   * Get categories with dish count
   */
  getCategoriesWithDishCount(): Observable<Category[]> {
    const query = this.buildQuery({
      pageIndex: 0,
      pageSize: 100,
      orderBy: 'name',
      direction: 'asc',
      loadNestedData: true
    });

    return this.getAll(query);
  }
}
