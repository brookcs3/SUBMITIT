#!/usr/bin/env node

/**
 * Enhanced Yoga Layout Engine
 * Provides a clean, type-safe interface for Yoga layout calculations
 */

import Yoga from 'yoga-layout';

/**
 * Enhanced Yoga Layout Engine class
 */
class EnhancedYogaLayoutEngine {
  /**
   * Create a new layout engine instance
   * @param {Object} [config] - Layout configuration
   */
  constructor(config = {}) {
    this.root = this.createNode(config);
    this.nodes = new Set();
  }

  /**
   * Calculate the layout
   * @param {number} [width] - Available width
   * @param {number} [height] - Available height
   * @param {'ltr'|'rtl'} [direction='ltr'] - Layout direction
   */
  calculateLayout(width, height, direction = 'ltr') {
    if (width !== undefined) this.root.setWidth(width);
    if (height !== undefined) this.root.setHeight(height);
    
    this.root.setDirection(
      direction === 'rtl' ? Yoga.DIRECTION_RTL : Yoga.DIRECTION_LTR
    );
    
    this.root.calculateLayout(
      width || 0,
      height || 0,
      Yoga.DIRECTION_LTR
    );
  }

  /**
   * Get the root layout node
   * @returns {Object} Layout node with dimensions
   */
  getRootNode() {
    return this._getNodeLayout(this.root);
  }

  /**
   * Create a new layout node
   * @param {Object} [config] - Node configuration
   * @returns {Object} New Yoga node
   */
  createNode(config = {}) {
    const node = Yoga.Node.create();
    this._applyConfig(node, config);
    this.nodes.add(node);
    return node;
  }

  /**
   * Insert a child node
   * @param {Object} parent - Parent node
   * @param {Object} child - Child node
   * @param {number} index - Insertion index
   */
  insertChild(parent, child, index) {
    parent.insertChild(child, index);
  }

  /**
   * Remove a child node
   * @param {Object} parent - Parent node
   * @param {Object} child - Child node to remove
   */
  removeChild(parent, child) {
    parent.removeChild(child);
  }

  /**
   * Free resources used by a node
   * @param {Object} node - Node to free
   */
  freeNode(node) {
    if (this.nodes.has(node)) {
      node.freeRecursive();
      this.nodes.delete(node);
    }
  }

  /**
   * Free all resources
   */
  freeRecursive() {
    this.nodes.forEach(node => node.freeRecursive());
    this.nodes.clear();
  }

  /**
   * Apply configuration to a node
   * @private
   */
  _applyConfig(node, config) {
    const {
      width,
      height,
      flexDirection,
      justifyContent,
      alignItems,
      flexWrap,
      flexGrow,
      flexShrink,
      flexBasis,
      margin = 0,
      marginHorizontal,
      marginVertical,
      marginTop = marginVertical || margin,
      marginRight = marginHorizontal || margin,
      marginBottom = marginVertical || margin,
      marginLeft = marginHorizontal || margin,
      padding = 0,
      paddingHorizontal,
      paddingVertical,
      paddingTop = paddingVertical || padding,
      paddingRight = paddingHorizontal || padding,
      paddingBottom = paddingVertical || padding,
      paddingLeft = paddingHorizontal || padding,
      position = 'relative',
      ...rest
    } = config;

    if (width !== undefined) node.setWidth(width);
    if (height !== undefined) node.setHeight(height);
    if (flexDirection) node.setFlexDirection(this._mapFlexDirection(flexDirection));
    if (justifyContent) node.setJustifyContent(this._mapJustifyContent(justifyContent));
    if (alignItems) node.setAlignItems(this._mapAlign(alignItems));
    if (flexWrap) node.setFlexWrap(this._mapWrap(flexWrap));
    if (flexGrow !== undefined) node.setFlexGrow(flexGrow);
    if (flexShrink !== undefined) node.setFlexShrink(flexShrink);
    if (flexBasis !== undefined) node.setFlexBasis(flexBasis);
    if (position === 'absolute') node.setPositionType(Yoga.POSITION_TYPE_ABSOLUTE);

    // Apply margins
    node.setMargin(Yoga.EDGE_TOP, marginTop);
    node.setMargin(Yoga.EDGE_RIGHT, marginRight);
    node.setMargin(Yoga.EDGE_BOTTOM, marginBottom);
    node.setMargin(Yoga.EDGE_LEFT, marginLeft);

    // Apply padding
    node.setPadding(Yoga.EDGE_TOP, paddingTop);
    node.setPadding(Yoga.EDGE_RIGHT, paddingRight);
    node.setPadding(Yoga.EDGE_BOTTOM, paddingBottom);
    node.setPadding(Yoga.EDGE_LEFT, paddingLeft);
  }

  /**
   * Get layout information for a node
   * @private
   */
  _getNodeLayout(node) {
    return {
      x: node.getComputedLeft(),
      y: node.getComputedTop(),
      width: node.getComputedWidth(),
      height: node.getComputedHeight(),
      children: Array.from({ length: node.getChildCount() })
        .map((_, i) => this._getNodeLayout(node.getChild(i))),
      style: {}
    };
  }

  /**
   * Map flex direction string to Yoga constant
   * @private
   */
  _mapFlexDirection(direction) {
    const map = {
      'row': Yoga.FLEX_DIRECTION_ROW,
      'row-reverse': Yoga.FLEX_DIRECTION_ROW_REVERSE,
      'column': Yoga.FLEX_DIRECTION_COLUMN,
      'column-reverse': Yoga.FLEX_DIRECTION_COLUMN_REVERSE
    };
    return map[direction] || Yoga.FLEX_DIRECTION_ROW;
  }

