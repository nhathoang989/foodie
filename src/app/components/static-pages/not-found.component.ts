import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotFoundComponent {

  constructor(
    private router: Router,
    private location: Location
  ) {}

  search(term: string) {
    if (term.trim()) {
      this.router.navigate(['/'], { queryParams: { search: term.trim() } });
    }
  }

  searchCategory(category: string) {
    this.router.navigate(['/'], { queryParams: { category } });
  }

  goBack() {
    this.location.back();
  }
}
