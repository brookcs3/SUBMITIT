/**
 * Smart File Handler - Ninja-style caching and incremental changes
 */
import { readFile, writeFile, stat, mkdir, readdir } from 'fs/promises';
import { join, dirname, extname, basename } from 'path';
import { createHash } from 'crypto';
import { globalErrorHandler } from '../core/ErrorHandler.js';

export class SmartFileHandler {
  constructor(cacheDir = '.submitit/cache') {
    this.cacheDir = cacheDir;
    this.fileCache = new Map(); // filePath -> cacheInfo
    this.dependencyGraph = new Map(); // filePath -> Set<dependencies>
    this.reverseGraph = new Map(); // filePath -> Set<dependents>
    this.processingQueue = [];
    this.metrics = {
      filesProcessed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalProcessingTime: 0
    };
  }

  /**
   * Initialize cache directory
   */
  async initialize() {
    try {
      await mkdir(this.cacheDir, { recursive: true });
      await this.loadCacheIndex();
    } catch (error) {
      throw globalErrorHandler.createError(
        'CACHE_INIT_ERROR',
        `Failed to initialize cache: ${error.message}`,
        { cacheDir: this.cacheDir }
      );
    }
  }

  /**
   * Load cache index from disk
   */
  async loadCacheIndex() {
    try {
      const indexPath = join(this.cacheDir, 'index.json');
      const indexData = await readFile(indexPath, 'utf8');
      const index = JSON.parse(indexData);
      
      for (const [filePath, cacheInfo] of Object.entries(index.files || {})) {
        this.fileCache.set(filePath, cacheInfo);
      }
      
      for (const [filePath, deps] of Object.entries(index.dependencies || {})) {
        this.dependencyGraph.set(filePath, new Set(deps));
      }
      
      this.buildReverseGraph();
      
    } catch (error) {
      // Cache doesn't exist yet, start fresh
      this.fileCache.clear();
      this.dependencyGraph.clear();
      this.reverseGraph.clear();
    }
  }

