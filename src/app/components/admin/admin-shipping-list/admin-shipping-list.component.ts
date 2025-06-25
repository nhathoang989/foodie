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
import { IPaginationResultModel } from '@mixcore/sdk-client';

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
  pagingData = { total: 0, pageSize: 15, pageIndex: 0 };

  constructor(
    private shippingService: ShippingService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadShippingOptions();
  }

  loadShippingOptions(event?: PageEvent) {
    if (event) {
      this.pagingData.pageIndex = event.pageIndex;
      this.pagingData.pageSize = event.pageSize;
    }
    this.loading = true;
    this.shippingService.getAllShippingOptions(this.pagingData.pageIndex, this.pagingData.pageSize).subscribe({
      next: (result: IPaginationResultModel<ShippingOption>) => {
        this.shippingOptions = result.items || [];
        this.pagingData.total = result.pagingData?.total ?? this.shippingOptions.length;
        this.pagingData.pageIndex = result.pagingData?.pageIndex ?? 0;
        this.pagingData.pageSize = result.pagingData?.pageSize ?? 15;
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
