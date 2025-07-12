import yoga from 'yoga-layout';

export class YogaLayoutEngine {
  constructor() {
    this.defaultStyles = {
      flexDirection: yoga.FLEX_DIRECTION_COLUMN,
      justifyContent: yoga.JUSTIFY_FLEX_START,
      alignItems: yoga.ALIGN_STRETCH,
      flexWrap: yoga.WRAP_NO_WRAP
    };
  }

  generateLayout(items, containerWidth = 800, containerHeight = 600) {
    try {
      const root = yoga.Node.create();
      
      // Configure root container
      root.setStyleWidth(containerWidth);
      root.setStyleHeight(containerHeight);
      root.setFlexDirection(this.defaultStyles.flexDirection);
      root.setJustifyContent(this.defaultStyles.justifyContent);
      root.setAlignItems(this.defaultStyles.alignItems);
      root.setPadding(yoga.EDGE_ALL, 20);

      // Create child nodes for each item
      items.forEach((item, index) => {
        const child = yoga.Node.create();
        const dimensions = this.calculateItemDimensions(item, containerWidth);
        
        // Set item dimensions
        child.setStyleWidth(dimensions.width);
        child.setStyleHeight(dimensions.height);
        child.setStyleMargin(yoga.EDGE_BOTTOM, 20);
        
        // Set flex properties based on item type
        if (item.type === 'hero' || item.role === 'hero') {
          child.setStyleFlexGrow(1);
          child.setStyleAlignSelf(yoga.ALIGN_CENTER);
        } else if (item.type === 'image' && item.role === 'gallery') {
          child.setStyleFlexGrow(0);
          child.setStyleFlexShrink(0);
        } else if (item.type === 'text') {
          child.setStyleFlexGrow(0);
          child.setStyleFlexShrink(1);
        }

        root.insertChild(child, index);
      });

      // Calculate layout
      root.calculateLayout(containerWidth, containerHeight, yoga.DIRECTION_LTR);

      // Extract layout information
      const layout = this.extractLayoutInfo(root, items);

      // Clean up memory
      root.freeRecursive();

      return layout;

    } catch (error) {
      console.error('Error generating Yoga layout:', error);
      return this.fallbackLayout(items);
    }
  }

  calculateItemDimensions(item, containerWidth) {
    const baseWidth = containerWidth - 40; // Account for padding

    switch (item.type) {
      case 'image':
        if (item.role === 'hero') {
          return { width: baseWidth, height: Math.round(baseWidth * 0.6) };
        } else if (item.role === 'gallery') {
          return { width: Math.round(baseWidth * 0.48), height: Math.round(baseWidth * 0.3) };
        }
        return { width: baseWidth, height: 300 };

      case 'document':
        return { width: Math.min(baseWidth, 600), height: 400 };

      case 'text':
        return { width: Math.min(baseWidth, 700), height: 'auto' };

      case 'audio':
        return { width: Math.min(baseWidth, 400), height: 60 };

      case 'video':
        return { width: baseWidth, height: Math.round(baseWidth * 0.5625) }; // 16:9 aspect ratio

      default:
        return { width: baseWidth, height: 200 };
    }
  }

  extractLayoutInfo(rootNode, items) {
    const layout = {
      type: 'column',
      width: rootNode.getComputedWidth(),
      height: rootNode.getComputedHeight(),
      children: []
    };

    items.forEach((item, index) => {
      const childNode = rootNode.getChild(index);
      
      layout.children.push({
        name: item.name,
        type: item.type,
        role: item.role,
        x: childNode.getComputedLeft(),
        y: childNode.getComputedTop(),
        width: childNode.getComputedWidth(),
        height: childNode.getComputedHeight(),
        margin: {
          top: childNode.getComputedMargin(yoga.EDGE_TOP),
          right: childNode.getComputedMargin(yoga.EDGE_RIGHT),
          bottom: childNode.getComputedMargin(yoga.EDGE_BOTTOM),
          left: childNode.getComputedMargin(yoga.EDGE_LEFT)
        },
        padding: {
          top: childNode.getComputedPadding(yoga.EDGE_TOP),
          right: childNode.getComputedPadding(yoga.EDGE_RIGHT),
          bottom: childNode.getComputedPadding(yoga.EDGE_BOTTOM),
          left: childNode.getComputedPadding(yoga.EDGE_LEFT)
        }
      });
    });

    return layout;
  }

  fallbackLayout(items) {
    // Simple fallback layout when Yoga fails
    let currentY = 20;
    const containerWidth = 800;
    
    const layout = {
      type: 'column',
      width: containerWidth,
      height: 600,
      children: []
    };

    items.forEach((item, index) => {
      const dimensions = this.calculateItemDimensions(item, containerWidth);
      
      layout.children.push({
        name: item.name,
        type: item.type,
        role: item.role,
        x: 20,
        y: currentY,
        width: dimensions.width,
        height: dimensions.height,
        margin: { top: 0, right: 0, bottom: 20, left: 0 },
        padding: { top: 0, right: 0, bottom: 0, left: 0 }
      });

      currentY += dimensions.height + 20;
    });

    layout.height = currentY;
    return layout;
  }

  generateResponsiveLayout(items, breakpoints = { mobile: 320, tablet: 768, desktop: 1024 }) {
    const layouts = {};

    Object.entries(breakpoints).forEach(([device, width]) => {
      layouts[device] = this.generateLayout(items, width, 600);
    });

    return layouts;
  }

  validateLayout(layout) {
    if (!layout || !layout.children) {
      return false;
    }

    // Check for overlapping elements
    for (let i = 0; i < layout.children.length; i++) {
      for (let j = i + 1; j < layout.children.length; j++) {
        const a = layout.children[i];
        const b = layout.children[j];
        
        if (this.elementsOverlap(a, b)) {
          console.warn(`Layout warning: Elements ${a.name} and ${b.name} overlap`);
        }
      }
    }

    return true;
  }

  elementsOverlap(a, b) {
    return !(
      a.x + a.width <= b.x ||
      b.x + b.width <= a.x ||
      a.y + a.height <= b.y ||
      b.y + b.height <= a.y
    );
  }

  optimizeLayout(layout) {
    // Remove unnecessary margins and optimize spacing
    const optimized = { ...layout };
    
    optimized.children = layout.children.map(child => {
      const optimizedChild = { ...child };
      
      // Minimize excessive margins
      if (optimizedChild.margin.bottom > 40) {
        optimizedChild.margin.bottom = 40;
      }
      
      return optimizedChild;
    });

    return optimized;
  }

  exportToCss(layout) {
    let css = `
.submitit-container {
  width: ${layout.width}px;
  height: ${layout.height}px;
  position: relative;
}

`;

    layout.children.forEach((child, index) => {
      css += `
.submitit-item-${index} {
  position: absolute;
  left: ${child.x}px;
  top: ${child.y}px;
  width: ${child.width}px;
  height: ${child.height}px;
  margin: ${child.margin.top}px ${child.margin.right}px ${child.margin.bottom}px ${child.margin.left}px;
  padding: ${child.padding.top}px ${child.padding.right}px ${child.padding.bottom}px ${child.padding.left}px;
}

`;
    });

    return css;
  }
}