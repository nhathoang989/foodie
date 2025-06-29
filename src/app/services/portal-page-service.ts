import { Injectable } from '@angular/core';
import { BaseRestService } from './base-rest-service';
import { PageContent } from '../models';


@Injectable({ providedIn: 'root' })
export class PortalPageService extends BaseRestService<PageContent> {
  constructor() {
    // Use the model name as in the constants: "/rest/mix-portal/mix-page-content"
    super('rest/mix-portal/mix-page-content');
  }
  async getBySeoName(seoName: string | number, queryParams: Record<string, any> = {}): Promise<PageContent> {
    const url = this.buildUrl(`${this.endpoint}/get-by-seo-name/${seoName}`, queryParams);
    return this.getRestApiResult({ url, method: 'GET' });
  }

}
