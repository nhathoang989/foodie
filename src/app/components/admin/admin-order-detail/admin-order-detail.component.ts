import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Order } from '../../../models';

@Component({
  selector: 'app-admin-order-detail',
  templateUrl: './admin-order-detail.component.html',
  styleUrls: ['./admin-order-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    CurrencyPipe,
    DatePipe
  ]
})
export class AdminOrderDetailComponent {
  constructor(
    public dialogRef: MatDialogRef<AdminOrderDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { order: Order }
  ) {}

  close() {
    this.dialogRef.close();
  }
}
