import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { MixcoreClient } from '@mixcore/sdk-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private mixcoreClient: MixcoreClient;

  constructor() {
    this.mixcoreClient = new MixcoreClient({
      endpoint: environment.apiBaseUrl,
      tokenKey: 'mix_access_token',
      refreshTokenKey: 'mix_refresh_token'
    });
  }

  /**
   * Upload an image file
   */
  uploadImage(file: File, folder: string = 'images', description?: string): Observable<{
    id: string;
    url: string;
    filename: string;
    size: number;
    mimetype: string;
    uploadDate: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (description) {
      formData.append('description', description);
    }

    return from(this.mixcoreClient.storage.uploadFile(formData, folder));
  }

  /**
   * Upload any file type
   */
  uploadFile(file: File, folder: string = 'files', description?: string): Observable<{
    id: string;
    url: string;
    filename: string;
    size: number;
    mimetype: string;
    uploadDate: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (description) {
      formData.append('description', description);
    }

    return from(this.mixcoreClient.storage.uploadFile(formData, folder));
  }

  /**
   * Delete a file
   */
  deleteFile(filePath: string): Observable<boolean> {
    return from(this.mixcoreClient.storage.deleteFile(filePath));
  }

  /**
   * Download a file
   */
  downloadFile(filePath: string): Observable<Blob> {
    return from(this.mixcoreClient.storage.downloadFile(filePath));
  }

  /**
   * Validate file type for images
   */
  isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  /**
   * Validate file size (default max 5MB)
   */
  isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Get formatted file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
