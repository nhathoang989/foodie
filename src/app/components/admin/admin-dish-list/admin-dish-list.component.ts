import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule, NgIf, CurrencyPipe } from '@angular/common';
import { DishService } from '../../../services/dish.service';
import { Dish } from '../../../models';
import { AdminDishFormComponent } from '../admin-dish-form/admin-dish-form.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { IPaginationResultModel } from '@mixcore/sdk-client';

@Component({
  selector: 'app-admin-dish-list',
  templateUrl: './admin-dish-list.component.html',
  styleUrls: ['./admin-dish-list.component.scss'],
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
    MatPaginatorModule
  ]
})
export class AdminDishListComponent implements OnInit {
  dishes: Dish[] = [];
  loading = false;
  error: string | null = null;
  pagingData = { total: 0, pageSize: 15, pageIndex: 0 };

  constructor(
    private dishService: DishService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadDishes();
  }

  loadDishes(event?: PageEvent) {
    if (event) {
      this.pagingData.pageIndex = event.pageIndex;
      this.pagingData.pageSize = event.pageSize;
    }
    this.loading = true;
    this.dishService.getDishes({}, this.pagingData.pageIndex, this.pagingData.pageSize).subscribe({
      next: (result: IPaginationResultModel<Dish>) => {
        this.dishes = result.items || [];
        this.pagingData.total = result.pagingData?.total ?? this.dishes.length;
        this.pagingData.pageIndex = result.pagingData?.pageIndex ?? 0;
        this.pagingData.pageSize = result.pagingData?.pageSize ?? 15;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.message || 'Failed to load dishes';
        this.loading = false;
      }
    });
  }

  openForm(dish?: Dish) {
    const dialogRef = this.dialog.open(AdminDishFormComponent, {
      width: '500px',
      data: { dish }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadDishes();
    });
  }

  deleteDish(dish: Dish) {
    if (!dish.id) return;
    if (!confirm('Delete this dish?')) return;
    this.dishService.delete(dish.id).subscribe({
      next: () => this.loadDishes(),
      error: (err: any) => this.error = err?.message || 'Delete failed'
    });
  }
}
