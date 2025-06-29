import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminDishListComponent } from './admin-dish-list/admin-dish-list.component';
import { AdminDishFormComponent } from './admin-dish-form/admin-dish-form.component';
import { AdminCategoryListComponent } from './admin-category-list/admin-category-list.component';
import { AdminCategoryFormComponent } from './admin-category-form/admin-category-form.component';
import { AdminOrderListComponent } from './admin-order-list/admin-order-list.component';
import { AdminOrderDetailComponent } from './admin-order-detail/admin-order-detail.component';
import { AdminCustomerListComponent } from './admin-customer-list/admin-customer-list.component';
import { AdminCustomerFormComponent } from './admin-customer-form/admin-customer-form.component';
import { AdminShippingListComponent } from './admin-shipping-list/admin-shipping-list.component';
import { AdminShippingFormComponent } from './admin-shipping-form/admin-shipping-form.component';
import { AdminPageContentListComponent } from './admin-page-content-list/admin-page-content-list.component';
import { AdminPageContentFormComponent } from './admin-page-content-form/admin-page-content-form.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AdminRoutingModule,
    AdminDashboardComponent,
    AdminDishListComponent,
    AdminDishFormComponent,
    AdminCategoryListComponent,
    AdminCategoryFormComponent,
    AdminOrderListComponent,
    AdminOrderDetailComponent,
    AdminCustomerListComponent,
    AdminCustomerFormComponent,
    AdminShippingListComponent,
    AdminShippingFormComponent,
    AdminPageContentListComponent,
    AdminPageContentFormComponent
  ],
  providers: [CurrencyPipe, DatePipe]
})
export class AdminModule {}
