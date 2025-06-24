import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule, NgIf } from '@angular/common';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models';

@Component({
  selector: 'app-admin-category-form',
  templateUrl: './admin-category-form.component.html',
  styleUrls: ['./admin-category-form.component.scss'],
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
export class AdminCategoryFormComponent {
  @Input() category?: Category;
  @Output() saved = new EventEmitter<Category>();
  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    public dialogRef: MatDialogRef<AdminCategoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { category?: Category }
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
    if (data && data.category) {
      this.form.patchValue(data.category);
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const value = this.form.value;
    const obs = this.data.category && this.data.category.id
      ? this.categoryService.update(this.data.category.id, value)
      : this.categoryService.create(value);
    obs.subscribe({
      next: (cat: Category) => {
        this.loading = false;
        this.saved.emit(cat);
        this.dialogRef.close(cat);
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
