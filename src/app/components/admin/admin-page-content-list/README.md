# Admin Page Content Management

This module provides CRUD (Create, Read, Update, Delete) operations for managing page content in the admin panel.

## Components

### AdminPageContentListComponent
- **Path**: `/admin/page-content`
- **Purpose**: Displays a paginated list of all page contents with search and management capabilities
- **Features**:
  - Paginated table view with ID, title, and excerpt columns
  - Create new page content button
  - Edit and delete actions for each page content
  - Loading states and error handling
  - Responsive design for mobile devices

### AdminPageContentFormComponent
- **Purpose**: Modal dialog for creating and editing page content
- **Features**:
  - Reactive form with validation
  - Support for both create and edit modes
  - Form fields: title (required), excerpt (optional), content (required)
  - Character limits and validation feedback
  - Responsive textarea for content editing

## Service Integration

Uses `PortalPageService` which extends `BaseRestService<PageContent>` to provide:
- `getList()` - Fetch paginated list of page contents
- `getSingle(id)` - Fetch single page content by ID
- `create(data)` - Create new page content
- `update(id, data)` - Update existing page content
- `delete(id)` - Delete page content
- `getBySeoName(seoName)` - Fetch page content by SEO name

## Data Model

```typescript
export interface PageContent {
  id?: number;
  title?: string;
  excerpt?: string;
  content?: string;
  // ...other fields as needed
}
```

## Usage

The page content management can be accessed through:
1. Admin Dashboard → Quick Actions → "Page Content" button
2. Direct navigation to `/admin/page-content`

## Navigation Integration

The component is integrated into the admin routing system and appears as a quick action button in the admin dashboard alongside other management tools like dishes, orders, customers, categories, and shipping options.

## Styling

Both components use Material Design components and follow the existing admin panel styling patterns for consistency.
