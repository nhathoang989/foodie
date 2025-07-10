import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PageService } from '../../services/page-service';
import { PageContent } from '../../models';
import { FormattedTextComponent } from '../shared/formatted-text/formatted-text.component';
import { GalleryComponent } from '../gallery/gallery.component';
import { PromotionComponent } from '../promotion/promotion.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormattedTextComponent, GalleryComponent, PromotionComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AboutComponent implements OnInit {
  page: PageContent | null = null;
  loading = true;
  error: string | null = null;
  
  // Image popup properties
  showImagePopup = false;
  selectedImageSrc = '';
  selectedImageAlt = '';

  constructor(private pageService: PageService) {}

  async ngOnInit() {
    try {
      this.page = await this.pageService.getBySeoName('about-foodie');
    } catch (err: any) {
      this.error = err.message || 'Failed to load page.';
    } finally {
      this.loading = false;
    }
  }
  
  openImagePopup(src: string, alt: string): void {
    this.selectedImageSrc = src;
    this.selectedImageAlt = alt;
    this.showImagePopup = true;
  }
  
  closeImagePopup(): void {
    this.showImagePopup = false;
    this.selectedImageSrc = '';
    this.selectedImageAlt = '';
  }
}
