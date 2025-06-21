import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, combineLatest, debounceTime, distinctUntilChanged, takeUntil, Observable } from 'rxjs';

import { DishService } from '../../services/dish.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingService } from '../../services/loading.service';
import { Dish, Category, PaginatedResponse, DishFilter, CartState } from '../../models';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Signals for reactive state management
  dishes = signal<Dish[]>([]);
  categories = signal<Category[]>([]);
  recommendedDishes = signal<Dish[]>([]);
  currentPage = signal(0);
  totalPages = signal(0);
  hasNext = signal(false);
  hasPrevious = signal(false);
  isLoading = signal(false);
  
  // Filter state
  selectedCategory = signal<number | null>(null);
  searchTerm = signal('');
  sortBy = signal<'name' | 'price'>('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

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
  // Banner carousel state
  currentBannerIndex = signal(0);
  bannerInterval: any;
  // Cart state - will be initialized in constructor
  cartState$: Observable<CartState>;

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
  private loadInitialData(): void {
    this.isLoading.set(true);
    
    combineLatest([
      this.categoryService.getAllCategories(),
      this.dishService.getRecommendedDishes(8)
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([categories, recommended]) => {
        this.categories.set(categories);
        this.recommendedDishes.set(recommended);
        this.loadDishes();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.notificationService.showError('Failed to load data. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  private loadDishes(): void {
    const filter: DishFilter = {
      categoryId: this.selectedCategory() || undefined,
      search: this.searchTerm() || undefined,
      availability: true // Only show available dishes
    };

    this.dishService.getDishes(filter, this.currentPage(), 12)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Dish>) => {
          this.dishes.set(response.items);
          this.totalPages.set(Math.ceil(response.total / response.pageSize));
          this.hasNext.set(response.hasNext || false);
          this.hasPrevious.set(response.hasPrevious || false);
        },
        error: (error) => {
          console.error('Error loading dishes:', error);
          this.notificationService.showError('Failed to load dishes. Please try again.');
        }
      });
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm.set(searchTerm);
      this.currentPage.set(0);
      this.loadDishes();
    });
  }

  private setupRouteSubscription(): void {
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['category']) {
        this.selectedCategory.set(parseInt(params['category']));
      }
      if (params['search']) {
        this.searchTerm.set(params['search']);
      }
      this.loadDishes();
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
    }, 5000); // Change slide every 5 seconds
  }

  // Event handlers
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchSubject.next(target.value);
  }

  onCategorySelect(categoryId: number | null): void {
    this.selectedCategory.set(categoryId);
    this.currentPage.set(0);
    this.updateUrlParams();
    this.loadDishes();
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const [sortBy, direction] = value.split('_');
    this.sortBy.set(sortBy as 'name' | 'price');
    this.sortDirection.set(direction as 'asc' | 'desc');
    this.loadDishes();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadDishes();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    // TODO: Navigate to dish details page
    console.log('View details for:', dish.name);
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
    return `$${price.toFixed(2)}`;
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
}
