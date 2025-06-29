import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { PortalPageService } from '../../../services/portal-page-service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageContent } from '../../../models';
import { QuillModule } from 'ngx-quill';
import { FileUploadService } from '../../../services/file-upload.service';
import { QuillConfigService } from '../../../services/quill-config.service';
import { firstValueFrom } from 'rxjs';

export interface DialogData {
  mode: 'create' | 'edit';
  pageContent?: PageContent;
}

@Component({
  selector: 'app-admin-page-content-form',
  templateUrl: './admin-page-content-form.component.html',
  styleUrls: ['./admin-page-content-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSnackBarModule,
    QuillModule
  ]
})
export class AdminPageContentFormComponent implements OnInit {
  pageContentForm: FormGroup;
  loading = false;
  isEditMode = false;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  uploadingImage = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private pageContentService: PortalPageService,
    private dialogRef: MatDialogRef<AdminPageContentFormComponent>,
    private snackBar: MatSnackBar,
    private fileUploadService: FileUploadService,
    private quillConfigService: QuillConfigService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.pageContentForm = this.createForm();
  }

  ngOnInit() {
    if (this.isEditMode && this.data.pageContent) {
      // Use timeout to ensure Quill editor is ready before setting the value
      setTimeout(() => {
        this.pageContentForm.patchValue({
          title: this.data.pageContent?.title || '',
          excerpt: this.data.pageContent?.excerpt || '',
          content: this.data.pageContent?.content || '',
          image: this.data.pageContent?.image || ''
        });
        
        // Set image preview if page content has existing image
        if (this.data.pageContent?.image) {
          this.imagePreview = this.data.pageContent.image;
        }
        
        // Mark the form as pristine after patching to avoid unsaved changes warnings
        this.pageContentForm.markAsPristine();
      }, 100);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      excerpt: ['', [Validators.maxLength(500)]],
      content: ['', [Validators.required]],
      image: ['']
    });
  }

  async onSubmit() {
    if (this.pageContentForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const formValue = this.pageContentForm.value;

    try {
      // Upload image if a new file is selected
      if (this.imageFile) {
        this.uploadingImage = true;
        try {
          const description = `Page content image: ${formValue.title || 'Untitled'}`;
          const uploadResult = await firstValueFrom(this.fileUploadService.uploadImage(
            this.imageFile,
            'pages/images',
            description
          ));
          
          if (uploadResult?.url) {
            formValue.image = uploadResult.url;
          }
        } catch (error) {
          console.error('Image upload failed:', error);
          this.snackBar.open('Image upload failed', 'Close', { duration: 3000 });
          // Continue with form submission even if image upload fails
        } finally {
          this.uploadingImage = false;
        }
      }

      let result: PageContent;
      
      if (this.isEditMode && this.data.pageContent?.id) {
        // Map form values to the existing page content object to preserve other fields
        const updatedPageContent = {
          ...this.data.pageContent,
          title: formValue.title,
          excerpt: formValue.excerpt,
          content: formValue.content,
          image: formValue.image || this.data.pageContent.image
        };
        
        result = await this.pageContentService.update(this.data.pageContent.id, updatedPageContent);
      } else {
        result = await this.pageContentService.create(formValue);
      }

      this.dialogRef.close(result);
    } catch (error) {
      console.error('Error saving page content:', error);
      this.snackBar.open(
        `Error ${this.isEditMode ? 'updating' : 'creating'} page content`,
        'Close',
        { duration: 3000 }
      );
    } finally {
      this.loading = false;
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  private markFormGroupTouched() {
    Object.keys(this.pageContentForm.controls).forEach(key => {
      const control = this.pageContentForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.pageContentForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `${this.getFieldDisplayName(fieldName)} cannot exceed ${maxLength} characters`;
    }
    
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      title: 'Title',
      excerpt: 'Excerpt',
      content: 'Content'
    };
    return fieldNames[fieldName] || fieldName;
  }

  onEditorCreated(editor: any) {
    // Apply space preservation configuration
    this.quillConfigService.applySpacePreservation(editor);
    
    // When the editor is ready, ensure content is loaded
    if (this.isEditMode && this.data.pageContent?.content) {
      // Set content directly in the editor if form value isn't applied correctly
      setTimeout(() => {
        const currentContent = this.contentControl?.value;
        if (!currentContent && editor) {
          this.contentControl?.setValue(this.data.pageContent?.content || '');
          editor.clipboard.dangerouslyPasteHTML(this.data.pageContent?.content || '');
        }
      }, 200);
    }
  }

  get titleControl() { return this.pageContentForm.get('title'); }
  get excerptControl() { return this.pageContentForm.get('excerpt'); }
  get contentControl() { return this.pageContentForm.get('content'); }
  get imageControl() { return this.pageContentForm.get('image'); }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!this.fileUploadService.isValidImageFile(file)) {
        this.error = 'Please select a valid image file (JPEG, PNG, GIF, WebP)';
        this.snackBar.open(this.error, 'Close', { duration: 3000 });
        return;
      }

      // Validate file size (max 5MB)
      if (!this.fileUploadService.isValidFileSize(file, 5)) {
        this.error = 'File size must be less than 5MB';
        this.snackBar.open(this.error, 'Close', { duration: 3000 });
        return;
      }

      this.imageFile = file;
      this.error = null;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
