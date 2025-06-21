import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  searchValue = '';
  cartItemCount$: Observable<number>;

  constructor(private router: Router, private cartService: CartService) {
    this.cartItemCount$ = this.cartService.cartState$.pipe(
      // Map to itemCount
      // @ts-ignore
      map(state => state.itemCount)
    );
  }

  onSearchEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.searchValue.trim()) {
      this.router.navigate(['/'], { queryParams: { search: this.searchValue.trim() } });
    }
  }
}
