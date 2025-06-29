// TypeScript/ES6 BaseRestService class inspired by AngularJS base-rest-service.js
// This is a generic base class for RESTful resource services

import { MixcoreClient } from '@mixcore/sdk-client';
import { environment } from "../../environments/environment";

export class BaseRestService<T> {
  protected endpoint: string;
  protected mixClient: MixcoreClient;
  private isRefreshing = false;
  private failedQueue: Array<{ resolve: Function; reject: Function; request: RequestInit & { url: string } }> = [];

  constructor(modelName: string) {
    this.endpoint = `${environment.apiBaseUrl}/${modelName}`;
    this.mixClient = new MixcoreClient({
      endpoint: environment.apiBaseUrl,
      tokenKey: 'foodie_express_token',
      refreshTokenKey: 'foodie_express_refresh_token'
    });
  }

  protected async getRestApiResult(req: RequestInit & { url: string }): Promise<any> {
    return this.executeRequest(req);
  }

  private async executeRequest(req: RequestInit & { url: string }, isRetry = false): Promise<any> {
    // Always add foodie_express_token from localStorage as Bearer token
    const token = localStorage.getItem('foodie_express_token');
    req.headers = {
      ...(req.headers || {}),
      'Authorization': token ? `Bearer ${token}` : '',
    };

    const response = await fetch(req.url, req);
    
    // Handle 401 Unauthorized - token refresh logic
    if (response.status === 401 && !isRetry) {
      return this.handleUnauthorized(req);
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  private async handleUnauthorized(originalRequest: RequestInit & { url: string }): Promise<any> {
    // If already refreshing, queue this request
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject, request: originalRequest });
      });
    }

    this.isRefreshing = true;

    try {
      // Attempt to refresh the token using direct API call
      const refreshToken = localStorage.getItem('foodie_express_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const refreshResponse = await fetch(`${environment.apiBaseUrl}/api/account/renew-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!refreshResponse.ok) {
        throw new Error(`Token refresh failed: ${refreshResponse.status}`);
      }

      const tokenData = await refreshResponse.json();
      
      // Update the stored tokens
      if (tokenData.accessToken) {
        localStorage.setItem('foodie_express_token', tokenData.accessToken);
      }
      if (tokenData.refreshToken) {
        localStorage.setItem('foodie_express_refresh_token', tokenData.refreshToken);
      }
      
      console.log('✅ Token refreshed successfully!');
      
      // Process all queued requests with the new token
      this.processQueue(null);
      
      // Retry the original request with the new token
      return this.executeRequest(originalRequest, true);
      
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      
      // Process queue with error (reject all pending requests)
      this.processQueue(error);
      
      // Clear tokens and redirect to login
      localStorage.removeItem('foodie_express_token');
      localStorage.removeItem('foodie_express_refresh_token');
      localStorage.removeItem('foodie_express_user');
      
      // Redirect to login or throw error for handling by calling component
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/login';
      }
      
      throw new Error('Authentication failed. Please log in again.');
    } finally {
      this.isRefreshing = false;
    }
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject, request }) => {
      if (error) {
        reject(error);
      } else {
        resolve(this.executeRequest(request, true));
      }
    });
    
    this.failedQueue = [];
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

  /**
   * Get the MixcoreClient instance for advanced operations
   */
  protected getMixcoreClient(): MixcoreClient {
    return this.mixClient;
  }
}
