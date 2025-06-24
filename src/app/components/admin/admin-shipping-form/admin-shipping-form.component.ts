import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule, NgIf } from '@angular/common';
import { ShippingService } from '../../../services/shipping.service';
import { ShippingOption } from '../../../models';

@Component({
  selector: 'app-admin-shipping-form',
  templateUrl: './admin-shipping-form.component.html',
  styleUrls: ['./admin-shipping-form.component.scss'],
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
export class AdminShippingFormComponent {
  @Input() option?: ShippingOption;
  @Output() saved = new EventEmitter<ShippingOption>();
  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private shippingService: ShippingService,
    public dialogRef: MatDialogRef<AdminShippingFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { option?: ShippingOption }
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      fee: [0, [Validators.required, Validators.min(0)]]
    });
    if (data && data.option) {
      this.form.patchValue(data.option);
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const value = this.form.value;
    const obs = this.data.option && this.data.option.id
      ? this.shippingService.update(this.data.option.id, value)
      : this.shippingService.create(value);
    obs.subscribe({
      next: (option: ShippingOption) => {
        this.loading = false;
        this.saved.emit(option);
        this.dialogRef.close(option);
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
