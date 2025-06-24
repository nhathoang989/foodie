import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { DishService } from '../../../services/dish.service';
import { CategoryService } from '../../../services/category.service';
import { Dish, Category } from '../../../models';

@Component({
  selector: 'app-admin-dish-form',
  templateUrl: './admin-dish-form.component.html',
  styleUrls: ['./admin-dish-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressBarModule,
    NgIf,
    NgFor
  ]
})
export class AdminDishFormComponent {
  @Input() dish?: Dish;
  @Output() saved = new EventEmitter<Dish>();
  form: FormGroup;
  categories: Category[] = [];
  loading = false;
  error: string | null = null;
  imageFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private dishService: DishService,
    private categoryService: CategoryService,
    public dialogRef: MatDialogRef<AdminDishFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dish?: Dish }
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      category_id: ['', Validators.required],
      image_url: [''],
      is_recommended: [false],
      inventory: [0, [Validators.required, Validators.min(0)]]
    });
    if (data && data.dish) {
      this.form.patchValue(data.dish);
    }
    this.loadCategories();
  }

  loadCategories() {
    const query = {
      pageIndex: 0,
      pageSize: 100,
      orderBy: 'name',
      direction: 'asc',
      loadNestedData: false
    };
    this.categoryService.getAll(query as any).subscribe({
      next: (cats: Category[]) => this.categories = cats,
      error: (_err: any) => {}
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) this.imageFile = file;
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const value = this.form.value;
    const obs = this.data.dish && this.data.dish.id
      ? this.dishService.update(this.data.dish.id, value)
      : this.dishService.create(value);
    obs.subscribe({
      next: (dish: Dish) => {
        this.loading = false;
        this.saved.emit(dish);
        this.dialogRef.close(dish);
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
