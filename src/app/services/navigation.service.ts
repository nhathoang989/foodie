import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ViewportScroller } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private previousUrl: string | null = null;
  private currentUrl: string | null = null;

  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.urlAfterRedirects;
        
        // Scroll to top on each navigation
        this.viewportScroller.scrollToPosition([0, 0]);
        
        // Store the previous URL in session storage when navigating to login
        if (event.urlAfterRedirects.includes('/login') && this.previousUrl) {
          sessionStorage.setItem('previousUrl', this.previousUrl);
        }
      });
  }

  public getPreviousUrl(): string | null {
    return this.previousUrl;
  }

  public getCurrentUrl(): string | null {
    return this.currentUrl;
  }
}
