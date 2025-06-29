import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageService, PageContent } from '../../services/page-service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AboutComponent implements OnInit {
  page: PageContent | null = null;
  loading = true;
  error: string | null = null;

  constructor(private pageService: PageService) {}

  async ngOnInit() {
    try {
      this.page = await this.pageService.getBySeoName('about-foodie');
    } catch (err: any) {
      this.error = err.message || 'Failed to load page.';
    } finally {
      this.loading = false;
    }
  }
}
