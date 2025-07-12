/**
 * Streaming Package Manager - Memory-Efficient Export Integration
 * 
 * Integrates StreamingFileOperations with PackageManager for memory-efficient
 * exports of large projects. Uses streaming operations to minimize memory usage
 * during archive creation and file processing.
 */

import { StreamingFileOperations } from './StreamingFileOperations.js';
import { PackageManager } from './PackageManager.js';
import { createReadStream, createWriteStream, promises as fs } from 'fs';
import { join, relative, dirname, basename } from 'path';
import { EventEmitter } from 'events';
import chalk from 'chalk';

export class StreamingPackageManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      chunkSize: 64 * 1024, // 64KB chunks
      maxConcurrency: 4,
      compressionLevel: 6,
      enableProgress: true,
      enableDeduplication: false,
      enableIntegrityCheck: true,
      tempDir: options.tempDir || '/tmp/submitit-streaming',
      ...options
    };
    
    this.streamingOps = new StreamingFileOperations(this.options);
    this.basePackageManager = new PackageManager();
    
    this.statistics = {
      totalFiles: 0,
      totalSize: 0,
      processedFiles: 0,
      processedSize: 0,
      duplicatesRemoved: 0,
      compressionRatio: 0,
      startTime: Date.now()
    };
  }

  // === MEMORY-EFFICIENT EXPORT ===

  /**
   * Export project using streaming operations for memory efficiency
   */
  async exportProjectStreaming(config, options = {}) {
    const startTime = Date.now();
    this.statistics.startTime = startTime;
    
    console.log(chalk.blue('🚀 Starting streaming export...'));
    
    try {
      // Phase 1: Analyze project structure
      const projectAnalysis = await this.analyzeProjectStructure(config);
      this.statistics.totalFiles = projectAnalysis.totalFiles;
      this.statistics.totalSize = projectAnalysis.totalSize;
      
      this.emit('analysis-complete', projectAnalysis);
      
      // Phase 2: Prepare streaming pipeline
      const pipeline = await this.createStreamingPipeline(config, options);
      
      // Phase 3: Execute streaming export
      const result = await this.executeStreamingExport(pipeline, options);
      
      // Phase 4: Generate final package
      const packageResult = await this.finalizePackage(result, options);
      
      const duration = Date.now() - startTime;
      this.statistics.duration = duration;
      
      console.log(chalk.green(`✅ Streaming export completed in ${this.formatDuration(duration)}`));
      
      this.emit('export-complete', {
        ...packageResult,
        statistics: this.getStatistics()
      });
      
      return packageResult;
      
    } catch (error) {
      console.error(chalk.red('❌ Streaming export failed:'), error.message);
      this.emit('export-error', error);
      throw error;
    }
  }

  // === PROJECT ANALYSIS ===

  /**
   * Analyze project structure for memory-efficient processing
   */
  async analyzeProjectStructure(config) {
    console.log(chalk.cyan('📊 Analyzing project structure...'));
    
    const analysis = {
      files: [],
      directories: [],
      totalSize: 0,
      totalFiles: 0,
      largeFiles: [],
      duplicates: [],
      distribution: {
        small: 0,    // < 1MB
        medium: 0,   // 1MB - 10MB
        large: 0,    // 10MB - 100MB
        huge: 0      // > 100MB
      }
    };

    const contentDir = join(process.cwd(), 'content');
    
    // Recursively analyze directory structure
    const analyzeDirectory = async (dirPath, basePath = '') => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dirPath, entry.name);
          const relativePath = join(basePath, entry.name);
          
          if (this.basePackageManager.shouldExclude(fullPath)) {
            continue;
          }
          
          if (entry.isDirectory()) {
            analysis.directories.push(relativePath);
            await analyzeDirectory(fullPath, relativePath);
          } else {
            const stats = await fs.stat(fullPath);
            const fileInfo = {
              path: fullPath,
              relativePath,
              size: stats.size,
              modified: stats.mtime,
              type: this.getFileType(entry.name)
            };
            
            analysis.files.push(fileInfo);
            analysis.totalSize += stats.size;
            analysis.totalFiles++;
            
            // Categorize by size
            if (stats.size < 1024 * 1024) {
              analysis.distribution.small++;
            } else if (stats.size < 10 * 1024 * 1024) {
              analysis.distribution.medium++;
            } else if (stats.size < 100 * 1024 * 1024) {
              analysis.distribution.large++;
            } else {
              analysis.distribution.huge++;
              analysis.largeFiles.push(fileInfo);
            }
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not analyze directory ${dirPath}:`, error.message);
      }
    };

    await analyzeDirectory(contentDir);
    
    // Detect duplicates if enabled
    if (this.options.enableDeduplication) {
      analysis.duplicates = await this.detectDuplicateFiles(analysis.files);
    }
    
    console.log(chalk.green(`📈 Analysis complete: ${analysis.totalFiles} files, ${this.formatBytes(analysis.totalSize)}`));
    
    return analysis;
  }

  // === STREAMING PIPELINE ===

  /**
   * Create streaming pipeline for efficient processing
   */
  async createStreamingPipeline(config, options) {
    const pipeline = {
      stages: [],
      files: [],
      metadata: {
        config,
        options,
        timestamp: new Date().toISOString()
      }
    };

    // Stage 1: File validation and filtering
    pipeline.stages.push({
      name: 'validation',
      processor: async (fileInfo) => {
        if (this.options.enableIntegrityCheck) {
          const hash = await this.streamingOps.calculateFileHash(fileInfo.path);
          fileInfo.hash = hash;
        }
        return fileInfo;
      }
    });

    // Stage 2: Deduplication (if enabled)
    if (this.options.enableDeduplication) {
      pipeline.stages.push({
        name: 'deduplication',
        processor: async (fileInfo) => {
          return this.processDuplicateFile(fileInfo);
        }
      });
    }

    // Stage 3: Compression preparation
    pipeline.stages.push({
      name: 'compression-prep',
      processor: async (fileInfo) => {
        fileInfo.compressionStrategy = this.selectCompressionStrategy(fileInfo);
        return fileInfo;
      }
    });

    return pipeline;
  }

  // === STREAMING EXECUTION ===

  /**
   * Execute streaming export with memory efficiency
   */
  async executeStreamingExport(pipeline, options) {
    const outputPath = this.generateOutputPath(options);
    const format = options.format || 'zip';
    
    console.log(chalk.blue(`📦 Creating ${format.toUpperCase()} archive: ${basename(outputPath)}`));

    // Create streaming archive
    const archiveStream = await this.streamingOps.createArchiveStream(outputPath, format);
    
    // Process project structure
    const projectStructure = await this.createProjectStructure(pipeline.metadata.config);
    
    // Add files using streaming operations
    let processedCount = 0;
    const totalFiles = this.statistics.totalFiles;
    
    // Process files in batches for memory efficiency
    const batchSize = Math.min(this.options.maxConcurrency, 10);
    const contentDir = join(process.cwd(), 'content');
    
    await this.processDirectoryStreaming(
      contentDir,
      'content/',
      archiveStream,
      {
        onProgress: (progress) => {
          processedCount++;
          this.statistics.processedFiles = processedCount;
          this.statistics.processedSize += progress.size || 0;
          
          const percentage = Math.round((processedCount / totalFiles) * 100);
          
          this.emit('file-processed', {
            file: progress.file,
            progress: processedCount,
            total: totalFiles,
            percentage,
            size: progress.size
          });
          
          if (this.options.enableProgress) {
            this.showProgress(processedCount, totalFiles, progress.file);
          }
        }
      }
    );

    // Add project metadata
    await this.addProjectMetadata(archiveStream, projectStructure);
    
    // Finalize archive
    await this.finalizeArchiveStream(archiveStream);
    
    return {
      outputPath,
      totalFiles: this.statistics.totalFiles,
      processedFiles: this.statistics.processedFiles,
      originalSize: this.statistics.totalSize,
      compressedSize: await this.getFileSize(outputPath),
      format
    };
  }

  // === DIRECTORY PROCESSING ===

  /**
   * Process directory using streaming operations
   */
  async processDirectoryStreaming(sourcePath, archivePath, archiveStream, options = {}) {
    try {
      const entries = await fs.readdir(sourcePath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(sourcePath, entry.name);
        const archiveFilePath = join(archivePath, entry.name);
        
        if (this.basePackageManager.shouldExclude(fullPath)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          // Recursively process subdirectories
          await this.processDirectoryStreaming(
            fullPath,
            archiveFilePath,
            archiveStream,
            options
          );
        } else {
          // Stream file to archive
          await this.streamFileToArchive(
            fullPath,
            archiveFilePath,
            archiveStream,
            options
          );
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not process directory ${sourcePath}:`, error.message);
    }
  }

  /**
   * Stream individual file to archive with memory efficiency
   */
  async streamFileToArchive(filePath, archivePath, archiveStream, options = {}) {
    try {
      const stats = await fs.stat(filePath);
      
      // Create read stream with optimal chunk size
      const readStream = createReadStream(filePath, {
        highWaterMark: this.streamingOps.options.chunkSize
      });
      
      // Add progress monitoring if enabled
      let processedBytes = 0;
      const progressStream = new (require('stream').Transform)({
        transform(chunk, encoding, callback) {
          processedBytes += chunk.length;
          this.push(chunk);
          callback();
        }
      });
      
      // Pipe to archive
      readStream.pipe(progressStream);
      archiveStream.archive.append(progressStream, { 
        name: archivePath,
        date: stats.mtime
      });
      
      // Report progress
      if (options.onProgress) {
        options.onProgress({
          file: archivePath,
          size: stats.size,
          processed: processedBytes
        });
      }
      
    } catch (error) {
      console.warn(`Warning: Could not stream file ${filePath}:`, error.message);
      throw error;
    }
  }

  // === PROJECT METADATA ===

  /**
   * Create project structure for archive
   */
  async createProjectStructure(config) {
    return {
      manifest: this.basePackageManager.generateManifest(config),
      readme: this.basePackageManager.generateReadme(config),
      config: config,
      layout: await this.loadLayoutConfig(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Add project metadata to archive
   */
  async addProjectMetadata(archiveStream, projectStructure) {
    // Add manifest
    archiveStream.archive.append(
      JSON.stringify(projectStructure.manifest, null, 2),
      { name: 'manifest.json' }
    );
    
    // Add README
    archiveStream.archive.append(
      projectStructure.readme,
      { name: 'README.md' }
    );
    
    // Add configuration files
    try {
      const configPath = join(process.cwd(), 'submitit.config.json');
      const configStream = createReadStream(configPath);
      archiveStream.archive.append(configStream, { name: 'submitit.config.json' });
    } catch (error) {
      console.warn('Config file not found, skipping...');
    }
    
    try {
      const layoutPath = join(process.cwd(), 'layout.json');
      const layoutStream = createReadStream(layoutPath);
      archiveStream.archive.append(layoutStream, { name: 'layout.json' });
    } catch (error) {
      console.warn('Layout file not found, skipping...');
    }
  }

  // === DUPLICATE DETECTION ===

  /**
   * Detect duplicate files using streaming hash calculation
   */
  async detectDuplicateFiles(files) {
    console.log(chalk.cyan('🔍 Detecting duplicate files...'));
    
    const hashMap = new Map();
    const duplicates = [];
    
    // Process files in batches to control memory usage
    const batchSize = 20;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (file) => {
        try {
          const hash = await this.streamingOps.calculateFileHash(file.path);
          
          if (hashMap.has(hash)) {
            duplicates.push({
              original: hashMap.get(hash),
              duplicate: file,
              hash
            });
          } else {
            hashMap.set(hash, file);
          }
        } catch (error) {
          console.warn(`Warning: Could not hash file ${file.path}:`, error.message);
        }
      }));
    }
    
    console.log(chalk.yellow(`Found ${duplicates.length} duplicate files`));
    return duplicates;
  }

  /**
   * Process duplicate file (skip or include based on options)
   */
  async processDuplicateFile(fileInfo) {
    // Implementation depends on deduplication strategy
    // For now, we'll just mark duplicates but still include them
    return fileInfo;
  }

  // === COMPRESSION OPTIMIZATION ===

  /**
   * Select optimal compression strategy based on file type
   */
  selectCompressionStrategy(fileInfo) {
    const ext = fileInfo.path.split('.').pop()?.toLowerCase();
    
    // Already compressed formats - use store mode
    const preCompressed = ['jpg', 'jpeg', 'png', 'gif', 'zip', '7z', 'rar', 'mp3', 'mp4', 'mov'];
    if (preCompressed.includes(ext)) {
      return 'store';
    }
    
    // Text files - use maximum compression
    const textFiles = ['txt', 'md', 'js', 'css', 'html', 'json', 'xml', 'csv'];
    if (textFiles.includes(ext)) {
      return 'maximum';
    }
    
    // Default - balanced compression
    return 'normal';
  }

  // === FINALIZATION ===

  /**
   * Finalize archive stream
   */
  async finalizeArchiveStream(archiveStream) {
    return new Promise((resolve, reject) => {
      archiveStream.archive.on('end', resolve);
      archiveStream.archive.on('error', reject);
      archiveStream.finalize();
    });
  }

  /**
   * Finalize package creation
   */
  async finalizePackage(result, options) {
    const stats = await fs.stat(result.outputPath);
    
    this.statistics.compressionRatio = result.originalSize > 0 
      ? stats.size / result.originalSize 
      : 1;
    
    const finalResult = {
      ...result,
      size: stats.size,
      compressionRatio: this.statistics.compressionRatio,
      savings: result.originalSize - stats.size,
      statistics: this.getStatistics()
    };
    
    console.log(chalk.green('📈 Final Statistics:'));
    console.log(chalk.gray(`   Original size: ${this.formatBytes(result.originalSize)}`));
    console.log(chalk.gray(`   Compressed size: ${this.formatBytes(stats.size)}`));
    console.log(chalk.gray(`   Compression ratio: ${(this.statistics.compressionRatio * 100).toFixed(1)}%`));
    console.log(chalk.gray(`   Space saved: ${this.formatBytes(finalResult.savings)}`));
    
    return finalResult;
  }

  // === UTILITIES ===

  /**
   * Generate output path based on options
   */
  generateOutputPath(options) {
    const outputDir = options.outputPath || join(process.cwd(), 'output');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const format = options.format || 'zip';
    
    const filename = options.customName 
      ? `${options.customName}.${format}`
      : `submitit_streaming_${timestamp}.${format}`;
    
    return join(outputDir, filename);
  }

  /**
   * Load layout configuration
   */
  async loadLayoutConfig() {
    try {
      const layoutPath = join(process.cwd(), 'layout.json');
      const content = await fs.readFile(layoutPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get file size
   */
  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get file type from extension
   */
  getFileType(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    const typeMap = {
      'js': 'javascript',
      'ts': 'typescript',
      'css': 'stylesheet',
      'html': 'markup',
      'md': 'markdown',
      'json': 'data',
      'jpg': 'image',
      'png': 'image',
      'gif': 'image',
      'mp4': 'video',
      'mp3': 'audio',
      'pdf': 'document',
      'zip': 'archive'
    };
    
    return typeMap[ext] || 'file';
  }

  /**
   * Show progress to console
   */
  showProgress(current, total, currentFile) {
    const percentage = Math.round((current / total) * 100);
    const progressBar = '█'.repeat(Math.floor(percentage / 2));
    const emptyBar = '░'.repeat(50 - Math.floor(percentage / 2));
    
    process.stdout.write(
      `\r${chalk.cyan('Progress:')} [${progressBar}${emptyBar}] ${percentage}% (${current}/${total}) ${chalk.gray(basename(currentFile))}`
    );
    
    if (current === total) {
      process.stdout.write('\n');
    }
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
   * Format duration for human reading
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Get comprehensive statistics
   */
  getStatistics() {
    const elapsed = Date.now() - this.statistics.startTime;
    
    return {
      ...this.statistics,
      elapsedTime: elapsed,
      throughput: elapsed > 0 ? this.statistics.processedSize / (elapsed / 1000) : 0,
      filesPerSecond: elapsed > 0 ? this.statistics.processedFiles / (elapsed / 1000) : 0,
      efficiency: this.statistics.totalFiles > 0 
        ? (this.statistics.processedFiles / this.statistics.totalFiles) * 100 
        : 0
    };
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    await this.streamingOps.cleanup();
    
    // Clean up any temporary files
    try {
      const tempExists = await fs.access(this.options.tempDir).then(() => true).catch(() => false);
      if (tempExists) {
        await fs.rmdir(this.options.tempDir, { recursive: true });
      }
    } catch (error) {
      console.warn('Warning: Could not clean up temp directory:', error.message);
    }
  }
}

// === FACTORY FUNCTION ===

/**
 * Create streaming package manager with optimal settings
 */
export function createStreamingPackageManager(options = {}) {
  return new StreamingPackageManager({
    enableProgress: true,
    enableDeduplication: false, // Disable by default for performance
    enableIntegrityCheck: true,
    maxConcurrency: 4,
    compressionLevel: 6,
    ...options
  });
}

export default StreamingPackageManager;