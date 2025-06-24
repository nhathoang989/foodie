import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule, NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { ShippingService } from '../../../services/shipping.service';
import { ShippingOption } from '../../../models';
import { AdminShippingFormComponent } from '../admin-shipping-form/admin-shipping-form.component';

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
    NgFor
  ]
})
export class AdminShippingListComponent implements OnInit {
  shippingOptions: ShippingOption[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private shippingService: ShippingService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadShippingOptions();
  }

  loadShippingOptions() {
    this.loading = true;
    const query = {
      pageIndex: 0,
      pageSize: 50,
      orderBy: 'name',
      direction: 'asc',
      loadNestedData: false
    };
    this.shippingService.getAll(query as any).subscribe({
      next: (options: ShippingOption[]) => {
        this.shippingOptions = options;
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
