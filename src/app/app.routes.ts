import { Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { DishDetailsComponent } from './components/dish-details/dish-details.component';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'dish/:id', component: DishDetailsComponent },
  { path: 'cart', component: CartDetailsComponent },
  { path: '**', redirectTo: '' } // Fallback route
];
