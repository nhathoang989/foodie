import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule, NgIf, CurrencyPipe } from '@angular/common';
import { ShippingService } from '../../../services/shipping.service';
import { ShippingOption } from '../../../models';
import { AdminShippingFormComponent } from '../admin-shipping-form/admin-shipping-form.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-admin-shipping-list',
  templateUrl: './admin-shipping-list.component.html',
  styleUrls: ['./admin-shipping-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    CurrencyPipe,
    NgIf,
    MatPaginatorModule
  ]
})
export class AdminShippingListComponent implements OnInit {
  shippingOptions: ShippingOption[] = [];
  loading = false;
  error: string | null = null;
  pageIndex = 0;
  pageSize = 15;
  totalCount = 0;

  constructor(
    private shippingService: ShippingService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadShippingOptions();
  }

  loadShippingOptions(event?: PageEvent) {
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
    }
    this.loading = true;
    const query = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      orderBy: 'name',
      direction: 'asc',
      loadNestedData: false
    };
    this.shippingService.getAll(query as any).subscribe({
      next: (result: any) => {
        if (Array.isArray(result)) {
          this.shippingOptions = result;
          this.totalCount = result.length < this.pageSize && this.pageIndex === 0 ? result.length : 1000;
        } else {
          this.shippingOptions = result.items || [];
          this.totalCount = result.totalCount || this.shippingOptions.length;
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.message || 'Failed to load shipping options';
        this.loading = false;
      }
    });
  }

  openForm(option?: ShippingOption) {
    const dialogRef = this.dialog.open(AdminShippingFormComponent, {
      width: '400px',
      data: { option }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadShippingOptions();
    });
  }

  deleteOption(option: ShippingOption) {
    if (!option.id) return;
    if (!confirm('Delete this shipping option?')) return;
    this.shippingService.delete(option.id).subscribe({
      next: () => this.loadShippingOptions(),
      error: (err: any) => this.error = err?.message || 'Delete failed'
    });
  }
}
