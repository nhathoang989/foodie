import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormattedTextComponent } from '../shared/formatted-text/formatted-text.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, FormattedTextComponent],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrivacyComponent {}
