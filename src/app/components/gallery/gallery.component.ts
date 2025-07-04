import { Component, OnInit, signal } from '@angular/core';
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
      '6d8cf61c864f3011695e.jpg',
      '8c27f48484d732896bc6.jpg',
      '98cc77600733b16de822.jpg',
      'c5c4dc69ac3a1a64432b.jpg',
      'eb3efba08bf33dad64e2.jpg',
      'f2370c847cd7ca8993c6.jpg'
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
}
