import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { ShippingService } from '../../services/shipping.service';
import { CartItem, ShippingOption } from '../../models';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrls: ['./cart-details.component.scss']
})
export class CartDetailsComponent implements OnInit {
  cartItems: CartItem[] = [];
  shippingOptions: ShippingOption[] = [];
  selectedShipping: ShippingOption | null = null;
  promoCode = '';

  constructor(
    private cartService: CartService,
    private shippingService: ShippingService
  ) {}

  ngOnInit(): void {
    // TODO: Load cart items and shipping options
  }

  // TODO: Add methods for quantity, remove, summary, etc.
}
