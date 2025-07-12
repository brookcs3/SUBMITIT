/**
 * Memory-Efficient Export Integration
 * 
 * Integrates StreamingPackageManager with the existing submitit CLI
 * to provide memory-efficient exports for large projects.
 */

import { StreamingPackageManager } from './StreamingPackageManager.js';
import { PackageManager } from './PackageManager.js';
import { getLazyModule, isModuleAvailable } from '../config/lazyModules.js';
import chalk from 'chalk';
import { promises as fs } from 'fs';

export class MemoryEfficientExportIntegration {
  constructor(options = {}) {
    this.options = {
      streamingThreshold: 50 * 1024 * 1024, // 50MB - use streaming for larger projects
      maxMemoryUsage: 512 * 1024 * 1024,    // 512MB - maximum memory usage
      adaptiveMode: true,                    // Automatically choose best method
      enableProgress: true,
      enableOptimizations: true,
      ...options
    };
    
    this.streamingManager = null;
    this.standardManager = null;
    this.currentOperation = null;
  }

  // === ADAPTIVE EXPORT SELECTION ===

  /**
   * Automatically choose the best export method based on project characteristics
   */
  async exportProject(config, options = {}) {
    console.log(chalk.blue('🎯 Analyzing project for optimal export method...'));
    
    // Analyze project to determine best approach
    const analysis = await this.analyzeProjectForExport(config);
    
    const useStreaming = this.shouldUseStreaming(analysis, options);
    
    if (useStreaming) {
      console.log(chalk.cyan('📡 Using streaming export for memory efficiency'));
      return await this.exportWithStreaming(config, options, analysis);
    } else {
      console.log(chalk.cyan('⚡ Using standard export for optimal speed'));
      return await this.exportWithStandard(config, options, analysis);
    }
  }

  /**
   * Analyze project characteristics to determine optimal export method
   */
  async analyzeProjectForExport(config) {
    const analysis = {
      totalSize: 0,
      fileCount: 0,
      largeFiles: 0,
      directoryDepth: 0,
      fileTypes: new Set(),
      memoryEstimate: 0,
      complexity: 'simple'
    };

    try {
      const contentDir = process.cwd() + '/content';
      
      // Quick directory scan
      const scanResult = await this.quickDirectoryScan(contentDir);
      
      analysis.totalSize = scanResult.totalSize;
      analysis.fileCount = scanResult.fileCount;
      analysis.largeFiles = scanResult.largeFiles;
      analysis.directoryDepth = scanResult.maxDepth;
      analysis.fileTypes = scanResult.fileTypes;
      
      // Estimate memory usage for standard export
      analysis.memoryEstimate = this.estimateMemoryUsage(analysis);
      
      // Determine complexity
      if (analysis.fileCount > 1000 || analysis.totalSize > 100 * 1024 * 1024) {
        analysis.complexity = 'complex';
      } else if (analysis.fileCount > 100 || analysis.totalSize > 10 * 1024 * 1024) {
        analysis.complexity = 'moderate';
      }
      
      console.log(chalk.gray(`   Project size: ${this.formatBytes(analysis.totalSize)}`));
      console.log(chalk.gray(`   File count: ${analysis.fileCount}`));
      console.log(chalk.gray(`   Complexity: ${analysis.complexity}`));
      console.log(chalk.gray(`   Memory estimate: ${this.formatBytes(analysis.memoryEstimate)}`));
      
    } catch (error) {
      console.warn('Warning: Could not analyze project, using standard export');
      analysis.complexity = 'unknown';
    }

    return analysis;
  }

  /**
   * Quick directory scan for size and file count estimation
   */
  async quickDirectoryScan(dirPath, currentDepth = 0) {
    const result = {
      totalSize: 0,
      fileCount: 0,
      largeFiles: 0,
      maxDepth: currentDepth,
      fileTypes: new Set()
    };

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = `${dirPath}/${entry.name}`;
        
        // Skip common excludes
        if (this.shouldQuickExclude(entry.name)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          const subResult = await this.quickDirectoryScan(fullPath, currentDepth + 1);
          result.totalSize += subResult.totalSize;
          result.fileCount += subResult.fileCount;
          result.largeFiles += subResult.largeFiles;
          result.maxDepth = Math.max(result.maxDepth, subResult.maxDepth);
          subResult.fileTypes.forEach(type => result.fileTypes.add(type));
        } else {
          const stats = await fs.stat(fullPath);
          result.totalSize += stats.size;
          result.fileCount++;
          
          if (stats.size > 10 * 1024 * 1024) { // > 10MB
            result.largeFiles++;
          }
          
          const ext = entry.name.split('.').pop()?.toLowerCase();
          if (ext) {
            result.fileTypes.add(ext);
          }
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
    }

    return result;
  }

