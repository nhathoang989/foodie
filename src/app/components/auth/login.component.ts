import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule, NavigationExtras } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  returnUrl: string = '/';
  previousUrl: string | null = null;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private location: Location
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    // Redirect if already logged in
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/']);
      return;
    }

    // Get return URL from route parameters
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Get previous URL from navigation history
    this.previousUrl = sessionStorage.getItem('previousUrl');
    
    // Subscribe to loading state
    this.authService.isLoading$.subscribe(loading => {
      this.isLoading = loading;
      this.loadingService.setLoading('auth', loading);
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const credentials: LoginRequest = this.loginForm.value;
    
    try {
      const success = await this.authService.login(credentials);
      if (success) {
        // Determine where to navigate after login
        if (this.returnUrl !== '/') {
          // If there's a specific returnUrl in the query params, use that
          this.router.navigate([this.returnUrl]);
        } else if (this.previousUrl && !this.previousUrl.includes('/login') && !this.previousUrl.includes('/register')) {
          // If there's a previousUrl in session storage that's not login or register, navigate there
          this.router.navigateByUrl(this.previousUrl);
        } else {
          // Default fallback to home
          this.router.navigate(['/']);
        }
        
        // Clear the previousUrl from session storage
        sessionStorage.removeItem('previousUrl');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Quick login for demo purposes
  quickLogin(type: 'customer' | 'admin') {
    if (type === 'customer') {
      this.loginForm.patchValue({
        username: 'customer',
        password: 'password123'
      });
    } else {
      this.loginForm.patchValue({
        username: 'admin',
        password: 'admin123'
      });
    }
  }
}
