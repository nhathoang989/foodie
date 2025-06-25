import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule, NgIf } from '@angular/common';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models';
import { AdminCustomerFormComponent } from '../admin-customer-form/admin-customer-form.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { IPaginationResultModel } from '@mixcore/sdk-client';

@Component({
  selector: 'app-admin-customer-list',
  templateUrl: './admin-customer-list.component.html',
  styleUrls: ['./admin-customer-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    NgIf,
    MatPaginatorModule
  ]
})
export class AdminCustomerListComponent implements OnInit {
  customers: Customer[] = [];
  loading = false;
  error: string | null = null;
  pagingData = { total: 0, pageSize: 15, pageIndex: 0 };

  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers(event?: PageEvent) {
    if (event) {
      this.pagingData.pageIndex = event.pageIndex;
      this.pagingData.pageSize = event.pageSize;
    }
    this.loading = true;
    this.customerService.getAllCustomers(this.pagingData.pageIndex, this.pagingData.pageSize).subscribe({
      next: (result: IPaginationResultModel<Customer>) => {
        this.customers = result.items || [];
        this.pagingData.total = result.pagingData?.total ?? this.customers.length;
        this.pagingData.pageIndex = result.pagingData?.pageIndex ?? 0;
        this.pagingData.pageSize = result.pagingData?.pageSize ?? 15;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.message || 'Failed to load customers';
        this.loading = false;
      }
    });
  }

  openForm(customer?: Customer) {
    const dialogRef = this.dialog.open(AdminCustomerFormComponent, {
      width: '400px',
      data: { customer }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadCustomers();
    });
  }

  deleteCustomer(customer: Customer) {
    if (!customer.id) return;
    if (!confirm('Delete this customer?')) return;
    this.customerService.delete(customer.id).subscribe({
      next: () => this.loadCustomers(),
      error: (err: any) => this.error = err?.message || 'Delete failed'
    });
  }
}
