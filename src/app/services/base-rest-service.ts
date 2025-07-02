// TypeScript/ES6 BaseRestService class inspired by AngularJS base-rest-service.js
// This is a generic base class for RESTful resource services

import { MixcoreClient } from '@mixcore/sdk-client';
import { environment } from '../../environments/environment';
import { AUTH_CONSTANTS } from '../constants/auth.constants';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export class BaseRestService<T> {
  protected endpoint: string;
  protected mixClient: MixcoreClient;
  protected router?: Router;
  protected authService?: AuthService;
  private document: Document;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: Function;
    reject: Function;
    request: RequestInit & { url: string };
  }> = [];

  constructor(modelName: string, router?: Router, authService?: AuthService) {
    this.endpoint = `${environment.apiBaseUrl}/${modelName}`;
    this.mixClient = new MixcoreClient({
      endpoint: environment.apiBaseUrl,
      tokenKey: AUTH_CONSTANTS.TOKEN_KEY,
      refreshTokenKey: AUTH_CONSTANTS.REFRESH_TOKEN_KEY,
    });
    this.router = router;
    this.authService = authService;
    this.document = inject(DOCUMENT);
  }

  private getBaseHref(): string {
    return this.document.querySelector('base')?.getAttribute('href') || '/';
  }

  protected async getRestApiResult(
    req: RequestInit & { url: string }
  ): Promise<any> {
    return this.executeRequest(req);
  }

  private async executeRequest(
    req: RequestInit & { url: string },
    isRetry = false
  ): Promise<any> {
    // Always add foodie_express_token from localStorage as Bearer token
    const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
    req.headers = {
      ...(req.headers || {}),
      Authorization: token ? `Bearer ${token}` : '',
    };

    const response = await fetch(req.url, req);

    // Handle 401 Unauthorized - token refresh logic
    if (response.status === 401 && !isRetry) {
      return this.handleUnauthorized(req);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        errorText || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response.json();
  }

  private async handleUnauthorized(
    originalRequest: RequestInit & { url: string }
  ): Promise<any> {
    // If already refreshing, queue this request
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject, request: originalRequest });
      });
    }

    this.isRefreshing = true;

    try {
      // Use AuthService for token refresh if available
      if (this.authService) {
        console.log('🔄 Using AuthService to refresh token...');
        await this.authService.refreshToken();
      } else {
        // Fallback: Direct token refresh call
        const refreshToken = localStorage.getItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY);
        const accessToken = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        console.log('🔄 Using fallback token refresh...');
        const refreshResponse = await fetch(
          `${environment.apiBaseUrl}/auth/user/renew-token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refreshToken: refreshToken,
              accessToken: accessToken,
            }),
          }
        );

        if (!refreshResponse.ok) {
          throw new Error(`Token refresh failed: ${refreshResponse.status}`);
        }

        const tokenData = await refreshResponse.json();

        // Update the stored tokens
        if (tokenData.accessToken) {
          localStorage.setItem(AUTH_CONSTANTS.TOKEN_KEY, tokenData.accessToken);
        }
        if (tokenData.refreshToken) {
          localStorage.setItem(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, tokenData.refreshToken);
        }
        
        console.log('✅ Token refreshed successfully via fallback!');
      }

      // Process all queued requests with success
      this.processQueue(null);

      // Retry the original request with the new token
      return this.executeRequest(originalRequest, true);
    } catch (error) {
      console.error('❌ Token refresh failed:', error);

      // Process queue with error (reject all pending requests)
      this.processQueue(error);

      // AuthService already handles logout and redirect with returnUrl when refreshToken fails
      // So we just need to throw the error
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

  async getSingle(
    id: string | number,
    queryParams: Record<string, any> = {}
  ): Promise<T> {
    const url = this.buildUrl(`${this.endpoint}/${id}`, queryParams);
    return this.getRestApiResult({ url, method: 'GET' });
  }

  async create(objData: T): Promise<T> {
    return this.getRestApiResult({
      url: this.endpoint,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(objData),
    });
  }

  async update(id: string | number, objData: Partial<T>): Promise<T> {
    return this.getRestApiResult({
      url: `${this.endpoint}/${id}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(objData),
    });
  }

  async delete(id: string | number): Promise<void> {
    await this.getRestApiResult({
      url: `${this.endpoint}/${id}`,
      method: 'DELETE',
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
