import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton" 
         [ngClass]="'skeleton-' + type" 
         [style.width]="width" 
         [style.height]="height"
         [style.border-radius]="borderRadius">
    </div>
  `,
  styleUrls: ['./skeleton.component.scss']
})
export class SkeletonComponent {
  @Input() type: 'text' | 'circle' | 'rect' | 'card' | 'button' = 'text';
  @Input() width: string = '100%';
  @Input() height: string = '1rem';
  @Input() borderRadius: string = '4px';
}
