import { Routes } from '@angular/router';
import { HomepageComponent } from './components/homepage/homepage.component';
import { DishDetailsComponent } from './components/dish-details/dish-details.component';
import { CartDetailsComponent } from './components/cart-details/cart-details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrdersComponent } from './components/orders/orders.component';
import { OrderConfirmationComponent } from './components/order-confirmation/order-confirmation.component';
import { AboutComponent } from './components/static-pages/about.component';
import { ContactComponent } from './components/static-pages/contact.component';
import { TermsComponent } from './components/static-pages/terms.component';
import { PrivacyComponent } from './components/static-pages/privacy.component';
import { NotFoundComponent } from './components/static-pages/not-found.component';
import { LoginComponent } from './components/auth/login.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'dish/:id', component: DishDetailsComponent },
  { path: 'cart', component: CartDetailsComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard] },
  { path: 'order-confirmation/:id', component: OrderConfirmationComponent, canActivate: [AuthGuard] },
  { path: 'admin', loadChildren: () => import('./components/admin/admin-routing.module').then(m => m.AdminRoutingModule), canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: '**', component: NotFoundComponent } // 404 page
];
