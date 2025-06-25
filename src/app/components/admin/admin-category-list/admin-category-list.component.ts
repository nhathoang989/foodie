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
import { IPaginationResultModel } from '@mixcore/sdk-client';

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
  pagingData = { total: 0, pageSize: 15, pageIndex: 0 };

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories(event?: PageEvent) {
    if (event) {
      this.pagingData.pageIndex = event.pageIndex;
      this.pagingData.pageSize = event.pageSize;
    }
    this.loading = true;
    this.categoryService.getAllCategories(this.pagingData.pageIndex, this.pagingData.pageSize).subscribe({
      next: (result: IPaginationResultModel<Category>) => {
        this.categories = result.items || [];
        this.pagingData.total = result.pagingData?.total ?? this.categories.length;
        this.pagingData.pageIndex = result.pagingData?.pageIndex ?? 0;
        this.pagingData.pageSize = result.pagingData?.pageSize ?? 15;
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
