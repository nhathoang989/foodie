import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface ImageDialogData {
  imageUrl: string;
  title: string;
  altText?: string;
}

@Component({
  selector: 'app-image-popup',
  template: `
    <div class="image-popup-container">
      <div class="image-popup-header" mat-dialog-title>
        <h3>{{ data.title }}</h3>
        <button mat-icon-button (click)="close()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <div class="image-popup-content" mat-dialog-content>
        <img 
          [src]="data.imageUrl" 
          [alt]="data.altText || data.title"
          class="popup-image"
          (error)="onImageError($event)"
        />
        <div *ngIf="imageError" class="image-error">
          <mat-icon>broken_image</mat-icon>
          <p>Failed to load image</p>
        </div>
      </div>

      <div class="image-popup-actions" mat-dialog-actions>
        <button mat-button (click)="downloadImage()">
          <mat-icon>download</mat-icon>
          Download
        </button>
        <button mat-flat-button color="primary" (click)="close()">Close</button>
      </div>
    </div>
  `,
  styles: [`
    .image-popup-container {
      max-width: 90vw;
      max-height: 90vh;
      overflow: hidden;
    }

    .image-popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      h3 {
        margin: 0;
        flex: 1;
      }
      
      .close-button {
        margin-left: 16px;
      }
    }

    .image-popup-content {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      margin-bottom: 16px;
      
      .popup-image {
        max-width: 100%;
        max-height: 70vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      .image-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: #666;
        
        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          margin-bottom: 8px;
        }
      }
    }

    .image-popup-actions {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }

    @media (max-width: 768px) {
      .image-popup-container {
        max-width: 95vw;
        max-height: 95vh;
      }
      
      .image-popup-content .popup-image {
        max-height: 60vh;
      }
      
      .image-popup-actions {
        flex-direction: column;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class ImagePopupComponent {
  imageError = false;

  constructor(
    public dialogRef: MatDialogRef<ImagePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageDialogData
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  onImageError(event: any): void {
    this.imageError = true;
    event.target.style.display = 'none';
  }

  downloadImage(): void {
    try {
      const link = document.createElement('a');
      link.href = this.data.imageUrl;
      link.download = `${this.data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }
}
