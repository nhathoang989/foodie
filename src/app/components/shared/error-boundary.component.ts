import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  timestamp?: Date;
}

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-boundary" *ngIf="hasError">
      <div class="error-container">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        
        <div class="error-content">
          <h2 class="error-title">{{ errorTitle }}</h2>
          <p class="error-message">{{ error?.message || defaultMessage }}</p>
          
          <div class="error-details" *ngIf="showDetails && error?.details">
            <button 
              class="details-toggle" 
              (click)="toggleDetails()"
              type="button">
              {{ detailsExpanded ? 'Hide' : 'Show' }} Details
              <i class="fas" [ngClass]="detailsExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </button>
            
            <div class="details-content" *ngIf="detailsExpanded">
              <pre>{{ error.details | json }}</pre>
            </div>
          </div>
          
          <div class="error-actions">
            <button 
              class="retry-btn primary-btn" 
              (click)="onRetry()"
              type="button">
              <i class="fas fa-redo"></i>
              Try Again
            </button>
            
            <button 
              class="home-btn secondary-btn" 
              (click)="goHome()"
              type="button">
              <i class="fas fa-home"></i>
              Go Home
            </button>
            
            <button 
              *ngIf="showReportButton"
              class="report-btn outline-btn" 
              (click)="reportError()"
              type="button">
              <i class="fas fa-bug"></i>
              Report Issue
            </button>
          </div>
          
          <div class="error-suggestions" *ngIf="suggestions.length > 0">
            <h3>What you can try:</h3>
            <ul>
              <li *ngFor="let suggestion of suggestions">{{ suggestion }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./error-boundary.component.scss']
})
export class ErrorBoundaryComponent {
  @Input() error: ErrorInfo | null = null;
  @Input() hasError: boolean = false;
  @Input() errorTitle: string = 'Something went wrong';
  @Input() defaultMessage: string = 'An unexpected error occurred. Please try again.';
  @Input() showDetails: boolean = false;
  @Input() showReportButton: boolean = true;
  @Input() suggestions: string[] = [
    'Check your internet connection',
    'Refresh the page',
    'Clear your browser cache',
    'Try again in a few minutes'
  ];
  
  @Output() retry = new EventEmitter<void>();
  @Output() report = new EventEmitter<ErrorInfo>();
  
  detailsExpanded = false;
  
  constructor(private router: Router) {}
  
  onRetry() {
    this.retry.emit();
  }
  
  goHome() {
    this.router.navigate(['/']);
  }
  
  reportError() {
    this.report.emit(this.error || { message: this.defaultMessage, timestamp: new Date() });
  }
  
  toggleDetails() {
    this.detailsExpanded = !this.detailsExpanded;
  }
}
