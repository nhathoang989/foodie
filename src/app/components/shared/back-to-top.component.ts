import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="back-to-top-btn"
      [class.visible]="isVisible"
      (click)="scrollToTop()"
      [attr.aria-label]="'Back to top'"
      title="Back to top"
    >
      <span class="btn-icon">↑</span>
    </button>
  `,
  styleUrls: ['./back-to-top.component.scss']
})
export class BackToTopComponent implements OnInit {
  isVisible = false;

  ngOnInit() {
    this.checkScrollPosition();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScrollPosition();
  }

  private checkScrollPosition() {
    this.isVisible = window.pageYOffset > 300;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
