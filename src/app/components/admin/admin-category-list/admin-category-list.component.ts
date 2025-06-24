import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule, MatError } from '@angular/material/form-field';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models';
import { AdminCategoryFormComponent } from '../admin-category-form/admin-category-form.component';

@Component({
  selector: 'app-admin-category-list',
  templateUrl: './admin-category-list.component.html',
  styleUrls: ['./admin-category-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    NgIf,
    NgFor
  ]
})
export class AdminCategoryListComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    const query = {
      pageIndex: 0,
      pageSize: 100,
      orderBy: 'name',
      direction: 'asc',
      loadNestedData: false
    };
    this.categoryService.getAll(query as any).subscribe({
      next: (cats: Category[]) => {
        this.categories = cats;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.message || 'Failed to load categories';
        this.loading = false;
      }
    });
  }

  openForm(category?: Category) {
    const dialogRef = this.dialog.open(AdminCategoryFormComponent, {
      width: '400px',
      data: { category }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadCategories();
    });
  }

  deleteCategory(category: Category) {
    if (!category.id) return;
    if (!confirm('Delete this category?')) return;
    this.categoryService.delete(category.id).subscribe({
      next: () => this.loadCategories(),
      error: (err: any) => this.error = err?.message || 'Delete failed'
    });
  }
}
