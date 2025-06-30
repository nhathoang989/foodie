import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { MixcoreClient } from '@mixcore/sdk-client';
import { environment } from '../../environments/environment';
import { AUTH_CONSTANTS } from '../constants/auth.constants';

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  roles?: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private mixClient: MixcoreClient;

  constructor(
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.mixClient = new MixcoreClient({
      endpoint: environment.apiBaseUrl,
      tokenKey: AUTH_CONSTANTS.TOKEN_KEY,
      refreshTokenKey: AUTH_CONSTANTS.REFRESH_TOKEN_KEY
    });
    this.loadUserFromStorage();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  /**
   * Login user with username and password
   */
  async login(credentials: LoginRequest): Promise<boolean> {
    this.isLoadingSubject.next(true);
    try {
      await this.mixClient.auth.login({
        username: credentials.username,
        password: credentials.password
      });
      // Fetch user profile after login
      const profile = await this.mixClient.auth.initUserData();
      const user: User = {
        id: Number(profile.id) || 0,
        username: profile.userName,
        name: profile.name || profile.userName,
        email: profile.email,
        roles: profile.roles ? profile.roles.map(role => typeof role === 'string' ? role : (role.roleId || role.roleId || '')) : []
      };
      this.setUser(user);
      this.notificationService.showSuccess('Login successful!');
      return true;
    } catch (error: any) {
      this.notificationService.showError(error.message || 'Login failed. Please check your credentials.');
      return false;
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<boolean> {
    this.isLoadingSubject.next(true);
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      await this.mixClient.auth.register({
        userName: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
      });
      // Fetch user profile after registration
      const profile = await this.mixClient.auth.initUserData();
      const user: User = {
        id: Number(profile.id) || 0,
        username: profile.userName,
        name: profile.name || profile.userName,
        email: profile.email,
        roles: profile.roles ? profile.roles.map(role => typeof role === 'string' ? role : (role.roleId || role.roleId || '')) : []
      };
      this.setUser(user);
      this.notificationService.showSuccess('Registration successful!');
      return true;
    } catch (error: any) {
      this.notificationService.showError(error.message || 'Registration failed.');
      return false;
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Logout current user
   */
  logout(): void {
    localStorage.removeItem(AUTH_CONSTANTS.USER_KEY);
    localStorage.removeItem(AUTH_CONSTANTS.TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.notificationService.showInfo('You have been logged out.');
    this.router.navigate(['/']);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.currentUser?.roles?.indexOf(role) !== -1 || false;
  }

  /**
   * Refresh user data
   */
  async refreshUser(): Promise<void> {
    if (!this.isLoggedIn) return;

    try {
      // TODO: Replace with actual MixCore API call
      // const userData = await this.customerService.getByColumn('username', this.currentUser!.username);
      // this.setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<boolean> {
    if (!this.isLoggedIn) return false;

    this.isLoadingSubject.next(true);
    
    try {
      // TODO: Replace with actual MixCore API call
      await this.simulateApiCall();
      
      const updatedUser = { ...this.currentUser!, ...updates };
      this.setUser(updatedUser);
      this.notificationService.showSuccess('Profile updated successfully!');
      return true;
    } catch (error) {
      this.notificationService.showError('Failed to update profile.');
      return false;
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    if (!this.isLoggedIn) return false;

    this.isLoadingSubject.next(true);
    
    try {
      // TODO: Replace with actual MixCore API call
      await this.simulateApiCall();
      
      this.notificationService.showSuccess('Password changed successfully!');
      return true;
    } catch (error) {
      this.notificationService.showError('Failed to change password.');
      return false;
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<boolean> {
    this.isLoadingSubject.next(true);
    
    try {
      // TODO: Replace with actual MixCore API call
      await this.simulateApiCall();
      
      this.notificationService.showSuccess('Password reset instructions sent to your email.');
      return true;
    } catch (error) {
      this.notificationService.showError('Failed to reset password.');
      return false;
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  private setUser(user: User): void {
    localStorage.setItem(AUTH_CONSTANTS.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem(AUTH_CONSTANTS.USER_KEY);
    const token = localStorage.getItem(AUTH_CONSTANTS.TOKEN_KEY);
    
    if (userData && token) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        this.logout();
      }
    }
  }

  private async simulateApiCall(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000); // Simulate network delay
    });
  }
}

// TODO: Implement actual MixCore integration
/*
Example of how to integrate with @mixcore/sdk-client:

import { MixCoreClient } from '@mixcore/sdk-client';

// Initialize MixCore client
const mixClient = new MixCoreClient({
  baseUrl: 'your-mixcore-api-url',
  apiKey: 'your-api-key'
});

// Login implementation
async login(credentials: LoginRequest): Promise<boolean> {
  try {
    const response = await mixClient.auth.login({
      username: credentials.username,
      password: credentials.password
    });
    
    const user: User = {
      id: response.user.id,
      username: response.user.username,
      name: response.user.displayName,
      email: response.user.email,
      role: response.user.role
    };
    
    this.setUser(user);
    // Store the actual token
    localStorage.setItem('foodie_express_token', response.token);
    
    return true;
  } catch (error) {
    throw error;
  }
}

// Get customer by username
async getCustomerByUsername(username: string): Promise<User> {
  const response = await mixClient.data.getByColumn('mix_customer', 'username', username);
  return response.data;
}
*/
