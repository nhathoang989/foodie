import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DishService } from '../../services/dish.service';
import { CartService } from '../../services/cart.service';
import { Dish, Category } from '../../models';

@Component({
  selector: 'app-dish-details',
  templateUrl: './dish-details.component.html',
  styleUrls: ['./dish-details.component.scss']
})
export class DishDetailsComponent implements OnInit {
  dish: Dish | null = null;
  relatedDishes: Dish[] = [];
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dishService: DishService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // TODO: Load dish by ID and related dishes
  }

  // TODO: Add methods for gallery, zoom, add to cart, etc.
}
