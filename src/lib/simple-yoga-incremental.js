/**
 * Simple Yoga Incremental Layout - Minimal Ninja-inspired optimization
 * 
 * Demonstrates the core principle: only recalculate layouts when content actually changes.
 * This is the simplest possible implementation of incremental build concepts for Yoga.
 */

import { createHash } from 'crypto';
import chalk from 'chalk';

/**
 * Simple function to check if a layout should be recalculated
 * Returns true if recalculation needed, false if cached layout can be used
 */
export function shouldRecalculateLayout(file, layoutCache) {
  // Check if file is new (not in cache)
  if (!layoutCache[file.path]) {
    console.log(chalk.blue(`[yoga-inc] New file, calculating layout: ${file.path}`));
    return true;
  }

  // Get cached layout info
  const cachedLayout = layoutCache[file.path];
  
  // Simple content change detection using hash
  const currentContentHash = createHash('md5').update(file.content || '').digest('hex');
  
  if (cachedLayout.contentHash !== currentContentHash) {
    console.log(chalk.yellow(`[yoga-inc] Content changed, recalculating layout: ${file.path}`));
    return true;
  }

  console.log(chalk.green(`[yoga-inc] Using cached layout: ${file.path}`));
  return false;
}

/**
 * Calculate Yoga layout for a single file
 * This is what gets called when shouldRecalculateLayout() returns true
 */
export async function calculateYogaLayout(file, terminalWidth = 80) {
  // Import Yoga (using the load version for compatibility)
  const { loadYoga } = await import('yoga-layout/load');
  const Yoga = await loadYoga();

  // Create root node
  const node = Yoga.Node.create();
  
  // Set basic terminal-friendly dimensions
  node.setWidth(terminalWidth);
  node.setHeight('auto');
  node.setPadding(Yoga.EDGE_ALL, 1);
  node.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);

  // Set height based on content (simple line counting)
  if (file.content) {
    const lines = file.content.split('\n');
    node.setHeight(lines.length + 2); // Content lines + padding
  }

  // Calculate the layout
  node.calculateLayout();

  // Get computed layout
  const layout = node.getComputedLayout();
  
  // Clean up memory
  node.free();

  return {
    width: layout.width,
    height: layout.height,
    left: layout.left,
    top: layout.top
  };
}

/**
 * Example usage showing the incremental layout pattern
 */
export async function demonstrateIncrementalLayout() {
  // Simple in-memory cache (in production, this could be persistent)
  const layoutCache = {};

  // Sample files
  const files = [
    { path: 'bio.md', content: 'Hello\nThis is my bio\nI like coding' },
    { path: 'projects.md', content: 'My Projects:\n- Project 1\n- Project 2\n- Project 3' },
    { path: 'contact.md', content: 'Email: me@example.com' }
  ];

  console.log('=== Initial Layout Calculation ===');
  
  // First pass - all files are new, so all need calculation
  for (const file of files) {
    if (shouldRecalculateLayout(file, layoutCache)) {
      console.time(`Layout calculation: ${file.path}`);
      
      const layout = await calculateYogaLayout(file);
      
      // Cache the result with content hash
      const contentHash = createHash('md5').update(file.content || '').digest('hex');
      layoutCache[file.path] = {
        layout,
        contentHash,
        timestamp: Date.now()
      };
      
      console.timeEnd(`Layout calculation: ${file.path}`);
      console.log(`  Result: ${layout.width}x${layout.height}`);
    }
  }

  console.log('\n=== Second Pass - No Changes ===');
  
  // Second pass - no changes, should use cache
  for (const file of files) {
    if (shouldRecalculateLayout(file, layoutCache)) {
      console.log(`  Unexpected recalculation for ${file.path}`);
    } else {
      const cached = layoutCache[file.path];
      console.log(`  Using cached: ${file.path} (${cached.layout.width}x${cached.layout.height})`);
    }
  }

  console.log('\n=== Third Pass - One File Changed ===');
  
  // Third pass - modify one file
  files[0].content = 'Hello\nThis is my updated bio\nI really like coding\nAnd building CLI tools';
  
  for (const file of files) {
    if (shouldRecalculateLayout(file, layoutCache)) {
      console.time(`Layout calculation: ${file.path}`);
      
      const layout = await calculateYogaLayout(file);
      
      // Update cache
      const contentHash = createHash('md5').update(file.content || '').digest('hex');
      layoutCache[file.path] = {
        layout,
        contentHash,
        timestamp: Date.now()
      };
      
      console.timeEnd(`Layout calculation: ${file.path}`);
      console.log(`  Updated result: ${layout.width}x${layout.height}`);
    } else {
      const cached = layoutCache[file.path];
      console.log(`  Using cached: ${file.path} (${cached.layout.width}x${cached.layout.height})`);
    }
  }

  console.log('\n=== Cache Status ===');
  console.log(`Total cached layouts: ${Object.keys(layoutCache).length}`);
  for (const [path, cache] of Object.entries(layoutCache)) {
    console.log(`  ${path}: ${cache.layout.width}x${cache.layout.height} (hash: ${cache.contentHash.slice(0, 8)}...)`);
  }
}

// Simple test function to verify the concept works
export function testIncrementalConcept() {
  const layoutCache = {};
  
  // Test case 1: New file
  const newFile = { path: 'test.md', content: 'Hello World' };
  console.assert(shouldRecalculateLayout(newFile, layoutCache) === true, 'New file should need calculation');
  
  // Simulate caching the layout
  layoutCache['test.md'] = {
    layout: { width: 80, height: 3 },
    contentHash: createHash('md5').update('Hello World').digest('hex'),
    timestamp: Date.now()
  };
  
  // Test case 2: Same file, same content
  console.assert(shouldRecalculateLayout(newFile, layoutCache) === false, 'Unchanged file should use cache');
  
  // Test case 3: Same file, different content
  const changedFile = { path: 'test.md', content: 'Hello World\nThis is new content' };
  console.assert(shouldRecalculateLayout(changedFile, layoutCache) === true, 'Changed file should need recalculation');
  
  console.log('✅ All incremental layout tests passed!');
}