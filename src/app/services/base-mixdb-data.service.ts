import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MixcoreClient, MixQuery, IMixFilter, IPaginationResultModel } from '@mixcore/sdk-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export abstract class BaseMixDbDataService<T> {
  protected mixcoreClient: MixcoreClient;
  protected abstract tableName: string;

  constructor() {
    this.mixcoreClient = new MixcoreClient({
      endpoint: environment.apiBaseUrl,
      tokenKey: 'mix_access_token',
      refreshTokenKey: 'mix_refresh_token'
    });
  }  /**
   * Get all data (paginated by default)
   */
  getAll(query: MixQuery): Observable<IPaginationResultModel<T>> {
    return from(this.mixcoreClient.table.filterData(this.tableName, query)) as Observable<IPaginationResultModel<T>>;
  }  /**
   * Get single record by ID
   */
  getById(id: string | number): Observable<T> {
    return from(this.mixcoreClient.table.getDataById(this.tableName, id.toString()) as Promise<T>)
      .pipe(
        catchError(this.handleError<T>('getById'))
      );
  }
  /**
   * Create a new record
   */
  create(data: Partial<T>): Observable<T> {
    return from(this.mixcoreClient.table.createData(this.tableName, data))
      .pipe(
        map(item => item as T),
        catchError(this.handleError<T>('create'))
      );
  }
  /**
   * Update an existing record
   */
  update(id: string | number, data: Partial<T>): Observable<T> {
    return from(this.mixcoreClient.table.updateData(this.tableName, id.toString(), data))
      .pipe(
        map(item => item as T),
        catchError(this.handleError<T>('update'))
      );
  }
  /**
   * Delete a record
   */
  delete(id: string | number): Observable<void> {
    return from(this.mixcoreClient.table.deleteData(this.tableName, id.toString()))
      .pipe(
        map(() => undefined),
        catchError(this.handleError<void>('delete'))
      );
  }
  /**
   * Create multiple records
   */
  createMany(data: Partial<T>[]): Observable<T[]> {
    const createPromises = data.map(item => 
      this.mixcoreClient.table.createData(this.tableName, item)
    );
    
    return from(Promise.all(createPromises))
      .pipe(
        map(items => items as T[]),
        catchError(this.handleError<T[]>('createMany', []))
      );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue by returning an error result.
   */
  private handleError<TResult>(operation = 'operation', result?: TResult) {
    return (error: any): Observable<TResult> => {
      console.error(`${operation} failed:`, error);
      
      // Let the app keep running by returning an empty result.
      return new Observable<TResult>(observer => {
        if (result !== undefined) {
          observer.next(result);
        } else {
          observer.error(error);
        }
        observer.complete();
      });
    };
  }  /**
   * Build a MixQuery for common operations
   */
  protected buildQuery(options: {
    pageIndex?: number;
    pageSize?: number;
    orderBy?: string;
    direction?: 'asc' | 'desc';
    loadNestedData?: boolean;
    queries?: Array<{ fieldName: string; value: any; compareOperator: string }>;
  }): MixQuery {
    const query: any = {
      pageIndex: options.pageIndex || 0,
      pageSize: options.pageSize || environment.dishesPerPage,
      orderBy: options.orderBy || 'id',
      direction: options.direction === 'desc' ? 'desc' : 'asc',
      loadNestedData: options.loadNestedData || false,
       sortByColumns: [
        {
          fieldName: options.orderBy || 'id',
          direction: options.direction || 'asc'
        }
      ]
    };

    if (options.queries && options.queries.length > 0) {
      query.queries = options.queries;
    }

    return query as MixQuery;
  }
}
