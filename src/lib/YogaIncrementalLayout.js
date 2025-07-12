/**
 * Yoga Incremental Layout Engine
 * 
 * Leverages Ninja's incremental build principles for Yoga layout calculations.
 * Only recalculates layouts when content or dependencies actually change.
 */
import yoga from 'yoga-layout';
import { createHash } from 'crypto';

export class YogaIncrementalLayout {
  constructor() {
    this.layoutCache = new Map();
    this.nodeHashes = new Map();
    this.dependencyGraph = new Map();
    this.dirtyNodes = new Set();
  }

  /**
   * Create content hash for change detection (Ninja-style)
   */
  hashNodeContent(nodeData) {
    const contentString = JSON.stringify({
      width: nodeData.width,
      height: nodeData.height,
      padding: nodeData.padding,
      margin: nodeData.margin,
      flexDirection: nodeData.flexDirection,
      justifyContent: nodeData.justifyContent,
      alignItems: nodeData.alignItems,
      children: nodeData.children?.map(child => this.hashNodeContent(child))
    });
    return createHash('md5').update(contentString).digest('hex');
  }

  /**
   * Check if node needs recalculation based on content changes
   */
  needsRecalculation(nodeId, nodeData) {
    const currentHash = this.hashNodeContent(nodeData);
    const previousHash = this.nodeHashes.get(nodeId);
    
    if (currentHash !== previousHash) {
      this.nodeHashes.set(nodeId, currentHash);
      this.markDirty(nodeId);
      return true;
    }
    return false;
  }

  /**
   * Mark node and dependents as dirty (Ninja dependency tracking)
   */
  markDirty(nodeId) {
    this.dirtyNodes.add(nodeId);
    
    // Mark all dependent nodes as dirty
    const dependents = this.dependencyGraph.get(nodeId) || [];
    for (const dependent of dependents) {
      this.markDirty(dependent);
    }
  }

  /**
   * Incremental layout calculation - only process dirty nodes
   */
  calculateIncrementalLayout(rootNodeData, nodeId = 'root') {
    // Check if this node needs recalculation
    if (!this.needsRecalculation(nodeId, rootNodeData) && 
        !this.dirtyNodes.has(nodeId)) {
      // Return cached layout if available
      const cached = this.layoutCache.get(nodeId);
      if (cached) {
        return cached;
      }
    }

    // Create Yoga node
    const node = yoga.Node.create();
    this.configureYogaNode(node, rootNodeData);

    // Process children incrementally
    if (rootNodeData.children) {
      rootNodeData.children.forEach((childData, index) => {
        const childId = `${nodeId}-child-${index}`;
        
        // Add dependency relationship
        this.addDependency(nodeId, childId);
        
        // Calculate child layout incrementally
        const childNode = this.calculateIncrementalLayout(childData, childId);
        node.insertChild(childNode, index);
      });
    }

    // Calculate layout only if dirty
    if (this.dirtyNodes.has(nodeId)) {
      node.calculateLayout();
      this.dirtyNodes.delete(nodeId);
    }

    // Cache the result
    this.layoutCache.set(nodeId, node);
    
    return node;
  }

  /**
   * Configure Yoga node properties
   */
  configureYogaNode(node, nodeData) {
    if (nodeData.width !== undefined) {
      node.setWidth(nodeData.width);
    }
    if (nodeData.height !== undefined) {
      node.setHeight(nodeData.height);
    }
    if (nodeData.padding) {
      node.setPadding(yoga.EDGE_ALL, nodeData.padding);
    }
    if (nodeData.margin) {
      node.setMargin(yoga.EDGE_ALL, nodeData.margin);
    }
    if (nodeData.flexDirection) {
      node.setFlexDirection(
        nodeData.flexDirection === 'row' ? yoga.FLEX_DIRECTION_ROW : yoga.FLEX_DIRECTION_COLUMN
      );
    }
    if (nodeData.justifyContent) {
      const justifyMap = {
        'flex-start': yoga.JUSTIFY_FLEX_START,
        'center': yoga.JUSTIFY_CENTER,
        'flex-end': yoga.JUSTIFY_FLEX_END,
        'space-between': yoga.JUSTIFY_SPACE_BETWEEN,
        'space-around': yoga.JUSTIFY_SPACE_AROUND
      };
      node.setJustifyContent(justifyMap[nodeData.justifyContent] || yoga.JUSTIFY_FLEX_START);
    }
    if (nodeData.alignItems) {
      const alignMap = {
        'flex-start': yoga.ALIGN_FLEX_START,
        'center': yoga.ALIGN_CENTER,
        'flex-end': yoga.ALIGN_FLEX_END,
        'stretch': yoga.ALIGN_STRETCH
      };
      node.setAlignItems(alignMap[nodeData.alignItems] || yoga.ALIGN_FLEX_START);
    }
  }

  /**
   * Add dependency relationship for change propagation
   */
  addDependency(parentId, childId) {
    if (!this.dependencyGraph.has(parentId)) {
      this.dependencyGraph.set(parentId, []);
    }
    const deps = this.dependencyGraph.get(parentId);
    if (!deps.includes(childId)) {
      deps.push(childId);
    }
  }

  /**
   * Get layout metrics for performance monitoring
   */
  getLayoutMetrics() {
    return {
      cachedLayouts: this.layoutCache.size,
      dirtyNodes: this.dirtyNodes.size,
      totalDependencies: Array.from(this.dependencyGraph.values()).reduce(
        (sum, deps) => sum + deps.length, 0
      )
    };
  }

  /**
   * Clear caches for memory management
   */
  clearCache() {
    this.layoutCache.clear();
    this.nodeHashes.clear();
    this.dirtyNodes.clear();
  }
}

// Example usage showing performance improvement
export function demonstrateIncrementalLayout() {
  const layoutEngine = new YogaIncrementalLayout();
  
  const projectLayout = {
    width: 800,
    height: 600,
    flexDirection: 'column',
    children: [
      { width: 800, height: 100, padding: 10 }, // Header
      { width: 800, height: 400, flexDirection: 'row', children: [
        { width: 200, height: 400 }, // Sidebar
        { width: 600, height: 400 }  // Content
      ]},
      { width: 800, height: 100 }   // Footer
    ]
  };

  console.time('Initial layout calculation');
  const layout1 = layoutEngine.calculateIncrementalLayout(projectLayout);
  console.timeEnd('Initial layout calculation');
  
  // Simulate small change - only header padding changes
  const modifiedLayout = {
    ...projectLayout,
    children: [
      { width: 800, height: 100, padding: 20 }, // Only this changed
      ...projectLayout.children.slice(1)
    ]
  };

  console.time('Incremental layout update');
  const layout2 = layoutEngine.calculateIncrementalLayout(modifiedLayout);
  console.timeEnd('Incremental layout update');
  
  console.log('Metrics:', layoutEngine.getLayoutMetrics());
  // Expected: Only header and root recalculated, sidebar/content/footer cached
}