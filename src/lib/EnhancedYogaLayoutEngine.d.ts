/**
 * Type definitions for EnhancedYogaLayoutEngine
 */

declare module './EnhancedYogaLayoutEngine' {
  /**
   * Layout configuration options
   */
  export interface LayoutConfig {
    width?: number;
    height?: number;
    direction?: 'ltr' | 'rtl';
    flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
    alignContent?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'space-between' | 'space-around';
    flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: number | string;
    position?: 'relative' | 'absolute';
    margin?: number | string;
    marginHorizontal?: number | string;
    marginVertical?: number | string;
    marginTop?: number | string;
    marginRight?: number | string;
    marginBottom?: number | string;
    marginLeft?: number | string;
    padding?: number | string;
    paddingHorizontal?: number | string;
    paddingVertical?: number | string;
    paddingTop?: number | string;
    paddingRight?: number | string;
    paddingBottom?: number | string;
    paddingLeft?: number | string;
    borderWidth?: number;
    borderTopWidth?: number;
    borderRightWidth?: number;
    borderBottomWidth?: number;
    borderLeftWidth?: number;
    positionType?: 'relative' | 'absolute';
    positionTop?: number | string;
    positionRight?: number | string;
    positionBottom?: number | string;
    positionLeft?: number | string;
    aspectRatio?: number;
  }

  /**
   * Layout node with calculated dimensions
   */
  export interface LayoutNode {
    x: number;
    y: number;
    width: number;
    height: number;
    children: LayoutNode[];
    style: LayoutConfig;
  }

  /**
   * Enhanced Yoga Layout Engine class
   */
  export default class EnhancedYogaLayoutEngine {
    /**
     * Create a new layout engine instance
     * @param config Layout configuration
     */
    constructor(config?: LayoutConfig);

    /**
     * Calculate the layout
     * @param width Available width
     * @param height Available height
     * @param direction Layout direction (ltr or rtl)
     */
    calculateLayout(width?: number, height?: number, direction?: 'ltr' | 'rtl'): void;

    /**
     * Get the root layout node
     */
    getRootNode(): LayoutNode;

    /**
     * Create a new layout node
     * @param config Node configuration
     */
    createNode(config?: LayoutConfig): LayoutNode;

    /**
     * Insert a child node
     * @param parent Parent node
     * @param child Child node
     * @param index Insertion index
     */
    insertChild(parent: LayoutNode, child: LayoutNode, index: number): void;

    /**
     * Remove a child node
     * @param parent Parent node
     * @param child Child node
     */
    removeChild(parent: LayoutNode, child: LayoutNode): void;

    /**
     * Free resources used by a node
     * @param node Node to free
     */
    freeNode(node: LayoutNode): void;

    /**
     * Free all resources
     */
    freeRecursive(): void;
  }

  /**
   * Simple Yoga layout function
   */
  export function simpleYogaLayout(): void;

  /**
   * Apply layout to a React component
   * @param Component React component to enhance
   */
  export function withYogaLayout<T>(Component: React.ComponentType<T>): React.ComponentType<T>;

  /**
   * Create a new layout context
   */
  export function createLayoutContext(): {
    root: LayoutNode;
    calculateLayout: (width?: number, height?: number) => void;
  };
}

export default EnhancedYogaLayoutEngine;
