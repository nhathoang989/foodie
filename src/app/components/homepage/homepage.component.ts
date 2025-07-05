import { Component, OnInit, OnDestroy, signal, computed, ViewChild, ElementRef, AfterViewInit, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, combineLatest, debounceTime, distinctUntilChanged, takeUntil, Observable } from 'rxjs';
import { marked } from 'marked';

import { DishService } from '../../services/dish.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingService } from '../../services/loading.service';
import { Dish, Category, DishFilter, CartState } from '../../models';
import { environment } from '../../../environments/environment';
import { IPaginationResultModel } from '@mixcore/sdk-client';
import { PriceUtil } from '../../utils/price.util';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomepageComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Track previous category for scroll logic
  private previousCategory: number | null = null;

  // Signals for reactive state management
  dishes = signal<Dish[]>([]);
  categories = signal<Category[]>([]);
  recommendedDishes = signal<Dish[]>([]);
  currentPage = signal(0);
  hasMoreDishes = signal(true);
  isLoading = signal(false);
  isLoadingMore = signal(false);
  
  // Filter state
  selectedCategory = signal<number | null>(null);
  searchTerm = signal('');
  sortByColumn = signal<'name' | 'price'>('name');
  sortByDirection = signal<'asc' | 'desc'>('asc');

  // Computed values
  filteredDishes = computed(() => {
    let filtered = this.dishes();
    
    // Apply local filtering if needed (additional client-side filtering)
    if (this.searchTerm() && this.searchTerm().length < 3) {
      // For search terms less than 3 characters, filter client-side
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(dish => 
        dish.name.toLowerCase().includes(term) ||
        dish.description?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  });

  // Limit dishes for iPhone SE and similar small screens
  limitedDishes() {
    if (window.innerWidth <= 375) {
      return this.filteredDishes().slice(0, 6);
    }
    return this.filteredDishes();
  }

  // Banner carousel state
  currentBannerIndex = signal(0);
  bannerInterval: any;
  // Cart state - will be initialized in constructor
  cartState$: Observable<CartState>;

  @ViewChild('filterSection') filterSection!: ElementRef<HTMLElement>;
  @ViewChild('dishGridSection') dishGridSection!: ElementRef<HTMLElement>;
  private pendingScrollToResults = false;
  private readonly pageSize = 12;

  constructor(
    private dishService: DishService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.cartState$ = this.cartService.cartState$;
    this.setupSearchDebounce();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupRouteSubscription();
    this.startBannerCarousel();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.bannerInterval) {
      clearInterval(this.bannerInterval);
    }
  }

  ngAfterViewInit(): void {
    if (this.pendingScrollToResults) {
      this.scrollToResults();
      this.pendingScrollToResults = false;
    }
  }

  // Listen for scroll events to implement infinite scroll
  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    if (this.isLoadingMore() || !this.hasMoreDishes()) {
      return;
    }

    const threshold = 100; // Start loading when 100px from bottom
    const position = window.innerHeight + window.scrollY;
    const height = document.documentElement.scrollHeight;

    if (position >= height - threshold) {
      this.loadMoreDishes();
    }
  }

  private loadInitialData(): void {
    this.isLoading.set(true);
    
    combineLatest([
      this.categoryService.getAllCategories(),
      this.dishService.getRecommendedDishes(8)
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([categoriesResult, recommended]) => {
        const categories = Array.isArray(categoriesResult) ? categoriesResult : (categoriesResult.items || []);
        this.categories.set(categories);
        this.recommendedDishes.set(recommended);
        this.loadDishes(true); // Reset dishes on initial load
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.notificationService.showError('Failed to load data. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  private loadDishes(reset: boolean = false): void {
    if (reset) {
      this.currentPage.set(0);
      this.hasMoreDishes.set(true);
    }

    const filter: DishFilter = {
      categoryId: this.selectedCategory() || undefined,
      search: this.searchTerm() || undefined,
      availability: true, // Only show available dishes
      sortBy: {
        field: this.sortByColumn(),
        direction: this.sortByDirection(),
      },
    };

    this.dishService.getDishes(filter, this.currentPage(), this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: IPaginationResultModel<Dish>) => {
          const newDishes = response.items;
          
          if (reset) {
            this.dishes.set(newDishes);
          } else {
            // Append new dishes to existing ones
            const currentDishes = this.dishes();
            const updatedDishes = [...currentDishes, ...newDishes];
            this.dishes.set(updatedDishes);
          }
          // Update pagination state
          const total = response.pagingData?.total ?? 0;
          const currentPage = response.pagingData?.pageIndex ?? 0;
          const totalPages = Math.ceil(total / this.pageSize);
          this.hasMoreDishes.set(currentPage < totalPages - 1);
          // Only scroll to results if searching (not when changing category)
          if (reset && this.searchTerm() && !this.selectedCategory()) {
            this.scrollToResults();
          }
        },
        error: (error) => {
          console.error('Error loading dishes:', error);
          this.notificationService.showError('Failed to load dishes. Please try again.');
        }
      });
  }

  private loadMoreDishes(): void {
    if (this.isLoadingMore() || !this.hasMoreDishes()) {
      return;
    }

    this.isLoadingMore.set(true);
    const nextPage = this.currentPage() + 1;
    this.currentPage.set(nextPage);

    const filter: DishFilter = {
      categoryId: this.selectedCategory() || undefined,
      search: this.searchTerm() || undefined,
      availability: true
    };

    this.dishService.getDishes(filter, nextPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: IPaginationResultModel<Dish>) => {
          const newDishes = response.items;
          
          // Append new dishes to existing ones
          const currentDishes = this.dishes();
          const updatedDishes = [...currentDishes, ...newDishes];
          this.dishes.set(updatedDishes);
          
          // Update pagination state
          const total = response.pagingData?.total ?? 0;
          const currentPage = response.pagingData?.pageIndex ?? 0;
          const totalPages = Math.ceil(total / this.pageSize);
          
          this.hasMoreDishes.set(currentPage < totalPages - 1);
          this.isLoadingMore.set(false);
        },
        error: (error) => {
          console.error('Error loading more dishes:', error);
          this.notificationService.showError('Failed to load more dishes. Please try again.');
          this.isLoadingMore.set(false);
          // Revert page number on error
          this.currentPage.set(this.currentPage() - 1);
        }
      });
  }

  private scrollToResults(): void {
    if (this.filterSection && this.filterSection.nativeElement) {
      setTimeout(() => {
        this.filterSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    } else {
      this.pendingScrollToResults = true;
    }
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm.set(searchTerm);
      this.loadDishes(true); // Reset dishes when searching
      this.scrollToResults();
    });
  }

  private setupRouteSubscription(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      let categoryChanged = false;
      if (params['category']) {
        const newCategory = parseInt(params['category']);
        if (this.previousCategory !== newCategory) {
          categoryChanged = true;
        }
        this.selectedCategory.set(newCategory);
        this.previousCategory = newCategory;
      } else {
        if (this.previousCategory !== null) {
          categoryChanged = true;
        }
        this.selectedCategory.set(null);
        this.previousCategory = null;
      }
      if (params['search']) {
        this.searchTerm.set(params['search']);
      }
      this.loadDishes(true); // Reset dishes when route changes
      if (categoryChanged) {
        this.scrollToResults();
      }
    });
  }

  private startBannerCarousel(): void {
    this.bannerInterval = setInterval(() => {
      const recommended = this.recommendedDishes();
      if (recommended.length > 0) {
        this.currentBannerIndex.set(
          (this.currentBannerIndex() + 1) % recommended.length
        );
      }
    }, 500000); // Change slide every 5 seconds
  }

  // Event handlers
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onCategorySelect(categoryId: number | null): void {
    this.selectedCategory.set(categoryId);
    this.updateUrlParams();
    // Do NOT call loadDishes or scrollToResults here; let queryParams subscription handle it
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const [sortBy, direction] = value.split('_');
    this.sortByColumn.set(sortBy as 'name' | 'price');
    this.sortByDirection.set(direction as 'asc' | 'desc');
    this.loadDishes(true); // Reset dishes when sort changes
    this.scrollToResults();
  }

  loadMoreManually(): void {
    if (this.hasMoreDishes() && !this.isLoadingMore()) {
      this.loadMoreDishes();
    }
  }

  addToCart(dish: Dish, quantity: number = 1): void {
    this.cartService.addToCart(dish, quantity).subscribe({
      next: () => {
        this.notificationService.showSuccess(`${dish.name} added to cart!`);
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.notificationService.showError('Failed to add item to cart.');
      }
    });
  }

  updateCartQuantity(dish: Dish, quantity: number): void {
    if (quantity <= 0) {
      this.cartService.removeFromCart(dish.id!).subscribe();
    } else {
      this.cartService.updateQuantity(dish.id!, quantity).subscribe();
    }
  }

  getItemQuantityInCart(dishId: number): number {
    return this.cartService.getItemQuantity(dishId);
  }

  viewDishDetails(dish: Dish): void {
    this.router.navigate(['/dish', dish.id]);
  }

  orderFromBanner(dish: Dish): void {
    this.addToCart(dish, 1);
  }

  previousBannerSlide(): void {
    const recommended = this.recommendedDishes();
    if (recommended.length > 0) {
      const newIndex = this.currentBannerIndex() - 1;
      this.currentBannerIndex.set(
        newIndex < 0 ? recommended.length - 1 : newIndex
      );
    }
  }

  nextBannerSlide(): void {
    const recommended = this.recommendedDishes();
    if (recommended.length > 0) {
      this.currentBannerIndex.set(
        (this.currentBannerIndex() + 1) % recommended.length
      );
    }
  }

  getBannerSlides(): Dish[] {
    const recommended = this.recommendedDishes();
    if (recommended.length === 0) return [];
    
    // Show 3 slides at a time
    const slides = [];
    for (let i = 0; i < 3; i++) {
      const index = (this.currentBannerIndex() + i) % recommended.length;
      slides.push(recommended[index]);
    }
    return slides;
  }

  getBannerText(dish: Dish): string {
    let text = dish.excerpt?.trim() ? dish.excerpt : dish.description || '';
    if (text.length > 100) {
      text = text.slice(0, 100).trim() + '...';
    }
    return text;
  }

  getBannerHtml(dish: Dish): string {
    const text = this.getBannerText(dish);
    return marked(text || '', { async: false });
  }

  private updateUrlParams(): void {
    const queryParams: any = {};
    
    if (this.selectedCategory()) {
      queryParams.category = this.selectedCategory();
    }
    
    if (this.searchTerm()) {
      queryParams.search = this.searchTerm();
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  // Utility methods
  formatPrice(price: number): string {
    return PriceUtil.formatPrice(price);
  }

  getDefaultImage(): string {
    return 'https://via.placeholder.com/300x200/f0f0f0/666?text=No+Image';
  }

  trackByDishId(index: number, dish: Dish): number {
    return dish.id || index;
  }

  trackByCategoryId(index: number, category: Category): number {
    return category.id || index;
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToDishDetails(dish: Dish) {
    this.router.navigate(['/dish', dish.id]);
  }
}
