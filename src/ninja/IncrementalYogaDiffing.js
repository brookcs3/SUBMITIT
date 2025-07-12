/**
 * Incremental Yoga Diffing - Recalculate only changed nodes
 */
import { createHash } from 'crypto';
import { getCurrentTheme } from '../ui/theme.js';

export class IncrementalYogaDiffing {
  constructor() {
    this.nodeCache = new Map(); // nodeId -> { hash, yogaNode, computed }
    this.dependencyGraph = new Map(); // parentId -> [childIds]
    this.dirtyNodes = new Set();
    this.layoutMetrics = {
      totalCalculations: 0,
      cacheHits: 0,
      incrementalUpdates: 0
    };
    this.initialized = false;
  }

  /**
   * Initialize the engine (required before use)
   */
  async initializeEngine() {
    this.initialized = true;
    return true;
  }

  /**
   * Create content hash for node properties
   */
  hashNodeProps(props) {
    const hashableProps = {
      width: props.width,
      height: props.height,
      padding: props.padding,
      paddingX: props.paddingX,
      paddingY: props.paddingY,
      margin: props.margin,
      marginX: props.marginX,
      marginY: props.marginY,
      flexDirection: props.flexDirection,
      justifyContent: props.justifyContent,
      alignItems: props.alignItems,
      flexGrow: props.flexGrow,
      flexShrink: props.flexShrink,
      flexWrap: props.flexWrap,
      borderStyle: props.borderStyle,
      gap: props.gap,
      children: this.hashChildren(props.children)
    };
    
    return createHash('md5')
      .update(JSON.stringify(hashableProps, Object.keys(hashableProps).sort()))
      .digest('hex');
  }

