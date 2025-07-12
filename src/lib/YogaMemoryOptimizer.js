/**
 * Yoga Memory Optimizer
 * 
 * Advanced memory management system for Yoga layout calculations with
 * sophisticated node pooling, leak detection, and garbage collection optimization.
 */

import yoga from 'yoga-layout';
import { EventEmitter } from 'events';
import chalk from 'chalk';

export class YogaMemoryOptimizer extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      initialPoolSize: 50,
      maxPoolSize: 500,
      growthFactor: 1.5,
      shrinkThreshold: 0.3,
      enableLeakDetection: true,
      enableGCOptimization: true,
      enableMemoryProfiling: true,
      gcInterval: 30000, // 30 seconds
      memoryReportInterval: 60000, // 1 minute
      ...options
    };
    
    // Node pools for different types
    this.nodePools = {
      default: new AdvancedNodePool('default', this.options),
      container: new AdvancedNodePool('container', this.options),
      text: new AdvancedNodePool('text', this.options),
      image: new AdvancedNodePool('image', this.options)
    };
    
    // Memory tracking
    this.memoryTracker = new MemoryTracker(this.options);
    this.leakDetector = new LeakDetector(this.options);
    this.gcOptimizer = new GCOptimizer(this.options);
    
    // Statistics
    this.stats = {
      totalAllocations: 0,
      totalDeallocations: 0,
      poolHits: 0,
      poolMisses: 0,
      memoryLeaksDetected: 0,
      gcOptimizations: 0,
      peakMemoryUsage: 0,
      currentMemoryUsage: 0
    };
    
    this.setupMemoryMonitoring();
  }

  // === NODE POOL MANAGEMENT ===

  /**
   * Acquire a node from the appropriate pool
   */
  acquireNode(type = 'default', config = null) {
    const pool = this.nodePools[type] || this.nodePools.default;
    const node = pool.acquire(config);
    
    this.stats.totalAllocations++;
    
    // Track the node for leak detection
    if (this.options.enableLeakDetection) {
      this.leakDetector.trackNode(node, type);
    }
    
    // Update memory statistics
    this.updateMemoryStats();
    
    this.emit('node-acquired', { type, poolSize: pool.getActiveCount() });
    return node;
  }

  /**
   * Release a node back to its pool
   */
  releaseNode(node, type = 'default') {
    const pool = this.nodePools[type] || this.nodePools.default;
    const released = pool.release(node);
    
    if (released) {
      this.stats.totalDeallocations++;
      
      // Stop tracking for leak detection
      if (this.options.enableLeakDetection) {
        this.leakDetector.untrackNode(node);
      }
      
      this.emit('node-released', { type, poolSize: pool.getActiveCount() });
    }
    
    return released;
  }

  /**
   * Create a managed node that automatically releases on disposal
   */
  createManagedNode(type = 'default', config = null) {
    const node = this.acquireNode(type, config);
    
    return new ManagedNode(node, type, this);
  }

  /**
   * Batch acquire multiple nodes
   */
  acquireNodeBatch(count, type = 'default', config = null) {
    const nodes = [];
    const pool = this.nodePools[type] || this.nodePools.default;
    
    // Optimize pool for batch allocation
    pool.prepareBatch(count);
    
    for (let i = 0; i < count; i++) {
      nodes.push(this.acquireNode(type, config));
    }
    
    this.emit('batch-acquired', { type, count, poolSize: pool.getActiveCount() });
    return nodes;
  }

  /**
   * Batch release multiple nodes
   */
  releaseNodeBatch(nodes, type = 'default') {
    let releasedCount = 0;
    
    nodes.forEach(node => {
      if (this.releaseNode(node, type)) {
        releasedCount++;
      }
    });
    
    this.emit('batch-released', { type, count: releasedCount });
    return releasedCount;
  }

  // === MEMORY OPTIMIZATION ===

  /**
   * Optimize memory usage across all pools
   */
  optimizeMemory() {
    console.log(chalk.blue('🧹 Optimizing Yoga memory usage...'));
    
    const beforeMemory = process.memoryUsage();
    let totalFreed = 0;
    
    // Optimize each pool
    Object.entries(this.nodePools).forEach(([type, pool]) => {
      const freed = pool.optimize();
      totalFreed += freed;
      
      if (freed > 0) {
        console.log(chalk.cyan(`  ${type} pool: freed ${freed} nodes`));
      }
    });
    
    // Force garbage collection if enabled
    if (this.options.enableGCOptimization && global.gc) {
      this.gcOptimizer.optimizeGarbageCollection();
    }
    
    const afterMemory = process.memoryUsage();
    const memoryFreed = beforeMemory.heapUsed - afterMemory.heapUsed;
    
    console.log(chalk.green(`✅ Memory optimization complete: ${totalFreed} nodes freed, ${(memoryFreed / 1024 / 1024).toFixed(2)}MB released`));
    
    this.stats.gcOptimizations++;
    this.emit('memory-optimized', { nodesFreed: totalFreed, memoryFreed });
    
    return { nodesFreed: totalFreed, memoryFreed };
  }

  /**
   * Detect and fix memory leaks
   */
  detectAndFixLeaks() {
    if (!this.options.enableLeakDetection) {
      return { leaksDetected: 0, leaksFixed: 0 };
    }
    
    console.log(chalk.yellow('🕵️ Detecting memory leaks...'));
    
    const leaks = this.leakDetector.detectLeaks();
    let leaksFixed = 0;
    
    leaks.forEach(leak => {
      console.log(chalk.red(`⚠️ Memory leak detected: ${leak.type} node (age: ${leak.age}ms)`));
      
      // Attempt to fix the leak
      if (this.releaseNode(leak.node, leak.type)) {
        leaksFixed++;
        console.log(chalk.green(`✅ Fixed leak for ${leak.type} node`));
      }
    });
    
    this.stats.memoryLeaksDetected += leaks.length;
    
    if (leaks.length > 0) {
      this.emit('leaks-detected', { count: leaks.length, fixed: leaksFixed });
    }
    
    return { leaksDetected: leaks.length, leaksFixed };
  }

  /**
   * Update memory usage statistics
   */
  updateMemoryStats() {
    const memUsage = process.memoryUsage();
    this.stats.currentMemoryUsage = memUsage.heapUsed;
    
    if (memUsage.heapUsed > this.stats.peakMemoryUsage) {
      this.stats.peakMemoryUsage = memUsage.heapUsed;
    }
    
    this.memoryTracker.recordUsage(memUsage);
  }

  // === MONITORING AND REPORTING ===

  /**
   * Set up automatic memory monitoring
   */
  setupMemoryMonitoring() {
    if (this.options.enableMemoryProfiling) {
      // Regular memory optimization
      setInterval(() => {
        this.optimizeMemory();
      }, this.options.gcInterval);
      
      // Memory usage reporting
      setInterval(() => {
        this.generateMemoryReport();
      }, this.options.memoryReportInterval);
      
      // Leak detection
      if (this.options.enableLeakDetection) {
        setInterval(() => {
          this.detectAndFixLeaks();
        }, this.options.gcInterval * 2);
      }
    }
  }

  /**
   * Generate comprehensive memory report
   */
  generateMemoryReport() {
    const memUsage = process.memoryUsage();
    const poolStats = this.getPoolStatistics();
    
    const report = {
      timestamp: new Date().toISOString(),
      memoryUsage: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        rss: memUsage.rss
      },
      poolStatistics: poolStats,
      optimizerStats: this.stats,
      recommendations: this.generateMemoryRecommendations(memUsage, poolStats)
    };
    
    this.emit('memory-report', report);
    return report;
  }

  /**
   * Get statistics for all node pools
   */
  getPoolStatistics() {
    const stats = {};
    
    Object.entries(this.nodePools).forEach(([type, pool]) => {
      stats[type] = pool.getStatistics();
    });
    
    return stats;
  }

  /**
   * Generate memory optimization recommendations
   */
  generateMemoryRecommendations(memUsage, poolStats) {
    const recommendations = [];
    
    // High memory usage
    if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
      recommendations.push({
        type: 'memory-usage',
        severity: 'high',
        message: 'High memory usage detected',
        suggestion: 'Consider running memory optimization or reducing pool sizes'
      });
    }
    
    // Pool efficiency
    Object.entries(poolStats).forEach(([type, stats]) => {
      const hitRate = stats.hits / (stats.hits + stats.misses);
      
      if (hitRate < 0.7) {
        recommendations.push({
          type: 'pool-efficiency',
          severity: 'medium',
          message: `Low hit rate for ${type} pool (${(hitRate * 100).toFixed(1)}%)`,
          suggestion: 'Consider increasing initial pool size'
        });
      }
      
      if (stats.poolSize > stats.maxPoolSize * 0.9) {
        recommendations.push({
          type: 'pool-size',
          severity: 'medium',
          message: `${type} pool near capacity`,
          suggestion: 'Consider increasing max pool size or optimizing usage patterns'
        });
      }
    });
    
    return recommendations;
  }

  /**
   * Print detailed memory analysis
   */
  printMemoryAnalysis() {
    const report = this.generateMemoryReport();
    
    console.log(chalk.blue('\n🧠 Yoga Memory Analysis'));
    console.log(chalk.blue('========================'));
    
    // Memory usage
    const mem = report.memoryUsage;
    console.log(`Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Heap Total: ${(mem.heapTotal / 1024 / 1024).toFixed(2)}MB`);
    console.log(`External: ${(mem.external / 1024 / 1024).toFixed(2)}MB`);
    console.log(`RSS: ${(mem.rss / 1024 / 1024).toFixed(2)}MB`);
    
    // Pool statistics
    console.log(chalk.cyan('\n📊 Pool Statistics:'));
    Object.entries(report.poolStatistics).forEach(([type, stats]) => {
      const hitRate = (stats.hits / (stats.hits + stats.misses) * 100).toFixed(1);
      console.log(`  ${type}:`);
      console.log(`    Pool Size: ${stats.poolSize}/${stats.maxPoolSize}`);
      console.log(`    Active: ${stats.active}`);
      console.log(`    Hit Rate: ${hitRate}%`);
    });
    
    // Optimizer statistics
    console.log(chalk.cyan('\n⚡ Optimizer Statistics:'));
    console.log(`Total Allocations: ${this.stats.totalAllocations}`);
    console.log(`Total Deallocations: ${this.stats.totalDeallocations}`);
    console.log(`Memory Leaks Detected: ${this.stats.memoryLeaksDetected}`);
    console.log(`GC Optimizations: ${this.stats.gcOptimizations}`);
    console.log(`Peak Memory: ${(this.stats.peakMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
    
    // Recommendations
    if (report.recommendations.length > 0) {
      console.log(chalk.yellow('\n💡 Recommendations:'));
      report.recommendations.forEach(rec => {
        const severity = rec.severity === 'high' ? chalk.red : 
                        rec.severity === 'medium' ? chalk.yellow : chalk.blue;
        console.log(severity(`  ${rec.message}: ${rec.suggestion}`));
      });
    }
    
    console.log(chalk.green('\n✅ Memory analysis complete'));
  }

  // === CLEANUP AND DISPOSAL ===

  /**
   * Dispose of all resources and cleanup
   */
  dispose() {
    console.log(chalk.yellow('🧹 Disposing Yoga memory optimizer...'));
    
    // Stop monitoring
    clearInterval(this.gcInterval);
    clearInterval(this.memoryReportInterval);
    clearInterval(this.leakDetectionInterval);
    
    // Dispose all pools
    Object.values(this.nodePools).forEach(pool => {
      pool.dispose();
    });
    
    // Cleanup tracking
    this.leakDetector.dispose();
    this.memoryTracker.dispose();
    this.gcOptimizer.dispose();
    
    console.log(chalk.green('✅ Memory optimizer disposed'));
  }
}

// === SUPPORTING CLASSES ===

class AdvancedNodePool extends EventEmitter {
  constructor(type, options = {}) {
    super();
    this.type = type;
    this.options = options;
    
    this.pool = [];
    this.activeNodes = new Set();
    this.maxPoolSize = options.maxPoolSize || 500;
    this.shrinkThreshold = options.shrinkThreshold || 0.3;
    
    // Statistics
    this.stats = {
      hits: 0,
      misses: 0,
      created: 0,
      destroyed: 0,
      optimizations: 0
    };
    
    this.createNodes(options.initialPoolSize || 50);
  }

  createNodes(count) {
    for (let i = 0; i < count; i++) {
      const node = yoga.Node.create();
      this.pool.push({
        node,
        createdAt: Date.now(),
        lastUsed: Date.now()
      });
      this.stats.created++;
    }
  }

  acquire(config = null) {
    let nodeEntry;
    
    if (this.pool.length > 0) {
      nodeEntry = this.pool.pop();
      this.stats.hits++;
    } else {
      // Pool empty, create new node
      const node = yoga.Node.create();
      nodeEntry = {
        node,
        createdAt: Date.now(),
        lastUsed: Date.now()
      };
      this.stats.misses++;
      this.stats.created++;
    }
    
    // Apply configuration if provided
    if (config) {
      this.applyConfiguration(nodeEntry.node, config);
    }
    
    nodeEntry.lastUsed = Date.now();
    this.activeNodes.add(nodeEntry);
    
    return nodeEntry.node;
  }

  release(node) {
    // Find the node entry
    let nodeEntry = null;
    for (const entry of this.activeNodes) {
      if (entry.node === node) {
        nodeEntry = entry;
        break;
      }
    }
    
    if (!nodeEntry) {
      return false; // Node not found
    }
    
    this.activeNodes.delete(nodeEntry);
    
    // Reset node to clean state
    this.resetNode(node);
    
    // Return to pool if not at capacity
    if (this.pool.length < this.maxPoolSize) {
      nodeEntry.lastUsed = Date.now();
      this.pool.push(nodeEntry);
    } else {
      // Pool at capacity, destroy node
      this.destroyNode(nodeEntry);
    }
    
    return true;
  }

  resetNode(node) {
    try {
      // Reset all properties to default state
      node.reset();
      
      // Additional cleanup specific to node type
      switch (this.type) {
        case 'container':
          // Remove all children
          node.removeChild(node.getChild(0));
          break;
        case 'text':
          // Clear text content
          break;
        case 'image':
          // Clear image properties
          break;
      }
    } catch (error) {
      console.warn(chalk.yellow(`⚠️ Error resetting ${this.type} node:`, error.message));
    }
  }

  applyConfiguration(node, config) {
    try {
      if (config.width !== undefined) node.setWidth(config.width);
      if (config.height !== undefined) node.setHeight(config.height);
      if (config.flexDirection !== undefined) node.setFlexDirection(config.flexDirection);
      if (config.justifyContent !== undefined) node.setJustifyContent(config.justifyContent);
      if (config.alignItems !== undefined) node.setAlignItems(config.alignItems);
      // Add more configuration options as needed
    } catch (error) {
      console.warn(chalk.yellow(`⚠️ Error applying config to ${this.type} node:`, error.message));
    }
  }

  prepareBatch(count) {
    // Pre-allocate nodes for batch operation
    const needed = Math.max(0, count - this.pool.length);
    if (needed > 0) {
      this.createNodes(Math.min(needed, this.maxPoolSize - this.pool.length));
    }
  }

  optimize() {
    const sizeBefore = this.pool.length;
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    
    // Remove old unused nodes
    this.pool = this.pool.filter(entry => {
      const age = now - entry.lastUsed;
      if (age > maxAge) {
        this.destroyNode(entry);
        return false;
      }
      return true;
    });
    
    // Shrink pool if underutilized
    const utilizationRate = this.activeNodes.size / (this.pool.length + this.activeNodes.size);
    if (utilizationRate < this.shrinkThreshold && this.pool.length > 10) {
      const toRemove = Math.floor(this.pool.length * 0.3);
      for (let i = 0; i < toRemove; i++) {
        const entry = this.pool.pop();
        if (entry) {
          this.destroyNode(entry);
        }
      }
    }
    
    const removed = sizeBefore - this.pool.length;
    if (removed > 0) {
      this.stats.optimizations++;
    }
    
    return removed;
  }

  destroyNode(nodeEntry) {
    try {
      if (nodeEntry.node && typeof nodeEntry.node.free === 'function') {
        nodeEntry.node.free();
      }
      this.stats.destroyed++;
    } catch (error) {
      console.warn(chalk.yellow(`⚠️ Error destroying ${this.type} node:`, error.message));
    }
  }

  getStatistics() {
    return {
      type: this.type,
      poolSize: this.pool.length,
      active: this.activeNodes.size,
      maxPoolSize: this.maxPoolSize,
      ...this.stats
    };
  }

  getActiveCount() {
    return this.activeNodes.size;
  }

  dispose() {
    // Free all pooled nodes
    this.pool.forEach(entry => this.destroyNode(entry));
    this.pool = [];
    
    // Free all active nodes
    this.activeNodes.forEach(entry => this.destroyNode(entry));
    this.activeNodes.clear();
    
    console.log(chalk.gray(`🗑️ Disposed ${this.type} node pool`));
  }
}

class ManagedNode {
  constructor(node, type, optimizer) {
    this.node = node;
    this.type = type;
    this.optimizer = optimizer;
    this.disposed = false;
  }

  dispose() {
    if (!this.disposed) {
      this.optimizer.releaseNode(this.node, this.type);
      this.disposed = true;
    }
  }

  // Proxy all node methods
  calculateLayout(...args) {
    if (this.disposed) throw new Error('Node has been disposed');
    return this.node.calculateLayout(...args);
  }

  setWidth(width) {
    if (this.disposed) throw new Error('Node has been disposed');
    return this.node.setWidth(width);
  }

  setHeight(height) {
    if (this.disposed) throw new Error('Node has been disposed');
    return this.node.setHeight(height);
  }

  // Add more proxy methods as needed...
}

class MemoryTracker {
  constructor(options = {}) {
    this.options = options;
    this.snapshots = [];
    this.maxSnapshots = 100;
  }

  recordUsage(memUsage) {
    this.snapshots.push({
      timestamp: Date.now(),
      ...memUsage
    });

    // Keep only recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots);
    }
  }

  getMemoryTrend() {
    if (this.snapshots.length < 2) return null;

    const recent = this.snapshots.slice(-10);
    const older = this.snapshots.slice(-20, -10);

    const recentAvg = recent.reduce((sum, s) => sum + s.heapUsed, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.heapUsed, 0) / older.length;

    return {
      direction: recentAvg > olderAvg ? 'increasing' : 'decreasing',
      rate: Math.abs(recentAvg - olderAvg) / olderAvg,
      recentAverage: recentAvg,
      olderAverage: olderAvg
    };
  }

  dispose() {
    this.snapshots = [];
  }
}

class LeakDetector {
  constructor(options = {}) {
    this.options = options;
    this.trackedNodes = new Map();
    this.maxAge = 10 * 60 * 1000; // 10 minutes
  }

  trackNode(node, type) {
    this.trackedNodes.set(node, {
      type,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    });
  }

  untrackNode(node) {
    this.trackedNodes.delete(node);
  }

  detectLeaks() {
    const now = Date.now();
    const leaks = [];

    this.trackedNodes.forEach((info, node) => {
      const age = now - info.lastAccessed;
      if (age > this.maxAge) {
        leaks.push({
          node,
          type: info.type,
          age,
          createdAt: info.createdAt
        });
      }
    });

    return leaks;
  }

  dispose() {
    this.trackedNodes.clear();
  }
}

class GCOptimizer {
  constructor(options = {}) {
    this.options = options;
    this.lastGC = 0;
  }

  optimizeGarbageCollection() {
    const now = Date.now();
    
    // Don't run GC too frequently
    if (now - this.lastGC < 5000) return;

    if (global.gc) {
      console.log(chalk.gray('🗑️ Running garbage collection...'));
      global.gc();
      this.lastGC = now;
    }
  }

  dispose() {
    // Nothing to cleanup
  }
}

export default YogaMemoryOptimizer;