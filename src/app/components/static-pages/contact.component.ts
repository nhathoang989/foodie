import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { Contact } from '../../models';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContactComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  submitMessage = '';
  hasError = false;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitMessage = '';
      this.hasError = false;
      
      const contactData: Omit<Contact, 'id' | 'created_date_time'> = {
        name: this.contactForm.get('name')?.value,
        email: this.contactForm.get('email')?.value,
        phone: this.contactForm.get('phone')?.value,
        subject: this.contactForm.get('subject')?.value,
        message: this.contactForm.get('message')?.value
      };

      this.contactService.submitContact(contactData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.submitMessage = 'Thank you for your message! We\'ll get back to you soon.';
          this.contactForm.reset();
          this.hasError = false;
        },
        error: (error) => {
          this.isSubmitting = false;
          this.submitMessage = 'Sorry, there was an error sending your message. Please try again.';
          this.hasError = true;
          console.error('Contact form submission error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
      }
    }
    return '';
  }
}
