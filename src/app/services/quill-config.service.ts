import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QuillConfigService {
  constructor() { }

  // Apply custom Quill configuration to prevent &nbsp; transformation
  applySpacePreservation(editor: any): void {
    if (editor && editor.quillEditor) {
      // Access the underlying Quill instance
      const quill = editor.quillEditor;
      
      // Store original space handling methods
      const originalGetHTML = quill.root.innerHTML;
      
      // Override the clipboard matchers to prevent &nbsp; conversion
      if (quill.clipboard) {
        // Clear existing matchers that might convert spaces
        quill.clipboard.matchers = [];
        
        // Add a universal matcher that preserves spaces
        quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node: Element, delta: any) => {
          // Convert any &nbsp; back to regular spaces
          if (node.innerHTML) {
            node.innerHTML = node.innerHTML.replace(/&nbsp;/g, ' ');
          }
          return delta;
        });
        
        // Add text node matcher to preserve spaces
        quill.clipboard.addMatcher(Node.TEXT_NODE, (node: Text, delta: any) => {
          if (node.textContent) {
            // Replace any non-breaking spaces with regular spaces
            const text = node.textContent.replace(/\u00A0/g, ' ');
            const Delta = quill.constructor.import('delta');
            return new Delta().insert(text);
          }
          return delta;
        });
      }
      
      // Override the keyboard module to prevent space transformation
      if (quill.keyboard) {
        // Remove any existing space bindings that might transform spaces
        delete quill.keyboard.bindings[32]; // Space key
        
        // Add custom space handler
        quill.keyboard.addBinding({ key: 32 }, (range: any, context: any) => {
          // Insert a regular space character
          quill.insertText(range.index, ' ', 'user');
          return false; // Prevent default behavior
        });
      }
      
      // Monitor for any &nbsp; insertions and replace them immediately
      const observer = new MutationObserver((mutations) => {
        let needsUpdate = false;
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const html = quill.root.innerHTML;
            if (html.includes('&nbsp;')) {
              needsUpdate = true;
            }
          }
        });
        
        if (needsUpdate) {
          // Use setTimeout to avoid infinite loop
          setTimeout(() => {
            const currentHTML = quill.root.innerHTML;
            if (currentHTML.includes('&nbsp;')) {
              const cleanHTML = currentHTML.replace(/&nbsp;/g, ' ');
              quill.root.innerHTML = cleanHTML;
            }
          }, 0);
        }
      });
      
      // Start observing
      observer.observe(quill.root, {
        childList: true,
        subtree: true,
        characterData: true
      });
      
      // Store observer for cleanup
      (quill as any)._spacePreservationObserver = observer;
      
      // Override text-change event to clean up any &nbsp; that might slip through
      quill.on('text-change', (delta: any, oldContents: any, source: string) => {
        if (source === 'user') {
          setTimeout(() => {
            const html = quill.root.innerHTML;
            if (html.includes('&nbsp;')) {
              const cleanHTML = html.replace(/&nbsp;/g, ' ');
              const currentSelection = quill.getSelection();
              quill.root.innerHTML = cleanHTML;
              if (currentSelection) {
                quill.setSelection(currentSelection);
              }
            }
          }, 0);
        }
      });
    }
  }
  
  // Clean up method to remove observers
  cleanupSpacePreservation(editor: any): void {
    if (editor && editor.quillEditor) {
      const quill = editor.quillEditor;
      if ((quill as any)._spacePreservationObserver) {
        (quill as any)._spacePreservationObserver.disconnect();
        delete (quill as any)._spacePreservationObserver;
      }
    }
  }
  
  // Utility method to clean content before saving
  cleanContentForSaving(content: string): string {
    if (!content) return content;
    
    // Replace all &nbsp; entities with regular spaces
    return content.replace(/&nbsp;/g, ' ');
  }
}
