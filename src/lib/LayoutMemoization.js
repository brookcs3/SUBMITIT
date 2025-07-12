/**
 * Layout Memoization System
 * 
 * React.memo-style optimization for expensive layout calculations and re-renders
 * in terminal environments. Provides intelligent memoization, dependency tracking,
 * and selective re-computation to minimize performance impact.
 */

import { createHash } from 'crypto';
import { EventEmitter } from 'events';
import chalk from 'chalk';

export class LayoutMemoization extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      maxMemoizedComponents: 1000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      enableDependencyTracking: true,
      enablePerformanceMonitoring: true,
      enableDebugLogging: false,
      shallowComparisonDepth: 3,
      ...options
    };
    
    // Memoization storage
    this.memoCache = new Map();
    this.dependencyGraph = new Map();
    this.computationStats = new Map();
    
    // Performance tracking
    this.performanceMetrics = {
      totalMemoizations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      dependencyInvalidations: 0,
      timesSaved: 0,
      averageComputeTime: 0,
      averageCacheTime: 0
    };
    
    // Component registration
    this.memoizedComponents = new Map();
    this.componentDependencies = new Map();
    
    // Cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, 60000); // Cleanup every minute
  }
  
  // === CORE MEMOIZATION ===
  
  /**
   * Create a memoized version of a layout calculation function
   */
  memo(computeFn, options = {}) {
    const memoOptions = {
      name: options.name || computeFn.name || 'anonymous',
      dependencies: options.dependencies || [],
      ttl: options.ttl || this.options.defaultTTL,
      areEqual: options.areEqual || this.shallowEqual,
      shouldUpdate: options.shouldUpdate || null,
      maxCache: options.maxCache || 100,
      ...options
    };
    
    // Create memoized wrapper function
    const memoizedFn = this.createMemoizedFunction(computeFn, memoOptions);
    
    // Register component for tracking
    this.registerMemoizedComponent(memoOptions.name, memoOptions);
    
    // Add useful methods to memoized function
    memoizedFn.invalidate = (key) => this.invalidateComponent(memoOptions.name, key);
    memoizedFn.clearCache = () => this.clearComponentCache(memoOptions.name);
    memoizedFn.getStats = () => this.getComponentStats(memoOptions.name);
    memoizedFn.getName = () => memoOptions.name;
    
    return memoizedFn;
  }
  
  /**
   * Create the actual memoized function wrapper
   */
  createMemoizedFunction(computeFn, options) {
    return (...args) => {
      const startTime = Date.now();
      
      // Generate cache key
      const cacheKey = this.generateCacheKey(args, options);
      const fullKey = `${options.name}:${cacheKey}`;
      
      // Check cache first
      const cached = this.getCachedResult(fullKey, options);
      if (cached !== null) {
        const cacheTime = Date.now() - startTime;
        this.recordCacheHit(options.name, cacheTime);
        
        if (this.options.enableDebugLogging) {
          console.log(chalk.green(`🎯 Cache hit for ${options.name} (${cacheTime}ms)`));
        }
        
        return cached;
      }
      
      // Check if update is needed (if shouldUpdate function provided)
      if (options.shouldUpdate && !options.shouldUpdate(...args)) {
        const lastResult = this.getLastResult(fullKey);
        if (lastResult !== null) {
          this.recordCacheHit(options.name, Date.now() - startTime);
          return lastResult;
        }
      }
      
      // Compute new result
      const computeStartTime = Date.now();
      const result = computeFn(...args);
      const computeTime = Date.now() - computeStartTime;
      
      // Store result in cache
      this.storeResult(fullKey, result, args, options, computeTime);
      
      // Record performance metrics
      this.recordCacheMiss(options.name, computeTime);
      
      if (this.options.enableDebugLogging) {
        console.log(chalk.yellow(`⚡ Computed ${options.name} (${computeTime}ms)`));
      }
      
      return result;
    };
  }
  
  // === CACHE MANAGEMENT ===
  
  /**
   * Generate cache key from arguments
   */
  generateCacheKey(args, options) {
    try {
      // Handle different argument types intelligently
      const serializedArgs = args.map(arg => this.serializeArgument(arg));
      const argsString = JSON.stringify(serializedArgs);
      
      // Include dependencies in cache key if tracking enabled
      let dependencyString = '';
      if (this.options.enableDependencyTracking && options.dependencies.length > 0) {
        const depValues = options.dependencies.map(dep => 
          this.getDependencyValue(dep)
        );
        dependencyString = JSON.stringify(depValues);
      }
      
      // Generate hash for performance
      const combined = argsString + dependencyString;
      return createHash('md5').update(combined).digest('hex').substring(0, 16);
      
    } catch (error) {
      // Fallback to simple string concatenation
      console.warn(chalk.yellow('⚠️  Cache key generation fallback used'), error.message);
      return createHash('md5').update(args.toString()).digest('hex').substring(0, 16);
    }
  }
  
  /**
   * Serialize argument for cache key generation
   */
  serializeArgument(arg) {
    if (arg === null || arg === undefined) {
      return { type: 'null', value: arg };
    }
    
    if (typeof arg === 'function') {
      return { type: 'function', name: arg.name || 'anonymous' };
    }
    
    if (typeof arg === 'object') {
      // Deep serialization for objects up to specified depth
      return this.deepSerialize(arg, this.options.shallowComparisonDepth);
    }
    
    return { type: typeof arg, value: arg };
  }
  
  /**
   * Deep serialize object with depth limit
   */
  deepSerialize(obj, depth) {
    if (depth <= 0 || obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepSerialize(item, depth - 1));
    }
    
    const serialized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip functions and complex objects at depth limit
      if (typeof value === 'function') {
        serialized[key] = { type: 'function' };
      } else if (typeof value === 'object' && value !== null) {
        serialized[key] = this.deepSerialize(value, depth - 1);
      } else {
        serialized[key] = value;
      }
    }
    
    return serialized;
  }
  
  /**
   * Get cached result if valid
   */
  getCachedResult(fullKey, options) {
    const cached = this.memoCache.get(fullKey);
    
    if (!cached) {
      return null;
    }
    
    // Check TTL
    if (Date.now() - cached.timestamp > options.ttl) {
      this.memoCache.delete(fullKey);
      return null;
    }
    
    // Check custom equality if provided
    if (options.areEqual && cached.lastArgs) {
      // This would need the current args to compare, handled in main function
      return cached.result;
    }
    
    return cached.result;
  }
  
  /**
   * Store computed result in cache
   */
  storeResult(fullKey, result, args, options, computeTime) {
    // Implement LRU eviction if cache is full
    if (this.memoCache.size >= this.options.maxMemoizedComponents) {
      this.evictLRUEntries(options.maxCache);
    }
    
    const cacheEntry = {
      result,
      timestamp: Date.now(),
      lastArgs: args,
      computeTime,
      accessCount: 1,
      componentName: options.name
    };
    
    this.memoCache.set(fullKey, cacheEntry);
    
    // Update component stats
    this.updateComponentStats(options.name, computeTime, false);
    
    // Track dependencies if enabled
    if (this.options.enableDependencyTracking) {
      this.trackDependencies(fullKey, options.dependencies);
    }
  }
  
  /**
   * Get last result without timestamp check
   */
  getLastResult(fullKey) {
    const cached = this.memoCache.get(fullKey);
    return cached ? cached.result : null;
  }
  
  // === DEPENDENCY TRACKING ===
  
  /**
   * Track dependencies for invalidation
   */
  trackDependencies(cacheKey, dependencies) {
    dependencies.forEach(dep => {
      if (!this.dependencyGraph.has(dep)) {
        this.dependencyGraph.set(dep, new Set());
      }
      this.dependencyGraph.get(dep).add(cacheKey);
    });
  }
  
  /**
   * Get current value of a dependency
   */
  getDependencyValue(dependency) {
    // Handle different dependency types
    if (typeof dependency === 'string') {
      // Environment variable or global state
      return process.env[dependency] || global[dependency];
    }
    
    if (typeof dependency === 'function') {
      try {
        return dependency();
      } catch (error) {
        return null;
      }
    }
    
    if (typeof dependency === 'object' && dependency.getValue) {
      return dependency.getValue();
    }
    
    return dependency;
  }
  
  /**
   * Invalidate cache entries that depend on a specific dependency
   */
  invalidateDependency(dependency) {
    const dependentKeys = this.dependencyGraph.get(dependency);
    if (!dependentKeys) return 0;
    
    let invalidatedCount = 0;
    dependentKeys.forEach(key => {
      if (this.memoCache.delete(key)) {
        invalidatedCount++;
      }
    });
    
    // Clear dependency tracking for invalidated keys
    this.dependencyGraph.set(dependency, new Set());
    
    this.performanceMetrics.dependencyInvalidations += invalidatedCount;
    
    if (this.options.enableDebugLogging) {
      console.log(chalk.blue(`🔄 Invalidated ${invalidatedCount} cache entries for dependency: ${dependency}`));
    }
    
    this.emit('dependency-invalidated', { dependency, count: invalidatedCount });
    return invalidatedCount;
  }
  
  // === COMPARISON UTILITIES ===
  
  /**
   * Shallow equality comparison (React.memo default)
   */
  shallowEqual(prevArgs, nextArgs) {
    if (prevArgs.length !== nextArgs.length) {
      return false;
    }
    
    for (let i = 0; i < prevArgs.length; i++) {
      if (!this.shallowEqualValue(prevArgs[i], nextArgs[i])) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Shallow equality for individual values
   */
  shallowEqualValue(a, b) {
    if (Object.is(a, b)) {
      return true;
    }
    
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
      return false;
    }
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) {
      return false;
    }
    
    for (let i = 0; i < keysA.length; i++) {
      const key = keysA[i];
      if (!Object.prototype.hasOwnProperty.call(b, key) || !Object.is(a[key], b[key])) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Deep equality comparison for complex objects
   */
  deepEqual(a, b, depth = 5) {
    if (depth <= 0) return Object.is(a, b);
    
    if (Object.is(a, b)) return true;
    
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
      return false;
    }
    
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!this.deepEqual(a[key], b[key], depth - 1)) return false;
    }
    
    return true;
  }
  
  // === COMPONENT MANAGEMENT ===
  
  /**
   * Register a memoized component for tracking
   */
  registerMemoizedComponent(name, options) {
    this.memoizedComponents.set(name, {
      options,
      registeredAt: Date.now(),
      cacheKeys: new Set()
    });
    
    if (options.dependencies.length > 0) {
      this.componentDependencies.set(name, options.dependencies);
    }
    
    // Initialize stats
    this.computationStats.set(name, {
      totalCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalComputeTime: 0,
      totalCacheTime: 0,
      averageComputeTime: 0,
      averageCacheTime: 0,
      lastCalled: null
    });
  }
  
  /**
   * Invalidate specific component cache
   */
  invalidateComponent(componentName, specificKey = null) {
    if (specificKey) {
      const fullKey = `${componentName}:${specificKey}`;
      return this.memoCache.delete(fullKey) ? 1 : 0;
    }
    
    // Invalidate all keys for component
    let invalidatedCount = 0;
    for (const [key] of this.memoCache) {
      if (key.startsWith(`${componentName}:`)) {
        this.memoCache.delete(key);
        invalidatedCount++;
      }
    }
    
    if (this.options.enableDebugLogging) {
      console.log(chalk.blue(`🗑️  Invalidated ${invalidatedCount} cache entries for ${componentName}`));
    }
    
    this.emit('component-invalidated', { componentName, count: invalidatedCount });
    return invalidatedCount;
  }
  
  /**
   * Clear all cache for a component
   */
  clearComponentCache(componentName) {
    return this.invalidateComponent(componentName);
  }
  
  /**
   * Get performance statistics for a component
   */
  getComponentStats(componentName) {
    return this.computationStats.get(componentName) || null;
  }
  
  // === PERFORMANCE TRACKING ===
  
  /**
   * Record cache hit metrics
   */
  recordCacheHit(componentName, cacheTime) {
    this.performanceMetrics.cacheHits++;
    this.performanceMetrics.averageCacheTime = 
      (this.performanceMetrics.averageCacheTime * (this.performanceMetrics.cacheHits - 1) + cacheTime) / 
      this.performanceMetrics.cacheHits;
    
    // Update component-specific stats
    this.updateComponentStats(componentName, 0, true, cacheTime);
  }
  
  /**
   * Record cache miss metrics
   */
  recordCacheMiss(componentName, computeTime) {
    this.performanceMetrics.cacheMisses++;
    this.performanceMetrics.averageComputeTime = 
      (this.performanceMetrics.averageComputeTime * (this.performanceMetrics.cacheMisses - 1) + computeTime) / 
      this.performanceMetrics.cacheMisses;
    
    // Update component-specific stats
    this.updateComponentStats(componentName, computeTime, false);
  }
  
  /**
   * Update component-specific statistics
   */
  updateComponentStats(componentName, computeTime, isCacheHit, cacheTime = 0) {
    const stats = this.computationStats.get(componentName);
    if (!stats) return;
    
    stats.totalCalls++;
    stats.lastCalled = Date.now();
    
    if (isCacheHit) {
      stats.cacheHits++;
      stats.totalCacheTime += cacheTime;
      stats.averageCacheTime = stats.totalCacheTime / stats.cacheHits;
    } else {
      stats.cacheMisses++;
      stats.totalComputeTime += computeTime;
      stats.averageComputeTime = stats.totalComputeTime / stats.cacheMisses;
    }
  }
  
  // === SPECIALIZED MEMOIZATION PATTERNS ===
  
  /**
   * Memoize layout calculations with layout-specific optimizations
   */
  memoizeLayout(computeFn, options = {}) {
    return this.memo(computeFn, {
      ...options,
      name: options.name || 'layout-calculation',
      dependencies: [
        'TERM_COLUMNS',
        'TERM_ROWS',
        ...(options.dependencies || [])
      ],
      areEqual: (prevArgs, nextArgs) => {
        // Custom equality for layout arguments
        return this.layoutArgsEqual(prevArgs, nextArgs);
      },
      shouldUpdate: (items, layoutOptions) => {
        // Only update if layout structure significantly changed
        return this.shouldUpdateLayout(items, layoutOptions);
      }
    });
  }
  
  /**
   * Memoize theme calculations
   */
  memoizeTheme(computeFn, options = {}) {
    return this.memo(computeFn, {
      ...options,
      name: options.name || 'theme-calculation',
      dependencies: [
        'FORCE_COLOR',
        'NO_COLOR',
        ...(options.dependencies || [])
      ],
      ttl: 10 * 60 * 1000 // 10 minutes for themes
    });
  }
  
  /**
   * Memoize file operations
   */
  memoizeFileOperation(computeFn, options = {}) {
    return this.memo(computeFn, {
      ...options,
      name: options.name || 'file-operation',
      shouldUpdate: (filePath, ...args) => {
        // Check file modification time
        return this.shouldUpdateFile(filePath);
      },
      ttl: 2 * 60 * 1000 // 2 minutes for file operations
    });
  }
  
  // === HELPER METHODS ===
  
  /**
   * Layout-specific argument equality
   */
  layoutArgsEqual(prevArgs, nextArgs) {
    if (prevArgs.length !== nextArgs.length) return false;
    
    // Compare items array (first argument)
    const [prevItems, prevOptions] = prevArgs;
    const [nextItems, nextOptions] = nextArgs;
    
    // Quick checks first
    if (prevItems.length !== nextItems.length) return false;
    
    // Deep comparison of layout-affecting properties
    for (let i = 0; i < prevItems.length; i++) {
      if (!this.layoutItemEqual(prevItems[i], nextItems[i])) {
        return false;
      }
    }
    
    // Compare layout options
    return this.shallowEqualValue(prevOptions, nextOptions);
  }
  
  /**
   * Layout item equality (focuses on layout-affecting properties)
   */
  layoutItemEqual(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    
    // Properties that affect layout
    const layoutProps = ['width', 'height', 'flex', 'margin', 'padding', 'position', 'type'];
    
    for (const prop of layoutProps) {
      if (a[prop] !== b[prop]) return false;
    }
    
    return true;
  }
  
  /**
   * Determine if layout should update based on significance of changes
   */
  shouldUpdateLayout(items, layoutOptions) {
    // Simple heuristic: always update for now
    // Could be enhanced with more sophisticated change detection
    return true;
  }
  
  /**
   * Check if file has been modified (simplified)
   */
  shouldUpdateFile(filePath) {
    // Simplified: always update
    // In practice, would check file modification time
    return true;
  }
  
  // === CLEANUP AND MAINTENANCE ===
  
  /**
   * Evict least recently used entries
   */
  evictLRUEntries(keepCount) {
    const entries = Array.from(this.memoCache.entries());
    
    // Sort by last access time (simulated by timestamp for now)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest entries
    const toRemove = entries.length - keepCount;
    for (let i = 0; i < toRemove; i++) {
      this.memoCache.delete(entries[i][0]);
    }
  }
  
  /**
   * Periodic cleanup of expired entries
   */
  performCleanup() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.memoCache) {
      // Remove expired entries
      if (now - entry.timestamp > this.getComponentTTL(entry.componentName)) {
        this.memoCache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0 && this.options.enableDebugLogging) {
      console.log(chalk.gray(`🧹 Cleaned up ${cleanedCount} expired cache entries`));
    }
    
    this.emit('cleanup-performed', { entriesRemoved: cleanedCount });
  }
  
  /**
   * Get TTL for a component
   */
  getComponentTTL(componentName) {
    const component = this.memoizedComponents.get(componentName);
    return component?.options?.ttl || this.options.defaultTTL;
  }
  
  // === PUBLIC API ===
  
  /**
   * Get comprehensive performance statistics
   */
  getPerformanceStats() {
    const hitRate = this.performanceMetrics.cacheHits / 
      (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses);
    
    return {
      ...this.performanceMetrics,
      hitRate: isNaN(hitRate) ? 0 : hitRate,
      totalOperations: this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses,
      cacheSize: this.memoCache.size,
      registeredComponents: this.memoizedComponents.size,
      timesSaved: this.performanceMetrics.averageComputeTime * this.performanceMetrics.cacheHits
    };
  }
  
  /**
   * Get all component statistics
   */
  getAllComponentStats() {
    const stats = {};
    for (const [name, componentStats] of this.computationStats) {
      stats[name] = {
        ...componentStats,
        hitRate: componentStats.cacheHits / (componentStats.cacheHits + componentStats.cacheMisses)
      };
    }
    return stats;
  }
  
  /**
   * Print detailed memoization analysis
   */
  printMemoizationAnalysis() {
    const stats = this.getPerformanceStats();
    const componentStats = this.getAllComponentStats();
    
    console.log(chalk.blue('\n🧠 Layout Memoization Analysis'));
    console.log(chalk.blue('=============================='));
    
    console.log(`Cache Hit Rate: ${(stats.hitRate * 100).toFixed(1)}%`);
    console.log(`Total Operations: ${stats.totalOperations}`);
    console.log(`Cache Size: ${stats.cacheSize} entries`);
    console.log(`Registered Components: ${stats.registeredComponents}`);
    
    console.log(chalk.cyan('\n⚡ Performance Metrics:'));
    console.log(`Average Compute Time: ${stats.averageComputeTime.toFixed(2)}ms`);
    console.log(`Average Cache Time: ${stats.averageCacheTime.toFixed(2)}ms`);
    console.log(`Total Time Saved: ${(stats.timesSaved / 1000).toFixed(2)}s`);
    
    console.log(chalk.cyan('\n📊 Component Performance:'));
    Object.entries(componentStats).forEach(([name, compStats]) => {
      const hitRate = (compStats.hitRate * 100).toFixed(1);
      console.log(`  ${name}:`);
      console.log(`    Hit Rate: ${hitRate}%`);
      console.log(`    Avg Compute: ${compStats.averageComputeTime.toFixed(2)}ms`);
      console.log(`    Total Calls: ${compStats.totalCalls}`);
    });
    
    console.log(chalk.green('\n✅ Memoization analysis complete'));
  }
  
  /**
   * Clear all caches and reset statistics
   */
  clearAll() {
    this.memoCache.clear();
    this.dependencyGraph.clear();
    
    // Reset performance metrics
    this.performanceMetrics = {
      totalMemoizations: 0,
      cacheHits: 0,
      cacheMisses: 0,
      dependencyInvalidations: 0,
      timesSaved: 0,
      averageComputeTime: 0,
      averageCacheTime: 0
    };
    
    // Reset component stats
    for (const [name] of this.computationStats) {
      this.computationStats.set(name, {
        totalCalls: 0,
        cacheHits: 0,
        cacheMisses: 0,
        totalComputeTime: 0,
        totalCacheTime: 0,
        averageComputeTime: 0,
        averageCacheTime: 0,
        lastCalled: null
      });
    }
    
    console.log(chalk.yellow('🗑️  All memoization caches cleared'));
  }
  
  /**
   * Dispose of memoization system
   */
  dispose() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.clearAll();
    this.memoizedComponents.clear();
    this.componentDependencies.clear();
    
    console.log(chalk.green('✅ Layout memoization system disposed'));
  }
}

export default LayoutMemoization;