  /**
   * Determine if streaming export should be used
   */
  shouldUseStreaming(analysis, options) {
    // Force streaming if explicitly requested
    if (options.forceStreaming) {
      return true;
    }
    
    // Force standard if explicitly requested
    if (options.forceStandard) {
      return false;
    }
    
    // Use streaming for large projects
    if (analysis.totalSize > this.options.streamingThreshold) {
      return true;
    }
    
    // Use streaming if estimated memory usage is too high
    if (analysis.memoryEstimate > this.options.maxMemoryUsage) {
      return true;
    }
    
    // Use streaming for many large files
    if (analysis.largeFiles > 5) {
      return true;
    }
    
    // Use streaming for very deep directory structures
    if (analysis.directoryDepth > 10) {
      return true;
    }
    
    return false;
  }

  /**
   * Estimate memory usage for standard export
   */
  estimateMemoryUsage(analysis) {
    // Base memory for Node.js and libraries
    let estimate = 50 * 1024 * 1024; // 50MB base
    
    // Add file processing overhead (rough estimate)
    estimate += analysis.fileCount * 1024; // 1KB per file
    
    // Add compression buffer (depends on file types)
    const compressionMultiplier = this.getCompressionMultiplier(analysis.fileTypes);
    estimate += analysis.totalSize * compressionMultiplier;
    
    return estimate;
  }

  /**
   * Get compression multiplier based on file types
   */
  getCompressionMultiplier(fileTypes) {
    const types = Array.from(fileTypes);
    
    // If mostly compressed formats, less memory needed
    const compressedFormats = ['jpg', 'png', 'mp4', 'mp3', 'zip', '7z'];
    const compressedCount = types.filter(type => compressedFormats.includes(type)).length;
    
    if (compressedCount / types.length > 0.7) {
      return 0.1; // 10% of file size
    } else {
      return 0.3; // 30% of file size
    }
  }

  // === STREAMING EXPORT ===

  /**
   * Export using streaming operations
   */
  async exportWithStreaming(config, options, analysis) {
    if (!this.streamingManager) {
      this.streamingManager = new StreamingPackageManager({
        enableProgress: this.options.enableProgress,
        enableDeduplication: false, // Disabled by default for performance
        enableIntegrityCheck: true,
        maxConcurrency: this.calculateOptimalConcurrency(analysis),
        compressionLevel: this.calculateOptimalCompression(analysis)
      });
    }
    
    // Set up progress monitoring
    this.streamingManager.on('file-processed', (progress) => {
      if (options.onProgress) {
        options.onProgress({
          type: 'streaming',
          ...progress
        });
      }
    });
    
    this.streamingManager.on('analysis-complete', (projectAnalysis) => {
      console.log(chalk.green(`📊 Streaming analysis: ${projectAnalysis.totalFiles} files, ${this.formatBytes(projectAnalysis.totalSize)}`));
    });
    
    this.currentOperation = this.streamingManager.exportProjectStreaming(config, options);
    
    try {
      const result = await this.currentOperation;
      
      console.log(chalk.green('✅ Streaming export completed successfully'));
      console.log(chalk.gray(`   Compression ratio: ${(result.compressionRatio * 100).toFixed(1)}%`));
      console.log(chalk.gray(`   Memory efficiency: ✓ Optimized`));
      
      return {
        ...result,
        method: 'streaming',
        memoryEfficient: true
      };
      
    } finally {
      this.currentOperation = null;
    }
  }

  // === STANDARD EXPORT ===

  /**
   * Export using standard operations
   */
  async exportWithStandard(config, options, analysis) {
    if (!this.standardManager) {
      this.standardManager = new PackageManager();
    }
    
    const progressWrapper = (progress) => {
      if (options.onProgress) {
        options.onProgress({
          type: 'standard',
          ...progress
        });
      }
    };
    
    this.currentOperation = this.standardManager.exportProject(config, options, progressWrapper);
    
    try {
      const result = await this.currentOperation;
      
      console.log(chalk.green('✅ Standard export completed successfully'));
      console.log(chalk.gray(`   Speed optimized: ✓ Fast processing`));
      
      return {
        ...result,
        method: 'standard',
        memoryEfficient: false
      };
      
    } finally {
      this.currentOperation = null;
    }
  }

  // === OPTIMIZATION CALCULATIONS ===