  /**
   * Save cache index to disk
   */
  async saveCacheIndex() {
    try {
      const indexPath = join(this.cacheDir, 'index.json');
      
      const index = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        files: Object.fromEntries(this.fileCache),
        dependencies: Object.fromEntries(
          Array.from(this.dependencyGraph.entries()).map(([path, deps]) => [
            path,
            Array.from(deps)
          ])
        ),
        metrics: this.metrics
      };
      
      await writeFile(indexPath, JSON.stringify(index, null, 2), 'utf8');
    } catch (error) {
      globalErrorHandler.handle(error, 'cache-save');
    }
  }

  /**
   * Build reverse dependency graph
   */
  buildReverseGraph() {
    this.reverseGraph.clear();
    
    for (const [filePath, dependencies] of this.dependencyGraph) {
      for (const dep of dependencies) {
        if (!this.reverseGraph.has(dep)) {
          this.reverseGraph.set(dep, new Set());
        }
        this.reverseGraph.get(dep).add(filePath);
      }
    }
  }

  /**
   * Calculate file hash for change detection
   */
  async calculateFileHash(filePath) {
    try {
      const [content, stats] = await Promise.all([
        readFile(filePath, 'utf8'),
        stat(filePath)
      ]);
      
      const contentHash = createHash('md5').update(content).digest('hex');
      const metaHash = createHash('md5')
        .update(`${stats.mtime.getTime()}-${stats.size}`)
        .digest('hex');
      
      return {
        contentHash,
        metaHash,
        size: stats.size,
        mtime: stats.mtime.getTime()
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if file needs processing
   */
  async needsProcessing(filePath) {
    const cached = this.fileCache.get(filePath);
    if (!cached) {
      return { needed: true, reason: 'new-file' };
    }
    
    const current = await this.calculateFileHash(filePath);
    if (!current) {
      return { needed: true, reason: 'file-deleted' };
    }
    
    if (cached.contentHash !== current.contentHash) {
      return { needed: true, reason: 'content-changed' };
    }
    
    if (cached.metaHash !== current.metaHash) {
      return { needed: true, reason: 'metadata-changed' };
    }
    
    // Check if any dependencies changed
    const dependencies = this.dependencyGraph.get(filePath) || new Set();
    for (const dep of dependencies) {
      const depCheck = await this.needsProcessing(dep);
      if (depCheck.needed) {
        return { needed: true, reason: `dependency-changed:${dep}` };
      }
    }
    
    return { needed: false, reason: 'up-to-date' };
  }

  /**
   * Process file with smart caching
   */
  async processFile(filePath, processor, options = {}) {
    const startTime = Date.now();
    
    try {
      // Check if processing is needed
      const needsProcessingResult = await this.needsProcessing(filePath);
      
      if (!needsProcessingResult.needed && !options.force) {
        this.metrics.cacheHits++;
        
        // Return cached result
        const cached = this.fileCache.get(filePath);
        return {
          filePath,
          result: cached.result,
          fromCache: true,
          reason: needsProcessingResult.reason,
          processingTime: 0
        };
      }
      
      this.metrics.cacheMisses++;
      this.metrics.filesProcessed++;
      
      // Process the file
      const content = await readFile(filePath, 'utf8');
      const result = await processor(content, filePath, options);
      
      // Update cache
      const hashInfo = await this.calculateFileHash(filePath);
      this.fileCache.set(filePath, {
        ...hashInfo,
        result,
        processedAt: Date.now(),
        processor: processor.name || 'anonymous'
      });
      
      // Extract and update dependencies
      const dependencies = this.extractDependencies(content, filePath);
      this.dependencyGraph.set(filePath, dependencies);
      this.buildReverseGraph();
      
      const processingTime = Date.now() - startTime;
      this.metrics.totalProcessingTime += processingTime;
      
      // Save cache periodically
      if (this.metrics.filesProcessed % 10 === 0) {
        await this.saveCacheIndex();
      }
      
      return {
        filePath,
        result,
        fromCache: false,
        reason: needsProcessingResult.reason,
        processingTime,
        dependencies: Array.from(dependencies)
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.metrics.totalProcessingTime += processingTime;
      
      throw globalErrorHandler.createError(
        'FILE_PROCESSING_ERROR',
        `Failed to process file: ${error.message}`,
        { filePath, processingTime }
      );
    }
  }

  /**
   * Process multiple files efficiently
   */
  async processFiles(filePaths, processor, options = {}) {
    const results = [];
    const errors = [];
    
    // Sort files by dependency order (topological sort)
    const sortedPaths = this.topologicalSort(filePaths);
    
    for (const filePath of sortedPaths) {
      try {
        const result = await this.processFile(filePath, processor, options);
        results.push(result);
        
        // Invalidate dependents if file was actually processed
        if (!result.fromCache) {
          await this.invalidateDependents(filePath);
        }
        
      } catch (error) {
        errors.push({ filePath, error: error.message });
        
        if (!options.continueOnError) {
          break;
        }
      }
    }
    
    // Save final cache state
    await this.saveCacheIndex();
    
    return {
      results,
      errors,
      metrics: this.getMetrics()
    };
  }

  /**
   * Extract dependencies from file content
   */
  extractDependencies(content, filePath) {
    const dependencies = new Set();
    const fileDir = dirname(filePath);
    
    // Markdown image references
    const imageRefs = content.match(/!\[.*?\]\((?!https?:\/\/)(.*?)\)/g);
    if (imageRefs) {
      imageRefs.forEach(ref => {
        const match = ref.match(/!\[.*?\]\((.*?)\)/);
        if (match) {
          const depPath = this.resolvePath(match[1], fileDir);
          if (depPath) dependencies.add(depPath);
        }
      });
    }
    
    // Link references
    const linkRefs = content.match(/\[.*?\]\((?!https?:\/\/)(.*?)\)/g);
    if (linkRefs) {
      linkRefs.forEach(ref => {
        const match = ref.match(/\[.*?\]\((.*?)\)/);
        if (match) {
          const depPath = this.resolvePath(match[1], fileDir);
          if (depPath) dependencies.add(depPath);
        }
      });
    }
    
    // CSS imports
    const cssImports = content.match(/@import\s+["']([^"']+)["']/g);
    if (cssImports) {
      cssImports.forEach(imp => {
        const match = imp.match(/@import\s+["']([^"']+)["']/);
        if (match) {
          const depPath = this.resolvePath(match[1], fileDir);
          if (depPath) dependencies.add(depPath);
        }
      });
    }
    
    // JavaScript imports/requires
    const jsImports = content.match(/(?:import|require)\s*\(\s*["']([^"']+)["']\s*\)/g);
    if (jsImports) {
      jsImports.forEach(imp => {
        const match = imp.match(/["']([^"']+)["']/);
        if (match && !match[1].startsWith('node_modules') && !match[1].startsWith('http')) {
          const depPath = this.resolvePath(match[1], fileDir);
          if (depPath) dependencies.add(depPath);
        }
      });
    }
    
    return dependencies;
  }

  /**
   * Resolve relative path
   */
  resolvePath(relativePath, baseDir) {
    if (relativePath.startsWith('/')) {
      return relativePath;
    }
    
    try {
      return join(baseDir, relativePath);
    } catch (error) {
      return null;
    }
  }

  /**
   * Invalidate dependents when a file changes
   */
  async invalidateDependents(filePath) {
    const dependents = this.reverseGraph.get(filePath) || new Set();
    
    for (const dependent of dependents) {
      this.fileCache.delete(dependent);
      
      // Recursively invalidate dependents of dependents
      await this.invalidateDependents(dependent);
    }
  }

  /**
   * Topological sort for processing order
   */
  topologicalSort(filePaths) {
    const visited = new Set();
    const visiting = new Set();
    const result = [];
    
    const visit = (filePath) => {
      if (visiting.has(filePath)) {
        // Circular dependency detected, skip
        return;
      }
      
      if (visited.has(filePath)) {
        return;
      }
      
      visiting.add(filePath);
      
      // Visit dependencies first
      const dependencies = this.dependencyGraph.get(filePath) || new Set();
      for (const dep of dependencies) {
        if (filePaths.includes(dep)) {
          visit(dep);
        }
      }
      
      visiting.delete(filePath);
      visited.add(filePath);
      result.push(filePath);
    };
    
    for (const filePath of filePaths) {
      visit(filePath);
    }
    
    return result;
  }

  /**
   * Clear cache for specific files or patterns
   */
  async clearCache(patterns = []) {
    if (patterns.length === 0) {
      // Clear all cache
      this.fileCache.clear();
      this.dependencyGraph.clear();
      this.reverseGraph.clear();
    } else {
      // Clear specific patterns
      for (const pattern of patterns) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        
        for (const filePath of this.fileCache.keys()) {
          if (regex.test(filePath)) {
            this.fileCache.delete(filePath);
            this.dependencyGraph.delete(filePath);
          }
        }
      }
      
      this.buildReverseGraph();
    }
    
    await this.saveCacheIndex();
  }

  /**
   * Get cache metrics
   */
  getMetrics() {
    const cacheHitRatio = this.metrics.filesProcessed > 0 
      ? this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)
      : 0;
    
    return {
      ...this.metrics,
      cacheHitRatio,
      cacheSize: this.fileCache.size,
      dependencyCount: this.dependencyGraph.size,
      averageProcessingTime: this.metrics.filesProcessed > 0 
        ? this.metrics.totalProcessingTime / this.metrics.filesProcessed 
        : 0
    };
  }

  /**
   * Debug cache state
   */
  debugCache() {
    console.log('📦 Smart File Handler Cache Debug:');
    console.log(`  Cached files: ${this.fileCache.size}`);
    console.log(`  Dependencies: ${this.dependencyGraph.size}`);
    console.log(`  Cache hit ratio: ${(this.getMetrics().cacheHitRatio * 100).toFixed(1)}%`);
    
    console.log('\n📋 Dependencies:');
    for (const [file, deps] of this.dependencyGraph) {
      if (deps.size > 0) {
        console.log(`  ${file} -> [${Array.from(deps).join(', ')}]`);
      }
    }
  }
}

export default SmartFileHandler;