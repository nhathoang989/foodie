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
      
      // Override the Quill matchers that convert spaces to &nbsp;
      // @ts-ignore - Quill types may not be fully defined in TypeScript
      const Delta = (window as any).Quill?.import?.('delta') || quill.constructor?.import?.('delta');
      
      // Override the Quill's built-in text-based handling if Delta exists
      if (Delta && quill.clipboard && quill.clipboard.addMatcher) {
        quill.clipboard.addMatcher(Node.TEXT_NODE, (node: Node, delta: any) => {
          // Preserve regular spaces instead of converting to &nbsp;
          if (node.textContent) {
            return new Delta().insert(node.textContent);
          }
          return delta;
        });
      }
    }
  }
}