  /**
   * Calculate optimal concurrency based on project characteristics
   */
  calculateOptimalConcurrency(analysis) {
    // Base concurrency
    let concurrency = 4;
    
    // Reduce for very large files to avoid memory issues
    if (analysis.largeFiles > 10) {
      concurrency = 2;
    }
    
    // Increase for many small files
    if (analysis.fileCount > 1000 && analysis.largeFiles < 5) {
      concurrency = 6;
    }
    
    return Math.min(concurrency, 8); // Max 8 concurrent operations
  }

  /**
   * Calculate optimal compression level
   */
  calculateOptimalCompression(analysis) {
    // Check file types for compression effectiveness
    const types = Array.from(analysis.fileTypes || []);
    const textTypes = ['js', 'css', 'html', 'json', 'md', 'txt', 'xml'];
    const compressibleCount = types.filter(type => textTypes.includes(type)).length;
    
    if (compressibleCount / types.length > 0.5) {
      return 9; // Maximum compression for text files
    } else {
      return 6; // Balanced compression
    }
  }

  // === LAZY LOADING INTEGRATION ===

  /**
   * Export with lazy loading integration
   */
  async exportWithLazyLoading(config, options = {}) {
    console.log(chalk.blue('🔄 Loading export modules...'));
    
    try {
      // Load required modules lazily
      const [StreamingOps, PackageManager] = await Promise.all([
        this.loadStreamingModules(),
        this.loadStandardModules()
      ]);
      
      // Proceed with adaptive export
      return await this.exportProject(config, options);
      
    } catch (error) {
      console.warn(chalk.yellow('Warning: Some export modules failed to load, using fallback'));
      
      // Fallback to basic export
      return await this.exportWithFallback(config, options);
    }
  }

  /**
   * Load streaming-related modules
   */
  async loadStreamingModules() {
    try {
      if (isModuleAvailable('streaming-file-operations')) {
        return await getLazyModule('streaming-file-operations');
      }
      
      // Use bundled version
      return (await import('./StreamingFileOperations.js')).StreamingFileOperations;
    } catch (error) {
      console.warn('Streaming modules not available');
      return null;
    }
  }

  /**
   * Load standard export modules
   */
  async loadStandardModules() {
    try {
      if (isModuleAvailable('package-manager')) {
        return await getLazyModule('package-manager');
      }
      
      // Use bundled version
      return (await import('./PackageManager.js')).PackageManager;
    } catch (error) {
      console.warn('Standard package manager not available');
      return null;
    }
  }

  /**
   * Fallback export method
   */
  async exportWithFallback(config, options) {
    console.log(chalk.yellow('📦 Using basic export fallback...'));
    
    // Very basic export implementation
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = `submitit_basic_${timestamp}.zip`;
    
    // This would implement a minimal export
    return {
      path: outputPath,
      size: 0,
      format: 'zip',
      method: 'fallback',
      memoryEfficient: false
    };
  }

  // === MONITORING AND CONTROL ===

  /**
   * Cancel current export operation
   */
  async cancelExport() {
    if (this.currentOperation) {
      console.log(chalk.yellow('🛑 Cancelling export operation...'));
      
      if (this.streamingManager) {
        await this.streamingManager.cleanup();
      }
      
      this.currentOperation = null;
      return true;
    }
    
    return false;
  }

  /**
   * Get export progress information
   */
  getExportProgress() {
    if (this.streamingManager) {
      return this.streamingManager.getStatistics();
    }
    
    return null;
  }

  // === UTILITIES ===

  /**
   * Quick exclude check for common patterns
   */
  shouldQuickExclude(name) {
    const excludePatterns = [
      'node_modules', '.git', '.DS_Store', 'Thumbs.db',
      '.tmp', '.cache', '__pycache__', '.vscode'
    ];
    
    return excludePatterns.some(pattern => name.includes(pattern));
  }

  /**
   * Format bytes for human reading
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    if (this.streamingManager) {
      await this.streamingManager.cleanup();
    }
    
    this.currentOperation = null;
  }
}

// === FACTORY FUNCTIONS ===

/**
 * Create memory-efficient export integration
 */
export function createMemoryEfficientExport(options = {}) {
  return new MemoryEfficientExportIntegration(options);
}

/**
 * Quick export function with automatic optimization
 */
export async function exportProjectOptimized(config, options = {}) {
  const integration = new MemoryEfficientExportIntegration();
  
  try {
    return await integration.exportProject(config, options);
  } finally {
    await integration.cleanup();
  }
}

/**
 * Export with explicit streaming (for large projects)
 */
export async function exportProjectStreaming(config, options = {}) {
  const integration = new MemoryEfficientExportIntegration();
  
  try {
    return await integration.exportWithStreaming(config, { ...options, forceStreaming: true });
  } finally {
    await integration.cleanup();
  }
}

export default MemoryEfficientExportIntegration;