import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartDetailsComponent } from '../cart-details/cart-details.component';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { OrderCalculationService } from '../../services/order-calculation.service';
import { NotificationService } from '../../services/notification.service';
import { LoadingService } from '../../services/loading.service';
import { ShippingService } from '../../services/shipping.service';
import { FormsModule } from '@angular/forms';
import { CartItem, ShippingOption, Order, OrderItem } from '../../models';
import { PriceUtil } from '../../utils/price.util';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CartDetailsComponent, TranslatePipe],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {
  checkoutForm: FormGroup;
  shippingOptions: ShippingOption[] = [];
  selectedShipping: ShippingOption | null = null;
  isPlacingOrder = false;
  orderError: string | null = null;
  orderSuccess: boolean = false;
  orderId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private orderCalcService: OrderCalculationService,
    private shippingService: ShippingService,
    private notification: NotificationService,
    private loading: LoadingService,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      customer: this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required]
      }),
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        zip: ['', Validators.required]
      }),
      payment: this.fb.group({
        method: ['card', Validators.required]
      })
    });
    this.shippingService.getAllShippingOptions().subscribe(result => {
      const options = Array.isArray(result) ? result : (result.items || []);
      this.shippingOptions = options;
      if (options.length > 0) {
        this.selectedShipping = options[0];
      }
    });
  }

  placeOrder() {
    if (this.checkoutForm.invalid || !this.selectedShipping) {
      this.notification.showError('Please complete all required fields.');
      return;
    }
    this.isPlacingOrder = true;
    this.loading.setLoading('placeOrder', true);
    const cartState = this.cartService.getCurrentCartState();
    const items: CartItem[] = cartState.items;
    this.orderCalcService.calculateOrderTotal(items, this.selectedShipping.id).subscribe(calc => {
      const customerData = this.checkoutForm.value.customer;
      const addressData = this.checkoutForm.value.address;
      const orderData: Partial<Order> = {
        customer_id: 0, // Guest checkout, or replace with actual customer ID if available
        total_amount: calc.total,
        shipping_fee: calc.shipping,
        status: 'pending',
        delivery_address: `${addressData.street}, ${addressData.city}, ${addressData.zip}`,
        phone_number: customerData.phone,
        special_instructions: '',
        items: items.map(i => ({
          order_id: 0,
          dish_id: i.dish_id,
          quantity: i.quantity,
          price: i.dish?.price || 0
        }))
      };
      this.orderService.createOrder(orderData).subscribe({
        next: (order) => {
          this.isPlacingOrder = false;
          this.loading.setLoading('placeOrder', false);
          this.notification.showSuccess('Order placed successfully!');
          this.cartService.clearCart().subscribe();
          this.router.navigate(['/order-confirmation', order.id]);
        },
        error: (err) => {
          this.isPlacingOrder = false;
          this.loading.setLoading('placeOrder', false);
          this.notification.showError('Order placement failed. Please try again.');
        }
      });
    });
  }

  // Price formatting utility
  formatPrice(price: number): string {
    return PriceUtil.formatPrice(price);
  }
}
