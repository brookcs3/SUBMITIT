// Type definitions for EnhancedYogaLayoutEngine
declare module '../lib/EnhancedYogaLayoutEngine' {
  import { YogaNode } from 'yoga-layout-prebuilt';
  
  export class EnhancedYogaLayoutEngine {
    constructor(options?: {
      useWebDefaults?: boolean;
      printTree?: boolean;
      printLayout?: boolean;
      maxWidth?: number;
      maxHeight?: number;
    });

    createNode(config?: any): YogaNode;
    calculateLayout(node: YogaNode, width?: number, height?: number): void;
    printTree(node: YogaNode, printNode?: (node: YogaNode) => string): void;
    destroy(): void;
  }

  export default EnhancedYogaLayoutEngine;
}
