import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseMixDbDataService } from './base-mixdb-data.service';
import { Contact, ContactFilter } from '../models';
import { IPaginationResultModel } from '@mixcore/sdk-client';

@Injectable({
  providedIn: 'root'
})
export class ContactService extends BaseMixDbDataService<Contact> {
  protected tableName = 'mix_contact';

  /**
   * Submit a new contact form
   */
  submitContact(contactData: Omit<Contact, 'id' | 'created_date_time'>): Observable<Contact> {
    const dataToSubmit = {
      ...contactData,
      status: 'new',
      is_read: false,
      created_by: 'system'
    };
    return this.create(dataToSubmit);
  }

  /**
   * Get contacts with filters (paginated)
   */
  getContacts(filter: ContactFilter = {}, page = 0, pageSize = 20): Observable<IPaginationResultModel<Contact>> {
    const queries: Array<{ fieldName: string; value: any; compareOperator: string }> = [];

    if (filter.search) {
      queries.push({
        fieldName: 'name',
        value: filter.search,
        compareOperator: 'Like'
      });
    }

    if (filter.status) {
      queries.push({
        fieldName: 'status',
        value: filter.status,
        compareOperator: 'Equal'
      });
    }

    if (filter.is_read !== undefined) {
      queries.push({
        fieldName: 'is_read',
        value: filter.is_read,
        compareOperator: 'Equal'
      });
    }

    if (filter.subject) {
      queries.push({
        fieldName: 'subject',
        value: filter.subject,
        compareOperator: 'Equal'
      });
    }

    if (filter.dateFrom) {
      queries.push({
        fieldName: 'created_date_time',
        value: filter.dateFrom,
        compareOperator: 'GreaterThanOrEqual'
      });
    }

    if (filter.dateTo) {
      queries.push({
        fieldName: 'created_date_time',
        value: filter.dateTo,
        compareOperator: 'LessThanOrEqual'
      });
    }

    const query = this.buildQuery({
      pageIndex: page,
      pageSize,
      orderBy: filter.sortBy?.field || 'created_date_time',
      direction: filter.sortBy?.direction || 'desc',
      loadNestedData: false,
      queries
    });

    return this.getAll(query);
  }

  /**
   * Mark contact as read
   */
  markAsRead(id: number): Observable<Contact> {
    return this.update(id, { 
      is_read: true,
      status: 'read'
    });
  }

  /**
   * Mark contact as unread
   */
  markAsUnread(id: number): Observable<Contact> {
    return this.update(id, { 
      is_read: false,
      status: 'new'
    });
  }

  /**
   * Update contact status
   */
  updateStatus(id: number, status: string): Observable<Contact> {
    return this.update(id, { status });
  }

  /**
   * Add response to contact
   */
  addResponse(id: number, responseMessage: string, respondedBy: string): Observable<Contact> {
    return this.update(id, { 
      response_message: responseMessage,
      responded_by: respondedBy,
      responded_at: new Date(),
      status: 'responded',
      is_read: true
    });
  }

  /**
   * Get unread contacts count
   */
  getUnreadCount(): Observable<number> {
    const query = this.buildQuery({
      pageIndex: 0,
      pageSize: 1000, // Get more to count properly
      orderBy: 'created_date_time',
      direction: 'desc',
      loadNestedData: false,
      queries: [{
        fieldName: 'is_read',
        value: false,
        compareOperator: 'Equal'
      }]
    });

    return this.getAll(query).pipe(
      map(result => result.items ? result.items.length : 0)
    );
  }

  /**
   * Get contacts by status
   */
  getContactsByStatus(status: string, page = 0, pageSize = 20): Observable<IPaginationResultModel<Contact>> {
    return this.getContacts({ status }, page, pageSize);
  }

  /**
   * Search contacts by name or email
   */
  searchContacts(searchTerm: string, page = 0, pageSize = 20): Observable<IPaginationResultModel<Contact>> {
    return this.getContacts({ search: searchTerm }, page, pageSize);
  }

  /**
   * Get contacts by subject
   */
  getContactsBySubject(subject: string, page = 0, pageSize = 20): Observable<IPaginationResultModel<Contact>> {
    return this.getContacts({ subject }, page, pageSize);
  }

  /**
   * Delete contact
   */
  deleteContact(id: number): Observable<void> {
    return this.delete(id);
  }
}
