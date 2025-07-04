import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface PromotionImage {
  src: string;
  alt: string;
  title: string;
}

@Component({
  selector: 'app-promotion',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.scss']
})
export class PromotionComponent implements OnInit {
  images = signal<PromotionImage[]>([]);
  selectedImage = signal<PromotionImage | null>(null);
  showImagePopup = signal(false);

  ngOnInit(): void {
    this.loadPromotionImages();
  }

  private loadPromotionImages(): void {
    // List of promotion images from the assets/promotions folder
    const imageFiles = [
      '1.jpg',
      '2.jpg', 
      '3.jpg',
      '4.jpg'
    ];

    const promotionImages: PromotionImage[] = imageFiles.map((filename, index) => ({
      src: `/assets/promotions/${filename}`,
      alt: `Promotion Image ${index + 1}`,
      title: `Combo Promotion ${index + 1}`
    }));

    this.images.set(promotionImages);
  }

  openImagePopup(image: PromotionImage): void {
    this.selectedImage.set(image);
    this.showImagePopup.set(true);
  }

  closeImagePopup(): void {
    this.showImagePopup.set(false);
    this.selectedImage.set(null);
  }

  trackByImageSrc(index: number, image: PromotionImage): string {
    return image.src;
  }
}
