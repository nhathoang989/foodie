import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DishService } from '../../services/dish.service';
import { CartService } from '../../services/cart.service';
import { Dish, Category } from '../../models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dish-details',
  templateUrl: './dish-details.component.html',
  styleUrls: ['./dish-details.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DishDetailsComponent implements OnInit {
  dish = signal<Dish | null>(null);
  relatedDishes = signal<Dish[]>([]);
  quantity = signal(1);
  galleryIndex = signal(0);
  relatedCarouselIndex = signal(0);
  relatedCarouselSize = 3;
  showImagePopup = false;
  popupImageUrl = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private dishService: DishService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.dishService.getById(id).subscribe(dish => {
          this.dish.set(dish);
          if (dish?.category_id) {
            this.dishService.getDishesByCategory(dish.category_id, 0, 8).subscribe(res => {
              // Exclude current dish from related
              this.relatedDishes.set(res.items.filter(d => d.id !== dish.id));
            });
          }
        });
      }
    });
  }

  selectGalleryImage(idx: number) {
    this.galleryIndex.set(idx);
  }

  zoomImage(url: string) {
    this.popupImageUrl = url;
    this.showImagePopup = true;
  }

  closeImagePopup() {
    this.showImagePopup = false;
    this.popupImageUrl = '';
  }

  addToCart() {
    const dish = this.dish();
    if (dish) {
      this.cartService.addToCart(dish, this.quantity()).subscribe();
    }
  }

  increaseQty() {
    this.quantity.set(this.quantity() + 1);
  }

  decreaseQty() {
    if (this.quantity() > 1) this.quantity.set(this.quantity() - 1);
  }

  get visibleRelatedDishes() {
    const all = this.relatedDishes();
    const start = this.relatedCarouselIndex();
    return all.slice(start, start + this.relatedCarouselSize);
  }

  nextRelated() {
    const all = this.relatedDishes();
    if (all.length <= this.relatedCarouselSize) return;
    const maxStart = all.length - this.relatedCarouselSize;
    this.relatedCarouselIndex.set(
      Math.min(this.relatedCarouselIndex() + 1, maxStart)
    );
  }

  prevRelated() {
    if (this.relatedCarouselIndex() > 0) {
      this.relatedCarouselIndex.set(this.relatedCarouselIndex() - 1);
    }
  }
}
