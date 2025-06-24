import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule, NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { DishService } from '../../../services/dish.service';
import { Dish } from '../../../models';
import { AdminDishFormComponent } from '../admin-dish-form/admin-dish-form.component';

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
    NgFor
  ]
})
export class AdminDishListComponent implements OnInit {
  dishes: Dish[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private dishService: DishService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadDishes();
  }

  loadDishes() {
    this.loading = true;
    const query = {
      pageIndex: 0,
      pageSize: 100,
      orderBy: 'id',
      direction: 'asc',
      loadNestedData: false
    };
    this.dishService.getAll(query as any).subscribe({
      next: (dishes: Dish[]) => {
        this.dishes = dishes;
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
