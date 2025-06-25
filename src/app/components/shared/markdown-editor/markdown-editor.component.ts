import { Component, Input, Output, EventEmitter, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { marked } from 'marked';

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkdownEditorComponent),
      multi: true
    }
  ],
  template: `
    <div class="markdown-editor">
      <mat-tab-group>
        <mat-tab label="Edit">
          <div class="editor-container">
            <div class="toolbar">
              <button mat-icon-button type="button" (click)="insertBold()" title="Bold">
                <mat-icon>format_bold</mat-icon>
              </button>
              <button mat-icon-button type="button" (click)="insertItalic()" title="Italic">
                <mat-icon>format_italic</mat-icon>
              </button>
              <button mat-icon-button type="button" (click)="insertHeading()" title="Heading">
                <mat-icon>title</mat-icon>
              </button>
              <button mat-icon-button type="button" (click)="insertLink()" title="Link">
                <mat-icon>link</mat-icon>
              </button>
              <button mat-icon-button type="button" (click)="insertList()" title="List">
                <mat-icon>format_list_bulleted</mat-icon>
              </button>
              <button mat-icon-button type="button" (click)="insertCode()" title="Code">
                <mat-icon>code</mat-icon>
              </button>
            </div>
            <mat-form-field appearance="fill" class="w-100">
              <mat-label>{{ label || 'Markdown Content' }}</mat-label>
              <textarea 
                matInput 
                #textArea
                [(ngModel)]="value"
                (input)="onInput($event)"
                (blur)="onTouched()"
                [placeholder]="placeholder"
                rows="10"
                class="markdown-textarea">
              </textarea>
            </mat-form-field>
          </div>
        </mat-tab>
        <mat-tab label="Preview">
          <div class="preview-container" [innerHTML]="renderedMarkdown"></div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styleUrls: ['./markdown-editor.component.scss']
})
export class MarkdownEditorComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = 'Enter markdown content...';
  
  value: string = '';
  renderedMarkdown: string = '';
  
  private onChange = (value: string) => {};
  onTouched = () => {};

  ngOnInit() {
    this.updatePreview();
  }

  writeValue(value: string): void {
    this.value = value || '';
    this.updatePreview();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInput(event: any): void {
    this.value = event.target.value;
    this.onChange(this.value);
    this.updatePreview();
  }

  private updatePreview(): void {
    try {
      this.renderedMarkdown = marked(this.value || '') as string;
    } catch (error) {
      console.error('Error rendering markdown:', error);
      this.renderedMarkdown = this.value || '';
    }
  }

  // Toolbar functions
  insertBold(): void {
    this.insertText('**', '**', 'bold text');
  }

  insertItalic(): void {
    this.insertText('*', '*', 'italic text');
  }

  insertHeading(): void {
    this.insertText('## ', '', 'Heading');
  }

  insertLink(): void {
    this.insertText('[', '](url)', 'link text');
  }

  insertList(): void {
    this.insertText('- ', '', 'list item');
  }

  insertCode(): void {
    this.insertText('`', '`', 'code');
  }

  private insertText(before: string, after: string, placeholder: string): void {
    const textarea = document.querySelector('.markdown-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = this.value.substring(start, end) || placeholder;
    
    const newText = before + selectedText + after;
    this.value = this.value.substring(0, start) + newText + this.value.substring(end);
    
    this.onChange(this.value);
    this.updatePreview();
    
    // Set cursor position
    setTimeout(() => {
      const newStart = start + before.length;
      const newEnd = newStart + selectedText.length;
      textarea.focus();
      textarea.setSelectionRange(newStart, newEnd);
    });
  }
}
