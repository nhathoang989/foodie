import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule, NgIf } from '@angular/common';
import { CustomerService } from '../../../services/customer.service';
import { Customer } from '../../../models';

@Component({
  selector: 'app-admin-customer-form',
  templateUrl: './admin-customer-form.component.html',
  styleUrls: ['./admin-customer-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    NgIf
  ]
})
export class AdminCustomerFormComponent {
  @Input() customer?: Customer;
  @Output() saved = new EventEmitter<Customer>();
  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    public dialogRef: MatDialogRef<AdminCustomerFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { customer?: Customer }
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
    if (data && data.customer) {
      this.form.patchValue(data.customer);
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const value = this.form.value;
    const obs = this.data.customer && this.data.customer.id
      ? this.customerService.update(this.data.customer.id, value)
      : this.customerService.create(value);
    obs.subscribe({
      next: (customer: Customer) => {
        this.loading = false;
        this.saved.emit(customer);
        this.dialogRef.close(customer);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.message || 'Save failed';
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
