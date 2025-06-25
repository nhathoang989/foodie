import { Component, OnInit, signal, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ShippingService } from '../../services/shipping.service';
import { CartItem, ShippingOption, CartState } from '../../models';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CartDetailsComponent implements OnInit {  @Input() showSummaryOnly = false;
  cartState = signal<CartState>({ items: [], total: 0, itemCount: 0, isLoading: false });
  shippingOptions = signal<ShippingOption[]>([]);
  selectedShipping = signal<ShippingOption | null>(null);
  promoCode: string = '';
  taxRate = 0.08; // 8% tax for example

  constructor(
    private cartService: CartService,
    private shippingService: ShippingService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.cartService.cartState$.subscribe(state => this.cartState.set(state));
    this.shippingService.getAllShippingOptions().subscribe(result => {
      const options = Array.isArray(result) ? result : (result.items || []);
      this.shippingOptions.set(options);
      if (options.length > 0 && !this.selectedShipping()) {
        this.selectedShipping.set(options[0]);
      }
    });
  }

  onShippingChange(option: ShippingOption) {
    this.selectedShipping.set(option);
  }

  updateQuantity(item: CartItem, qty: number) {
    if (qty > 0) {
      this.cartService.updateQuantity(item.dish_id, qty).subscribe();
    }
  }

  removeItem(item: CartItem) {
    this.cartService.removeFromCart(item.dish_id).subscribe();
  }

  clearCart() {
    this.cartService.clearCart().subscribe();
  }

  proceedToCheckout() {
    this.router.navigate(['/checkout']);
  }
  subtotal = computed(() => this.cartState().items.reduce((sum, item) => sum + (item.dish?.price || 0) * item.quantity, 0));
  tax = computed(() => this.subtotal() * this.taxRate);
  shipping = computed(() => this.selectedShipping() ? this.selectedShipping()!.fee || 0 : 0);
  total = computed(() => this.subtotal() + this.tax() + this.shipping());
}
