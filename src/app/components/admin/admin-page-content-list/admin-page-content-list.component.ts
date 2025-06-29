import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, NgIf } from '@angular/common';
import { PortalPageService } from '../../../services/portal-page-service';
import { AdminPageContentFormComponent } from '../admin-page-content-form/admin-page-content-form.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PageContent } from '../../../models';

@Component({
  selector: 'app-admin-page-content-list',
  templateUrl: './admin-page-content-list.component.html',
  styleUrls: ['./admin-page-content-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    MatPaginatorModule,
    MatSnackBarModule
  ]
})
export class AdminPageContentListComponent implements OnInit {
  pageContents: PageContent[] = [];
  loading = false;
  error: string | null = null;
  displayedColumns: string[] = ['id', 'title', 'excerpt', 'actions'];
  pagingData = { total: 0, pageSize: 15, pageIndex: 0 };

  constructor(
    private pageContentService: PortalPageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadPageContents();
  }

  loadPageContents(event?: PageEvent) {
    if (event) {
      this.pagingData.pageIndex = event.pageIndex;
      this.pagingData.pageSize = event.pageSize;
    }

    this.loading = true;
    this.error = null;
    
    const queryParams = {
      pageIndex: this.pagingData.pageIndex,
      pageSize: this.pagingData.pageSize
    };

    this.pageContentService.getList(queryParams)
      .then((response: any) => {
        if (response.items) {
          this.pageContents = response.items;
          this.pagingData.total = response.totalItems || 0;
        } else {
          this.pageContents = response;
        }
        this.loading = false;
      })
      .catch(error => {
        console.error('Error loading page contents:', error);
        this.error = 'Failed to load page contents';
        this.loading = false;
        this.snackBar.open('Error loading page contents', 'Close', { duration: 3000 });
      });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(AdminPageContentFormComponent, {
      width: '800px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPageContents();
        this.snackBar.open('Page content created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  openEditDialog(pageContent: PageContent) {
    const dialogRef = this.dialog.open(AdminPageContentFormComponent, {
      width: '800px',
      data: { mode: 'edit', pageContent: { ...pageContent } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPageContents();
        this.snackBar.open('Page content updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  async deletePageContent(pageContent: PageContent) {
    if (!pageContent.id) return;

    if (confirm(`Are you sure you want to delete "${pageContent.title}"?`)) {
      try {
        this.loading = true;
        await this.pageContentService.delete(pageContent.id);
        this.loadPageContents();
        this.snackBar.open('Page content deleted successfully', 'Close', { duration: 3000 });
      } catch (error) {
        console.error('Error deleting page content:', error);
        this.snackBar.open('Error deleting page content', 'Close', { duration: 3000 });
      } finally {
        this.loading = false;
      }
    }
  }

  onPageChange(event: PageEvent) {
    this.loadPageContents(event);
  }
}
