import { Component, Inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
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
import { firstValueFrom } from 'rxjs';
import { DishService } from '../../../services/dish.service';
import { CategoryService } from '../../../services/category.service';
import { FileUploadService } from '../../../services/file-upload.service';
import { MarkdownEditorComponent } from '../../shared/markdown-editor/markdown-editor.component';
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
    MarkdownEditorComponent,
    NgIf,
    NgFor
  ]
})
export class AdminDishFormComponent implements OnInit {
  @Input() dish?: Dish;
  @Output() saved = new EventEmitter<Dish>();
  form: FormGroup;
  categories: Category[] = [];
  loading = false;
  error: string | null = null;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  uploadingImage = false;

  constructor(
    private fb: FormBuilder,
    private dishService: DishService,
    private categoryService: CategoryService,
    private fileUploadService: FileUploadService,
    public dialogRef: MatDialogRef<AdminDishFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dish?: Dish }
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      excerpt: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      category_id: ['', Validators.required],
      image_url: [''],
      ingredients: [''],
      allergens: [''],
      nutritional_info: [''],
      availability: [true],
      preparation_time: [0, [Validators.min(0)]],
      is_recommended: [false],
      inventory: [0, [Validators.required, Validators.min(0)]]
    });
    
    // Load categories first, then patch form values
    this.loadCategories().then(() => {
      if (data && data.dish) {
        // Ensure we have the right data types for form patching
        const dishData = {
          ...data.dish,
          price: Number(data.dish.price) || 0,
          category_id: data.dish.category_id ? String(data.dish.category_id) : '',
          inventory: Number(data.dish.inventory) || 0,
          preparation_time: Number(data.dish.preparation_time) || 0,
          is_recommended: Boolean(data.dish.is_recommended),
          availability: data.dish.availability !== undefined ? Boolean(data.dish.availability) : true,
          ingredients: data.dish.ingredients || '',
          allergens: data.dish.allergens || '',
          nutritional_info: data.dish.nutritional_info || '',
          excerpt: data.dish.excerpt || ''
        };
        
        this.form.patchValue(dishData);
        
        // Set image preview if dish has existing image
        if (data.dish.image_url) {
          this.imagePreview = data.dish.image_url;
        }
      }
    });
  }

  ngOnInit() {
    // Additional initialization if needed
    console.log('AdminDishFormComponent initialized');
    console.log('Dialog data:', this.data);
  }

  // Method to manually refresh form with current data
  refreshForm() {
    if (this.data?.dish) {
      const dishData = {
        ...this.data.dish,
        price: Number(this.data.dish.price) || 0,
        category_id: this.data.dish.category_id ? String(this.data.dish.category_id) : '',
        inventory: Number(this.data.dish.inventory) || 0,
        preparation_time: Number(this.data.dish.preparation_time) || 0,
        is_recommended: Boolean(this.data.dish.is_recommended),
        availability: this.data.dish.availability !== undefined ? Boolean(this.data.dish.availability) : true,
        ingredients: this.data.dish.ingredients || '',
        allergens: this.data.dish.allergens || '',
        nutritional_info: this.data.dish.nutritional_info || '',
        excerpt: this.data.dish.excerpt || ''
      };
      
      console.log('Patching form with:', dishData);
      this.form.patchValue(dishData);
      
      if (this.data.dish.image_url) {
        this.imagePreview = this.data.dish.image_url;
      }
    }
  }

  loadCategories(): Promise<void> {
    return new Promise((resolve) => {
      const query = {
        pageIndex: 0,
        pageSize: 100,
        orderBy: 'name',
        direction: 'asc',
        loadNestedData: false
      };
      this.categoryService.getAll(query as any).subscribe({
        next: (cats: any) => {
          this.categories = Array.isArray(cats) ? cats : (cats.items || []);
          resolve();
        },
        error: (_err: any) => {
          resolve(); // Still resolve even on error to continue form initialization
        }
      });
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!this.fileUploadService.isValidImageFile(file)) {
        this.error = 'Please select a valid image file (JPEG, PNG, GIF, WebP)';
        return;
      }

      // Validate file size (max 5MB)
      if (!this.fileUploadService.isValidFileSize(file, 5)) {
        this.error = 'File size must be less than 5MB';
        return;
      }

      this.imageFile = file;
      this.error = null;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadImage(): Promise<string | null> {
    if (!this.imageFile) return null;

    try {
      this.uploadingImage = true;
      
      const description = `Dish image: ${this.form.get('name')?.value || 'Unknown'}`;
      const uploadResult = await firstValueFrom(this.fileUploadService.uploadImage(
        this.imageFile, 
        'dishes/images',
        description
      ));
      
      return uploadResult?.url || null;
    } catch (error: any) {
      console.error('Image upload failed:', error);
      this.error = `Image upload failed: ${error.message || 'Unknown error'}`;
      return null;
    } finally {
      this.uploadingImage = false;
    }
  }

  async submit() {
    if (this.form.invalid) {
      console.log('Form is invalid:', this.form.errors);
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control && control.invalid) {
          console.log(`${key} errors:`, control.errors);
        }
      });
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    try {
      let formValue = { ...this.form.value };
      
      // Ensure proper data types
      formValue.price = Number(formValue.price) || 0;
      formValue.inventory = Number(formValue.inventory) || 0;
      formValue.preparation_time = Number(formValue.preparation_time) || 0;
      formValue.is_recommended = Boolean(formValue.is_recommended);
      formValue.availability = Boolean(formValue.availability);
      
      console.log('Form value before submission:', formValue);
      console.log('Is editing dish:', !!this.data.dish?.id);

      // Upload image if a new file is selected
      if (this.imageFile) {
        const imageUrl = await this.uploadImage();
        if (imageUrl) {
          formValue.image_url = imageUrl;
          console.log('New image uploaded:', imageUrl);
        } else {
          // If image upload fails and we have an error, stop submission
          if (this.error) {
            this.loading = false;
            return;
          }
        }
      }

      // Create or update dish
      const obs = this.data.dish && this.data.dish.id
        ? this.dishService.update(this.data.dish.id, formValue)
        : this.dishService.create(formValue);
      
      obs.subscribe({
        next: (dish: Dish) => {
          console.log('Operation successful:', dish);
          this.loading = false;
          this.saved.emit(dish);
          this.dialogRef.close(dish);
        },
        error: (err: any) => {
          console.error('Operation failed:', err);
          this.loading = false;
          this.error = err?.message || 'Save failed';
        }
      });
    } catch (error: any) {
      console.error('Unexpected error:', error);
      this.loading = false;
      this.error = error?.message || 'An unexpected error occurred';
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
