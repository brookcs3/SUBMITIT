/**
 * Ninja-Inspired Incremental Build Engine
 * 
 * Applies Ninja's incremental build principles to Submitit's file processing,
 * layout calculations, and terminal rendering for maximum performance.
 */

import { createHash } from 'crypto';
import { stat } from 'fs/promises';
import { EventEmitter } from 'events';

export class NinjaIncrementalEngine extends EventEmitter {
  constructor() {
    super();
    
    // Ninja-style dependency tracking
    this.dependencyGraph = new Map(); // target -> [dependencies]
    this.buildTargets = new Map();    // target -> { hash, timestamp, result }
    this.fileHashes = new Map();      // file -> hash
    this.layoutCache = new Map();     // layoutId -> yogaNode
    
    // Performance metrics (Ninja-style timing)
    this.buildTimes = new Map();
    this.totalBuilds = 0;
    this.incrementalBuilds = 0;
  }

  // === CORE NINJA CONCEPTS ===

  /**
   * Add dependency relationship (Ninja-style)
   * target depends on source
   */
  addDependency(target, source) {
    if (!this.dependencyGraph.has(target)) {
      this.dependencyGraph.set(target, new Set());
    }
    this.dependencyGraph.get(target).add(source);
  }

  /**
   * Calculate file hash (Ninja uses hashes for change detection)
   */
  async calculateFileHash(filePath) {
    try {
      const stats = await stat(filePath);
      const hash = createHash('md5')
        .update(filePath)
        .update(stats.mtime.toString())
        .update(stats.size.toString())
        .digest('hex');
      
      this.fileHashes.set(filePath, hash);
      return hash;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if target needs rebuilding (core Ninja logic)
   */
  async needsRebuild(target) {
    const buildInfo = this.buildTargets.get(target);
    
    // Never built before
    if (!buildInfo) {
      return true;
    }

    // Check if any dependencies changed
    const dependencies = this.dependencyGraph.get(target) || new Set();
    
    for (const dep of dependencies) {
      const currentHash = await this.calculateFileHash(dep);
      const cachedHash = this.fileHashes.get(dep);
      
      if (currentHash !== cachedHash) {
        return true;
      }
      
      // Recursively check if dependency needs rebuild
      if (await this.needsRebuild(dep)) {
        return true;
      }
    }

    return false;
  }

  // === YOGA LAYOUT OPTIMIZATION ===

  /**
   * Incremental Yoga layout calculation
   * Only recalculates layouts for changed files
   */
  async calculateIncrementalLayout(files, yogaConfig) {
    const layoutResults = new Map();
    const changedFiles = [];

    console.log('[ninja] Checking layout dependencies...');

    // 1. Detect which files need layout recalculation
    for (const file of files) {
      const layoutTarget = `layout:${file.path}`;
      
      // Add dependencies
      this.addDependency(layoutTarget, file.path);
      this.addDependency(layoutTarget, 'yoga-config');
      this.addDependency(layoutTarget, 'terminal-dimensions');

      if (await this.needsRebuild(layoutTarget)) {
        changedFiles.push(file);
        console.log(`[ninja] Layout rebuild needed: ${file.path}`);
      } else {
        // Use cached layout
        const cached = this.layoutCache.get(layoutTarget);
        if (cached) {
          layoutResults.set(file.path, cached);
          console.log(`[ninja] Using cached layout: ${file.path}`);
        }
      }
    }

    // 2. Rebuild only changed layouts
    if (changedFiles.length > 0) {
      const startTime = Date.now();
      
      for (const file of changedFiles) {
        const layoutTarget = `layout:${file.path}`;
        
        // Actual Yoga layout calculation
        const yogaNode = await this.calculateSingleLayout(file, yogaConfig);
        
        // Cache the result
        this.layoutCache.set(layoutTarget, yogaNode);
        layoutResults.set(file.path, yogaNode);
        
        // Update build info
        this.buildTargets.set(layoutTarget, {
          hash: await this.calculateFileHash(file.path),
          timestamp: Date.now(),
          result: yogaNode
        });
      }
      
      const buildTime = Date.now() - startTime;
      console.log(`[ninja] Layout rebuild: ${changedFiles.length} files in ${buildTime}ms`);
    }

    return layoutResults;
  }

  /**
   * Single file Yoga layout calculation
   */
  async calculateSingleLayout(file, yogaConfig) {
    const Yoga = await import('yoga-layout');
    
    const node = Yoga.Node.create(yogaConfig);
    
    // Configure node based on file properties
    node.setWidth(80); // Terminal width
    node.setHeight('auto');
    node.setPadding(Yoga.EDGE_ALL, 1);
    
    // Set content-based dimensions
    if (file.content) {
      const lines = file.content.split('\n');
      node.setHeight(lines.length + 2); // Content + padding
    }
    
    node.calculateLayout();
    return node;
  }

  // === INK RENDERING OPTIMIZATION ===

  /**
   * Selective Ink component re-rendering
   * Only updates components that actually changed
   */
  trackInkComponentChanges(componentId, props) {
    const propHash = this.hashObject(props);
    const lastHash = this.buildTargets.get(`ink:${componentId}`)?.hash;
    
    if (propHash !== lastHash) {
      this.buildTargets.set(`ink:${componentId}`, {
        hash: propHash,
        timestamp: Date.now(),
        needsUpdate: true
      });
      return true; // Component needs re-render
    }
    
    return false; // Component can skip re-render
  }

  /**
   * Ink-optimized component wrapper (like React.memo for terminal)
   */
  createMemoizedComponent(componentId, renderFunction) {
    return (props) => {
      const needsUpdate = this.trackInkComponentChanges(componentId, props);
      
      if (!needsUpdate) {
        // Return cached render
        const cached = this.buildTargets.get(`ink:${componentId}`)?.result;
        if (cached) {
          return cached;
        }
      }
      
      // Re-render component
      const result = renderFunction(props);
      
      // Cache the result
      this.buildTargets.set(`ink:${componentId}`, {
        ...this.buildTargets.get(`ink:${componentId}`),
        result,
        needsUpdate: false
      });
      
      return result;
    };
  }

  // === FILE PROCESSING OPTIMIZATION ===

  /**
   * Ninja-style file dependency tracking
   */
  async processFilesIncremental(files) {
    const results = new Map();
    const processingQueue = [];

    console.log('[ninja] Analyzing file dependencies...');

    // 1. Build dependency graph and detect changes
    for (const file of files) {
      const target = `process:${file.path}`;
      
      // Add file dependencies
      this.addDependency(target, file.path);
      
      // Add dependencies on included/imported files
      const dependencies = await this.detectFileDependencies(file);
      for (const dep of dependencies) {
        this.addDependency(target, dep);
      }

      if (await this.needsRebuild(target)) {
        processingQueue.push({ file, target });
        console.log(`[ninja] File rebuild needed: ${file.path}`);
      } else {
        // Use cached result
        const cached = this.buildTargets.get(target)?.result;
        if (cached) {
          results.set(file.path, cached);
          console.log(`[ninja] Using cached processing: ${file.path}`);
        }
      }
    }

    // 2. Process files in dependency order
    if (processingQueue.length > 0) {
      const startTime = Date.now();
      const sortedQueue = this.topologicalSort(processingQueue);
      
      for (const { file, target } of sortedQueue) {
        const result = await this.processSingleFile(file);
        
        results.set(file.path, result);
        
        // Update build cache
        this.buildTargets.set(target, {
          hash: await this.calculateFileHash(file.path),
          timestamp: Date.now(),
          result
        });
      }
      
      const buildTime = Date.now() - startTime;
      console.log(`[ninja] File processing: ${processingQueue.length} files in ${buildTime}ms`);
      this.incrementalBuilds++;
    }

    this.totalBuilds++;
    return results;
  }

  /**
   * Detect file dependencies (imports, includes, etc.)
   */
  async detectFileDependencies(file) {
    const dependencies = [];
    
    if (file.content) {
      // Look for import/require statements
      const importMatches = file.content.match(/(?:import|require)\s*\(['"`]([^'"`]+)['"`]\)/g);
      if (importMatches) {
        for (const match of importMatches) {
          const depPath = match.match(/['"`]([^'"`]+)['"`]/)?.[1];
          if (depPath) {
            dependencies.push(depPath);
          }
        }
      }
      
      // Look for relative file references
      const relativeMatches = file.content.match(/\.\//g);
      if (relativeMatches) {
        // Add parent directory as dependency
        dependencies.push(file.path.split('/').slice(0, -1).join('/'));
      }
    }
    
    return dependencies;
  }

  /**
   * Process single file
   */
  async processSingleFile(file) {
    // Simulate file processing
    return {
      path: file.path,
      processed: true,
      timestamp: Date.now(),
      content: file.content,
      metadata: {
        size: file.content?.length || 0,
        lines: file.content?.split('\n').length || 0
      }
    };
  }

  // === UTILITY METHODS ===

  /**
   * Topological sort for dependency-ordered processing
   */
  topologicalSort(queue) {
    // Simple implementation - in production would use proper topological sort
    return queue.sort((a, b) => {
      const aDeps = this.dependencyGraph.get(a.target)?.size || 0;
      const bDeps = this.dependencyGraph.get(b.target)?.size || 0;
      return aDeps - bDeps;
    });
  }

  /**
   * Hash object for change detection
   */
  hashObject(obj) {
    return createHash('md5')
      .update(JSON.stringify(obj, Object.keys(obj).sort()))
      .digest('hex');
  }

  /**
   * Get performance metrics (Ninja-style)
   */
  getPerformanceMetrics() {
    return {
      totalBuilds: this.totalBuilds,
      incrementalBuilds: this.incrementalBuilds,
      incrementalRatio: this.totalBuilds > 0 ? this.incrementalBuilds / this.totalBuilds : 0,
      cacheHits: this.buildTargets.size,
      dependencyCount: this.dependencyGraph.size
    };
  }

  /**
   * Clear caches (for testing/debugging)
   */
  clearCaches() {
    this.buildTargets.clear();
    this.layoutCache.clear();
    this.fileHashes.clear();
    console.log('[ninja] Caches cleared');
  }

  /**
   * Build project with incremental optimization
   */
  async buildProject(files) {
    const startTime = Date.now();
    
    // Process files incrementally
    const fileResults = await this.processFilesIncremental(files);
    
    // Calculate layouts incrementally
    const layoutResults = await this.calculateIncrementalLayout(files, {});
    
    const buildTime = Date.now() - startTime;
    
    return {
      files: fileResults,
      layouts: layoutResults,
      buildTime,
      metrics: this.getPerformanceMetrics()
    };
  }
}

export default NinjaIncrementalEngine;