  /**
   * Hash children for dependency tracking
   */
  hashChildren(children) {
    if (!children) return null;
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) {
      return children.map(child => this.hashSingleChild(child));
    }
    return this.hashSingleChild(children);
  }

  /**
   * Hash a single child element
   */
  hashSingleChild(child) {
    if (!child || typeof child === 'string') return child;
    if (child.props) {
      return {
        type: child.type?.name || 'unknown',
        props: this.hashNodeProps(child.props)
      };
    }
    return String(child);
  }

  /**
   * Check if node needs recalculation
   */
  needsRecalculation(nodeId, props) {
    const currentHash = this.hashNodeProps(props);
    const cached = this.nodeCache.get(nodeId);
    
    if (!cached) {
      this.markDirty(nodeId, 'new-node');
      return true;
    }
    
    if (cached.hash !== currentHash) {
      this.markDirty(nodeId, 'props-changed');
      return true;
    }
    
    // Check if any dependencies are dirty
    if (this.hasDirtyDependencies(nodeId)) {
      this.markDirty(nodeId, 'dependency-changed');
      return true;
    }
    
    this.layoutMetrics.cacheHits++;
    return false;
  }

  /**
   * Mark node as dirty and propagate to dependents
   */
  markDirty(nodeId, reason) {
    if (this.dirtyNodes.has(nodeId)) return;
    
    this.dirtyNodes.add(nodeId);
    
    // Mark all parent nodes as dirty (they depend on this node's layout)
    for (const [parentId, childIds] of this.dependencyGraph) {
      if (childIds.includes(nodeId)) {
        this.markDirty(parentId, `child-changed:${nodeId}`);
      }
    }
  }

  /**
   * Check if node has dirty dependencies
   */
  hasDirtyDependencies(nodeId) {
    const children = this.dependencyGraph.get(nodeId) || [];
    return children.some(childId => this.dirtyNodes.has(childId));
  }

  /**
   * Calculate layout with incremental diffing
   */
  async calculateIncrementalLayout(nodeId, props, parentId = null) {
    // Update dependency graph
    if (parentId) {
      this.addDependency(parentId, nodeId);
    }

    // Check if recalculation is needed
    if (!this.needsRecalculation(nodeId, props)) {
      const cached = this.nodeCache.get(nodeId);
      return {
        yogaNode: cached.yogaNode,
        computed: cached.computed,
        fromCache: true
      };
    }

    // Import Yoga (using dynamic import for better performance)
    const { loadYoga } = await import('yoga-layout/load');
    const Yoga = await loadYoga();

    // Create new Yoga node
    const yogaNode = Yoga.Node.create();
    
    // Configure node properties
    this.configureYogaNode(yogaNode, props, Yoga);
    
    // Process children recursively
    if (props.children) {
      const children = Array.isArray(props.children) ? props.children : [props.children];
      
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child && child.props) {
          const childId = `${nodeId}-child-${i}`;
          const childResult = await this.calculateIncrementalLayout(
            childId,
            child.props,
            nodeId
          );
          
          yogaNode.insertChild(childResult.yogaNode, i);
        }
      }
    }

    // Calculate layout
    yogaNode.calculateLayout();
    const computed = yogaNode.getComputedLayout();
    
    // Cache the result
    const currentHash = this.hashNodeProps(props);
    this.nodeCache.set(nodeId, {
      hash: currentHash,
      yogaNode,
      computed,
      timestamp: Date.now()
    });
    
    // Mark as clean
    this.dirtyNodes.delete(nodeId);
    
    this.layoutMetrics.totalCalculations++;
    this.layoutMetrics.incrementalUpdates++;
    
    return {
      yogaNode,
      computed,
      fromCache: false
    };
  }

  /**
   * Configure Yoga node with props
   */
  configureYogaNode(yogaNode, props, Yoga) {
    // Dimensions
    if (props.width !== undefined) {
      if (typeof props.width === 'string') {
        if (props.width.endsWith('%')) {
          yogaNode.setWidthPercent(parseFloat(props.width));
        } else if (props.width === 'auto') {
          yogaNode.setWidthAuto();
        }
      } else {
        yogaNode.setWidth(props.width);
      }
    }
    
    if (props.height !== undefined) {
      if (typeof props.height === 'string') {
        if (props.height.endsWith('%')) {
          yogaNode.setHeightPercent(parseFloat(props.height));
        } else if (props.height === 'auto') {
          yogaNode.setHeightAuto();
        }
      } else {
        yogaNode.setHeight(props.height);
      }
    }

    // Padding
    if (props.padding !== undefined) {
      yogaNode.setPadding(Yoga.EDGE_ALL, props.padding);
    }
    if (props.paddingX !== undefined) {
      yogaNode.setPadding(Yoga.EDGE_HORIZONTAL, props.paddingX);
    }
    if (props.paddingY !== undefined) {
      yogaNode.setPadding(Yoga.EDGE_VERTICAL, props.paddingY);
    }

    // Margin
    if (props.margin !== undefined) {
      yogaNode.setMargin(Yoga.EDGE_ALL, props.margin);
    }
    if (props.marginX !== undefined) {
      yogaNode.setMargin(Yoga.EDGE_HORIZONTAL, props.marginX);
    }
    if (props.marginY !== undefined) {
      yogaNode.setMargin(Yoga.EDGE_VERTICAL, props.marginY);
    }

    // Flex properties
    if (props.flexDirection) {
      const directionMap = {
        'row': Yoga.FLEX_DIRECTION_ROW,
        'column': Yoga.FLEX_DIRECTION_COLUMN,
        'row-reverse': Yoga.FLEX_DIRECTION_ROW_REVERSE,
        'column-reverse': Yoga.FLEX_DIRECTION_COLUMN_REVERSE
      };
      yogaNode.setFlexDirection(directionMap[props.flexDirection] || Yoga.FLEX_DIRECTION_COLUMN);
    }

    if (props.justifyContent) {
      const justifyMap = {
        'flex-start': Yoga.JUSTIFY_FLEX_START,
        'center': Yoga.JUSTIFY_CENTER,
        'flex-end': Yoga.JUSTIFY_FLEX_END,
        'space-between': Yoga.JUSTIFY_SPACE_BETWEEN,
        'space-around': Yoga.JUSTIFY_SPACE_AROUND,
        'space-evenly': Yoga.JUSTIFY_SPACE_EVENLY
      };
      yogaNode.setJustifyContent(justifyMap[props.justifyContent] || Yoga.JUSTIFY_FLEX_START);
    }

    if (props.alignItems) {
      const alignMap = {
        'flex-start': Yoga.ALIGN_FLEX_START,
        'center': Yoga.ALIGN_CENTER,
        'flex-end': Yoga.ALIGN_FLEX_END,
        'stretch': Yoga.ALIGN_STRETCH,
        'baseline': Yoga.ALIGN_BASELINE
      };
      yogaNode.setAlignItems(alignMap[props.alignItems] || Yoga.ALIGN_FLEX_START);
    }

    if (props.flexGrow !== undefined) {
      yogaNode.setFlexGrow(props.flexGrow);
    }
    if (props.flexShrink !== undefined) {
      yogaNode.setFlexShrink(props.flexShrink);
    }

    if (props.flexWrap) {
      const wrapMap = {
        'nowrap': Yoga.WRAP_NO_WRAP,
        'wrap': Yoga.WRAP_WRAP,
        'wrap-reverse': Yoga.WRAP_WRAP_REVERSE
      };
      yogaNode.setFlexWrap(wrapMap[props.flexWrap] || Yoga.WRAP_NO_WRAP);
    }

    if (props.gap !== undefined) {
      yogaNode.setGap(Yoga.GUTTER_ALL, props.gap);
    }
  }

  /**
   * Add dependency relationship
   */
  addDependency(parentId, childId) {
    if (!this.dependencyGraph.has(parentId)) {
      this.dependencyGraph.set(parentId, []);
    }
    const children = this.dependencyGraph.get(parentId);
    if (!children.includes(childId)) {
      children.push(childId);
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const cacheHitRatio = this.layoutMetrics.totalCalculations > 0 
      ? this.layoutMetrics.cacheHits / this.layoutMetrics.totalCalculations 
      : 0;

    return {
      ...this.layoutMetrics,
      cacheHitRatio,
      cachedNodes: this.nodeCache.size,
      dirtyNodes: this.dirtyNodes.size,
      dependencies: this.dependencyGraph.size
    };
  }

  /**
   * Clear caches and reset state
   */
  clearCache() {
    // Free Yoga nodes to prevent memory leaks
    for (const cached of this.nodeCache.values()) {
      if (cached.yogaNode) {
        cached.yogaNode.free();
      }
    }
    
    this.nodeCache.clear();
    this.dependencyGraph.clear();
    this.dirtyNodes.clear();
    this.layoutMetrics = {
      totalCalculations: 0,
      cacheHits: 0,
      incrementalUpdates: 0
    };
  }

  /**
   * Debug utility - print layout tree
   */
  debugLayoutTree(nodeId = 'root', indent = 0) {
    const cached = this.nodeCache.get(nodeId);
    const prefix = '  '.repeat(indent);
    const status = this.dirtyNodes.has(nodeId) ? '[DIRTY]' : '[CLEAN]';
    
    console.log(`${prefix}${nodeId} ${status}`);
    if (cached) {
      console.log(`${prefix}  Layout: ${cached.computed.width}x${cached.computed.height}`);
    }
    
    const children = this.dependencyGraph.get(nodeId) || [];
    children.forEach(childId => {
      this.debugLayoutTree(childId, indent + 1);
    });
  }
}

export default IncrementalYogaDiffing;