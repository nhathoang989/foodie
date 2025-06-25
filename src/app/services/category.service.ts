import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseMixDbDataService } from './base-mixdb-data.service';
import { Category } from '../models';
import { IPaginationResultModel } from '@mixcore/sdk-client';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends BaseMixDbDataService<Category> {
  protected tableName = 'mix_category';

  /**
   * Get all categories (paginated)
   */
  getAllCategories(pageIndex = 0, pageSize = 100): Observable<IPaginationResultModel<Category>> {
    const query = this.buildQuery({
      pageIndex,
      pageSize, // Assuming we won't have more than 100 categories
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
   * Get categories with dish count (paginated)
   */
  getCategoriesWithDishCount(pageIndex = 0, pageSize = 100): Observable<IPaginationResultModel<Category>> {
    const query = this.buildQuery({
      pageIndex,
      pageSize,
      orderBy: 'name',
      direction: 'asc',
      loadNestedData: true
    });

    return this.getAll(query);
  }
}
