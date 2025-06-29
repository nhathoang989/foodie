# Admin Page Content Form Component

Modal dialog component for creating and editing page content records.

## Features

- **Dual Mode**: Supports both create and edit operations
- **Reactive Forms**: Uses Angular reactive forms with validation
- **Material Design**: Consistent with admin panel UI/UX
- **Responsive**: Mobile-friendly design
- **Validation**: Real-time form validation with user feedback

## Form Fields

### Title (Required)
- **Type**: Text input
- **Validation**: Required, max 255 characters
- **Features**: Character counter

### Excerpt (Optional)
- **Type**: Textarea
- **Validation**: Max 500 characters
- **Features**: Character counter, 3 rows height

### Content (Required)
- **Type**: Large textarea
- **Validation**: Required
- **Features**: 10 rows height, monospace font for better content editing

## Usage

The component is opened as a dialog from `AdminPageContentListComponent`:

```typescript
// Create mode
const dialogRef = this.dialog.open(AdminPageContentFormComponent, {
  width: '800px',
  data: { mode: 'create' }
});

// Edit mode
const dialogRef = this.dialog.open(AdminPageContentFormComponent, {
  width: '800px',
  data: { mode: 'edit', pageContent: existingContent }
});
```

## Dialog Data Interface

```typescript
export interface DialogData {
  mode: 'create' | 'edit';
  pageContent?: PageContent;
}
```

## Error Handling

- Form validation errors are displayed in real-time
- API errors are shown via snackbar notifications
- Loading states prevent multiple submissions

## Accessibility

- Proper ARIA labels and hints
- Keyboard navigation support
- Screen reader friendly error messages
