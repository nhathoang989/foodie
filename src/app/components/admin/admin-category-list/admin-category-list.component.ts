import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule, MatError } from '@angular/material/form-field';
import { CommonModule, NgIf } from '@angular/common';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models';
import { AdminCategoryFormComponent } from '../admin-category-form/admin-category-form.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

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
    MatPaginatorModule
  ]
})
export class AdminCategoryListComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  error: string | null = null;
  pageIndex = 0;
  pageSize = 15;
  totalCount = 0;

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories(event?: PageEvent) {
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
    this.categoryService.getAll(query as any).subscribe({
      next: (result: any) => {
        if (Array.isArray(result)) {
          this.categories = result;
          this.totalCount = result.length < this.pageSize && this.pageIndex === 0 ? result.length : 1000;
        } else {
          this.categories = result.items || [];
          this.totalCount = result.totalCount || this.categories.length;
        }
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
