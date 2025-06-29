import { Injectable } from '@angular/core';
import { BaseRestService } from './base-rest-service';

export interface PageContent {
  // Define the properties of your page content model here
  id?: number;
  title?: string;
  excerpt?: string;
  content?: string;
  // ...other fields as needed
}

@Injectable({ providedIn: 'root' })
export class PageService extends BaseRestService<PageContent> {
  constructor() {
    // Use the model name as in the constants: "/rest/mix-portal/mix-page-content"
    super('rest/mixcore/page-content');
  }
  async getBySeoName(seoName: string | number, queryParams: Record<string, any> = {}): Promise<PageContent> {
    const url = this.buildUrl(`${this.endpoint}/get-by-seo-name/${seoName}`, queryParams);
    return this.getRestApiResult({ url, method: 'GET' });
  }

}
