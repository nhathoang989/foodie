import { Component, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ImagePopupComponent } from '../shared/image-popup/image-popup.component';
import { TranslatePipe } from '../../i18n/translate.pipe';

interface GalleryImage {
  src: string;
  alt: string;
  title: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  images = signal<GalleryImage[]>([]);
  selectedImage = signal<GalleryImage | null>(null);
  showImagePopup = signal(false);

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadGalleryImages();
  }

  private loadGalleryImages(): void {
    // List of gallery images from the assets/gallery folder
    const imageFiles = [
      '1.jpg',
      '2.jpg',
      '3.jpg',
      '4.jpg',
      '5.jpg',
      '6.jpg',
      '7.jpg',
      '8.jpg',
      '9.jpg',
      '10.jpg',
      '11.jpg',
      '12.jpg',
    ];

    const galleryImages: GalleryImage[] = imageFiles.map((filename, index) => ({
      src: `/assets/gallery/${filename}`,
      alt: `Gallery Image ${index + 1}`,
      title: `Gallery Image ${index + 1}`
    }));

    this.images.set(galleryImages);
  }

  openImagePopup(image: GalleryImage): void {
    this.selectedImage.set(image);
    this.showImagePopup.set(true);
  }

  closeImagePopup(): void {
    this.showImagePopup.set(false);
    this.selectedImage.set(null);
  }

  navigateToImage(direction: 'next' | 'prev'): void {
    const currentImages = this.images();
    const currentImage = this.selectedImage();
    
    if (!currentImage || currentImages.length <= 1) return;
    
    const currentIndex = currentImages.findIndex(img => img.src === currentImage.src);
    if (currentIndex === -1) return;
    
    let newIndex: number;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % currentImages.length;
    } else {
      newIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    }
    
    this.selectedImage.set(currentImages[newIndex]);
  }

  openImageDialog(image: GalleryImage): void {
    this.dialog.open(ImagePopupComponent, {
      data: { imageUrl: image.src, altText: image.alt },
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'image-popup-dialog'
    });
  }

  trackByImageSrc(index: number, image: GalleryImage): string {
    return image.src;
  }
  
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Only handle keyboard events when the popup is open
    if (!this.showImagePopup()) return;
    
    switch(event.key) {
      case 'ArrowLeft':
        this.navigateToImage('prev');
        break;
      case 'ArrowRight':
        this.navigateToImage('next');
        break;
      case 'Escape':
        this.closeImagePopup();
        break;
    }
  }
}
