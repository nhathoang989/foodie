import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BaseRestService } from './base-rest-service';
import { AuthService } from './auth.service';
import { PageContent } from '../models';

@Injectable({ providedIn: 'root' })
export class PageService extends BaseRestService<PageContent> {
  constructor(router: Router, authService: AuthService) {
    // Use the model name as in the constants: "/rest/mix-portal/mix-page-content"
    super('rest/mixcore/page-content', router, authService);
  }
  async getBySeoName(seoName: string | number, queryParams: Record<string, any> = {}): Promise<PageContent> {
    const url = this.buildUrl(`${this.endpoint}/get-by-seo-name/${seoName}`, queryParams);
    return this.getRestApiResult({ url, method: 'GET' });
  }

}
