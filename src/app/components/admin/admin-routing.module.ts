import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminDishListComponent } from './admin-dish-list/admin-dish-list.component';
import { AdminCategoryListComponent } from './admin-category-list/admin-category-list.component';
import { AdminOrderListComponent } from './admin-order-list/admin-order-list.component';
import { AdminCustomerListComponent } from './admin-customer-list/admin-customer-list.component';
import { AdminShippingListComponent } from './admin-shipping-list/admin-shipping-list.component';
import { AdminPageContentListComponent } from './admin-page-content-list/admin-page-content-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'dishes', component: AdminDishListComponent, canActivate: [AuthGuard] },
  { path: 'categories', component: AdminCategoryListComponent, canActivate: [AuthGuard] },
  { path: 'orders', component: AdminOrderListComponent, canActivate: [AuthGuard] },
  { path: 'customers', component: AdminCustomerListComponent, canActivate: [AuthGuard] },
  { path: 'shipping', component: AdminShippingListComponent, canActivate: [AuthGuard] },
  { path: 'page-content', component: AdminPageContentListComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
