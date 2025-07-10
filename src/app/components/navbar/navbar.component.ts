import { Component, OnInit, HostListener, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { DishService } from '../../services/dish.service';
import { AuthService, User } from '../../services/auth.service';
import { Observable, Subject, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { map, filter, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { Dish } from '../../models';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';
import { LanguageSwitcherComponent } from '../shared/language-switcher/language-switcher.component';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { PriceUtil } from '../../utils/price.util';

interface Breadcrumb {
  label: string;
  url: string;
  slug?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule, LanguageSwitcherComponent, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;
    searchValue = '';
  searchResults: Dish[] = [];
  cartItemCount$: Observable<number>;
  currentUser$: Observable<User | null>;
  
  // UI States
  isMobileMenuOpen = false;
  isSearchOpen = false;
  isSearchFocused = false;
  isUserMenuOpen = false;
  isAdminNavOpen = false;
  isDesktop = window.innerWidth > 768;
  isScrolled = false;
  
  // Search
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  // Breadcrumbs
  breadcrumbs: Breadcrumb[] = [];
  
  // Site name from environment
  siteName: string = environment.siteName;
  siteDescription: string = environment.siteDescription;
  
  // User (placeholder for authentication)
  currentUser: any = null;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private dishService: DishService,
    private authService: AuthService
  ) {
    this.cartItemCount$ = this.cartService.cartState$.pipe(
      // @ts-ignore
      map(state => state.itemCount)
    );
    
    this.currentUser$ = this.authService.currentUser$;
  }
  ngOnInit() {
    this.setupSearch();
    this.setupBreadcrumbs();
    this.setupAuth();
    this.updateIsDesktop();
    window.addEventListener('resize', this.updateIsDesktop.bind(this));
    window.addEventListener('scroll', this.onScroll.bind(this));
    this.isAdminNavOpen = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.unlockBodyScroll();
    window.removeEventListener('resize', this.updateIsDesktop.bind(this));
    window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  updateIsDesktop() {
    this.isDesktop = window.innerWidth > 768;
  }

  onScroll() {
    this.isScrolled = window.scrollY > 40;
  }

  private setupSearch() {    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (term.length < 2) return of({ items: [], total: 0, page: 0, pageSize: 0 });
        return this.dishService.getDishes({ search: term }, 0, 5);
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      this.searchResults = result.items || [];
    });
  }

  private setupBreadcrumbs() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.buildBreadcrumbs();
    });
  }

  private buildBreadcrumbs() {
    this.breadcrumbs = [{ label: 'Home', url: '/' }];
    const url = this.router.url.split('?')[0];
    const pathSegments = url.split('/').filter(segment => segment);
    let currentPath = '';
    // If viewing a dish details page, try to get the slug from the state or service
    if (pathSegments[0] === 'dish' && pathSegments[1]) {
      const dishId = Number(pathSegments[1]);
      let label = 'Dish Details';
      // Try to get the dish object if available
      const dish = this.dishService.getCachedDish(dishId);
      if (dish && dish.name) {
        label = dish.name;
      }
      this.breadcrumbs.push({ label: label, url: `/dish/${dishId}` });
      return;
    }
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      let label = this.getRouteLabel(segment, pathSegments, index);
      this.breadcrumbs.push({ label, url: currentPath });
    });
  }

  private getRouteLabel(segment: string, pathSegments: string[], index: number): string {
    const routeLabels: { [key: string]: string } = {
      'dish': 'Dish Details',
      'cart': 'Shopping Cart',
      'checkout': 'Checkout',
      'orders': 'My Orders',
      'order-confirmation': 'Order Confirmation',
      'about': 'About Us',
      'contact': 'Contact',
      'terms': 'Terms of Service',
      'privacy': 'Privacy Policy',
      'login': 'Login',
      'register': 'Register'
    };
    
    return routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  }

  private setupAuth() {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });
  }

  // Search Methods
  onSearchInput() {
    this.searchSubject.next(this.searchValue);
  }

  onSearchEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.searchValue.trim()) {
      this.performSearch();
    }
  }

  performSearch() {
    if (this.searchValue.trim()) {
      this.router.navigate(['/'], { queryParams: { search: this.searchValue.trim() } });
      this.closeAllMenus();
    }
  }
  selectDish(dish: Dish) {
    this.router.navigate(['/dish', dish.id]);
    this.searchValue = '';
    this.searchResults = [];
    this.isSearchFocused = false;
    this.closeAllMenus();
  }

  viewAllResults() {
    this.performSearch();
  }

  onSearchBlur() {
    // Delay to allow click events on search results
    setTimeout(() => {
      this.isSearchFocused = false;
      this.searchResults = [];
    }, 200);
  }

  // Mobile Menu Methods
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isSearchOpen = false;
      this.isUserMenuOpen = false;
      this.lockBodyScroll();
    } else {
      this.unlockBodyScroll();
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.unlockBodyScroll();
  }

  private lockBodyScroll() {
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.setAttribute('data-scroll-lock', scrollY.toString());
  }

  private unlockBodyScroll() {
    const scrollY = document.body.getAttribute('data-scroll-lock');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.removeAttribute('data-scroll-lock');
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY) || 0);
    }
  }

  toggleMobileSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (this.isSearchOpen) {
      this.isMobileMenuOpen = false;
      this.isUserMenuOpen = false;
      this.unlockBodyScroll();
      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      }, 100);
    }
  }

  // User Menu Methods
  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    if (this.isUserMenuOpen) {
      this.isMobileMenuOpen = false;
      this.isSearchOpen = false;
    }
  }
  logout() {
    this.authService.logout();
    this.isUserMenuOpen = false;
  }

  toggleAdminNav() {
    this.isAdminNavOpen = !this.isAdminNavOpen;
  }

  private closeAllMenus() {
    this.isMobileMenuOpen = false;
    this.isSearchOpen = false;
    this.isUserMenuOpen = false;
    this.unlockBodyScroll();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.isUserMenuOpen = false;
    }
    if (!target.closest('.navbar-search')) {
      this.isSearchFocused = false;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeAllMenus();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateIsDesktop();
    if (window.innerWidth > 768) {
      this.closeAllMenus();
    }
  }

  /**
   * Format price using the PriceUtil
   * @param price The price to format
   * @returns Formatted price string
   */
  formatPrice(price: number): string {
    return PriceUtil.formatPrice(price);
  }
}
