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
    MatSnackBarModule
  ]
})
export class AdminPageContentFormComponent implements OnInit {
  pageContentForm: FormGroup;
  loading = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private pageContentService: PortalPageService,
    private dialogRef: MatDialogRef<AdminPageContentFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.pageContentForm = this.createForm();
  }

  ngOnInit() {
    if (this.isEditMode && this.data.pageContent) {
      this.pageContentForm.patchValue(this.data.pageContent);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      excerpt: ['', [Validators.maxLength(500)]],
      content: ['', [Validators.required]]
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
      let result: PageContent;

      if (this.isEditMode && this.data.pageContent?.id) {
        result = await this.pageContentService.update(this.data.pageContent.id, formValue);
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

  get titleControl() { return this.pageContentForm.get('title'); }
  get excerptControl() { return this.pageContentForm.get('excerpt'); }
  get contentControl() { return this.pageContentForm.get('content'); }
}
