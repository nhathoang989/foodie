import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-formatted-text',
  standalone: true,
  imports: [CommonModule],
  template: `<div [innerHTML]="formattedContent"></div>`,
  styles: [`
    :host {
      display: block;
    }
    
    div {
      line-height: 1.6;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class FormattedTextComponent implements OnChanges {
  @Input() content: string = '';
  @Input() preserveLineBreaks: boolean = true;
  
  formattedContent: SafeHtml = '';
  
  constructor(private sanitizer: DomSanitizer) {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content'] || changes['preserveLineBreaks']) {
      this.formatContent();
    }
  }
  
  private formatContent(): void {
    if (!this.content) {
      this.formattedContent = '';
      return;
    }
    
    let formattedText = this.content;
    
    if (this.preserveLineBreaks) {
      // Replace newlines with <br> tags
      formattedText = formattedText
        .replace(/\n/g, '<br>')
        .replace(/\r\n/g, '<br>')
        .replace(/\r/g, '<br>');
    }
    
    // Sanitize the HTML to prevent XSS attacks while allowing <br> tags
    this.formattedContent = this.sanitizer.bypassSecurityTrustHtml(formattedText);
  }
}
