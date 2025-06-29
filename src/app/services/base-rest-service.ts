// TypeScript/ES6 BaseRestService class inspired by AngularJS base-rest-service.js
// This is a generic base class for RESTful resource services

import { environment } from "../../environments/environment";

export class BaseRestService<T> {
  protected endpoint: string;

  constructor(modelName: string) {
    this.endpoint = `${environment.apiBaseUrl}/${modelName}`;
  }

  protected async getRestApiResult(req: RequestInit & { url: string }): Promise<any> {
    // Always add foodie_express_token from localStorage as Bearer token
    const token = localStorage.getItem('foodie_express_token');
    req.headers = {
      ...(req.headers || {}),
      'Authorization': token ? `Bearer ${token}` : '',
    };
    const response = await fetch(req.url, req);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  }

  async getList(queryParams: Record<string, any> = {}): Promise<T[]> {
    const url = this.buildUrl(this.endpoint, queryParams);
    return this.getRestApiResult({ url, method: 'GET' });
  }

  async getSingle(id: string | number, queryParams: Record<string, any> = {}): Promise<T> {
    const url = this.buildUrl(`${this.endpoint}/${id}`, queryParams);
    return this.getRestApiResult({ url, method: 'GET' });
  }

  async create(objData: T): Promise<T> {
    return this.getRestApiResult({
      url: this.endpoint,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(objData)
    });
  }

  async update(id: string | number, objData: Partial<T>): Promise<T> {
    return this.getRestApiResult({
      url: `${this.endpoint}/${id}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(objData)
    });
  }

  async delete(id: string | number): Promise<void> {
    await this.getRestApiResult({
      url: `${this.endpoint}/${id}`,
      method: 'DELETE'
    });
  }

  protected buildUrl(base: string, params: Record<string, any>): string {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    return query ? `${base}?${query}` : base;
  }
}