  /**
   * Map justify content string to Yoga constant
   * @private
   */
  _mapJustifyContent(justify) {
    const map = {
      'flex-start': Yoga.JUSTIFY_FLEX_START,
      'center': Yoga.JUSTIFY_CENTER,
      'flex-end': Yoga.JUSTIFY_FLEX_END,
      'space-between': Yoga.JUSTIFY_SPACE_BETWEEN,
      'space-around': Yoga.JUSTIFY_SPACE_AROUND,
      'space-evenly': Yoga.JUSTIFY_SPACE_EVENLY
    };
    return map[justify] || Yoga.JUSTIFY_FLEX_START;
  }

  /**
   * Map align string to Yoga constant
   * @private
   */
  _mapAlign(align) {
    const map = {
      'flex-start': Yoga.ALIGN_FLEX_START,
      'center': Yoga.ALIGN_CENTER,
      'flex-end': Yoga.ALIGN_FLEX_END,
      'stretch': Yoga.ALIGN_STRETCH,
      'baseline': Yoga.ALIGN_BASELINE
    };
    return map[align] || Yoga.ALIGN_STRETCH;
  }

  /**
   * Map flex wrap string to Yoga constant
   * @private
   */
  _mapWrap(wrap) {
    const map = {
      'nowrap': Yoga.WRAP_NO_WRAP,
      'wrap': Yoga.WRAP_WRAP,
      'wrap-reverse': Yoga.WRAP_WRAP_REVERSE
    };
    return map[wrap] || Yoga.WRAP_NO_WRAP;
  }
}

/**
 * Simple Yoga layout function
 */
function simpleYogaLayout() {
  const engine = new EnhancedYogaLayoutEngine({
    width: 300,
    height: 200,
    flexDirection: 'column',
    padding: 10
  });

  // Create header
  const header = engine.createNode({
    height: 50,
    marginBottom: 10
  });
  engine.insertChild(engine.root, header, 0);

  // Create content area
  const content = engine.createNode({
    flexGrow: 1,
    marginBottom: 10
  });
  engine.insertChild(engine.root, content, 1);
  
  // Create footer
  const footer = Yoga.Node.create();
  footer.setHeight(30);
  root.insertChild(footer, 2);
  
  // Calculate layout
  root.calculateLayout(Yoga.UNDEFINED, Yoga.UNDEFINED, Yoga.DIRECTION_LTR);
  
  // Get computed values
  const rootLayout = root.getComputedLayout();
  const headerLayout = header.getComputedLayout();
  const contentLayout = content.getComputedLayout();
  const footerLayout = footer.getComputedLayout();
  
  console.log(chalk.cyan('📐 Layout Results:'));
  console.log(chalk.white(`Root: ${rootLayout.width}x${rootLayout.height}`));
  console.log(chalk.white(`Header: ${headerLayout.width}x${headerLayout.height} at (${headerLayout.left}, ${headerLayout.top})`));
  console.log(chalk.white(`Content: ${contentLayout.width}x${contentLayout.height} at (${contentLayout.left}, ${contentLayout.top})`));
  console.log(chalk.white(`Footer: ${footerLayout.width}x${footerLayout.height} at (${footerLayout.left}, ${footerLayout.top})`));
  
  // Cleanup
  header.freeRecursive();
  content.freeRecursive();
  footer.freeRecursive();
  root.freeRecursive();
  
  console.log(chalk.green('✅ Yoga layout calculation complete!'));
  
  return {
    root: rootLayout,
    header: headerLayout,
    content: contentLayout,
    footer: footerLayout
  };
}

/**
 * Higher-order component that adds Yoga layout capabilities to a React component
 * @param {React.ComponentType} Component - React component to enhance
 * @returns {React.ComponentType} Enhanced component with Yoga layout props
 */
function withYogaLayout(Component) {
  return function YogaEnhancedComponent(props) {
    const [layout, setLayout] = React.useState(null);
    const containerRef = React.useRef(null);
    
    React.useEffect(() => {
      const engine = new EnhancedYogaLayoutEngine({
        width: props.width || 0,
        height: props.height || 0,
        ...props.style
      });
      
      // Calculate layout when dimensions change
      const updateLayout = () => {
        if (containerRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          engine.calculateLayout(width, height);
          setLayout(engine.getRootNode());
        }
      };
      
      updateLayout();
      
      // Handle window resize
      window.addEventListener('resize', updateLayout);
      return () => window.removeEventListener('resize', updateLayout);
    }, [props.width, props.height, props.style]);
    
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
        <Component {...props} layout={layout} />
      </div>
    );
  };
}

/**
 * Create a layout context for managing layout state
 * @returns {Object} Context with root node and layout calculation function
 */
function createLayoutContext() {
  const engine = new EnhancedYogaLayoutEngine();
  
  return {
    root: engine.root,
    calculateLayout: (width, height) => {
      engine.calculateLayout(width, height);
      return engine.getRootNode();
    }
  };
}

// Export everything
export {
  EnhancedYogaLayoutEngine as default,
  EnhancedYogaLayoutEngine,
  simpleYogaLayout,
  withYogaLayout,
  createLayoutContext
};

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  simpleYogaLayout();
}