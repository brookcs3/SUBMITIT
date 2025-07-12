#!/usr/bin/env node

/**
 * Simple Yoga layout that actually works
 * No 3,381 lines, no memory optimizers, just basic layout calculation
 */

import Yoga from 'yoga-layout';
import chalk from 'chalk';

export function simpleYogaLayout() {
  console.log(chalk.green('🧘 Testing Yoga Layout Engine...'));
  
  // Create a simple layout tree
  const root = Yoga.Node.create();
  root.setWidth(300);
  root.setHeight(200);
  root.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
  root.setPadding(Yoga.EDGE_ALL, 10);
  
  // Create header
  const header = Yoga.Node.create();
  header.setHeight(50);
  header.setMargin(Yoga.EDGE_BOTTOM, 10);
  root.insertChild(header, 0);
  
  // Create content area
  const content = Yoga.Node.create();
  content.setFlexGrow(1);
  content.setMargin(Yoga.EDGE_BOTTOM, 10);
  root.insertChild(content, 1);
  
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

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  simpleYogaLayout();
}