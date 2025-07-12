import { readFile, stat, writeFile, readFile as readFileSync } from 'fs/promises';
import { extname, join } from 'path';
import { createHash } from 'crypto';
import chalk from 'chalk';

export class SmartFileHandlerSimple {
  constructor() {
    this.processingStats = {
      totalFiles: 0,
      processedFiles: 0,
      processingTime: 0,
      fileTypes: new Map(),
      cacheHits: 0,
      cacheMisses: 0
    };
    
    // Ninja-style dependency tracking
    this.fileCache = new Map(); // filePath -> { hash, result, timestamp }
    this.dependencyGraph = new Map(); // filePath -> [dependencies]
    
    // Performance optimization
    this.batchSize = 10; // Process files in batches
    this.incrementalMode = true;
  }

  async processFiles(files, options = {}) {
    console.log(chalk.green('🎼 Smart file orchestration started...'));
    console.log(chalk.blue(`📊 Ninja-style incremental processing: ${this.incrementalMode ? 'ON' : 'OFF'}`));
    
    const startTime = Date.now();
    this.processingStats.totalFiles = files.length;
    
    // Load existing cache
    await this.loadCache();
    
    const results = [];
    
    // Process files in batches for better performance
    for (let i = 0; i < files.length; i += this.batchSize) {
      const batch = files.slice(i, i + this.batchSize);
      console.log(chalk.yellow(`📦 Processing batch ${Math.floor(i/this.batchSize) + 1}/${Math.ceil(files.length/this.batchSize)} (${batch.length} files)`));
      
      const batchPromises = batch.map(async (file) => {
        try {
          const filePath = typeof file === 'string' ? file : file.path;
          const result = await this.processFileWithCaching(filePath, options);
          this.processingStats.processedFiles++;
          
          // Track file types
          const fileType = result.type || 'unknown';
          this.processingStats.fileTypes.set(fileType, (this.processingStats.fileTypes.get(fileType) || 0) + 1);
          
          return result;
        } catch (error) {
          console.error(chalk.red(`❌ Error processing file:`, error.message));
          return {
            file: typeof file === 'string' ? file : file.path,
            success: false,
            error: error.message
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    this.processingStats.processingTime = Date.now() - startTime;
    
    // Save cache for next run
    await this.saveCache();
    
    console.log(chalk.green(`✅ Processing complete: ${this.processingStats.cacheHits} cache hits, ${this.processingStats.cacheMisses} cache misses`));
    
    return results;
  }

  async processFileWithCaching(filePath, options) {
    const fileStats = await stat(filePath);
    const fileHash = await this.calculateFileHash(filePath);
    
    // Check cache first (Ninja-style dependency checking)
    if (this.incrementalMode && this.fileCache.has(filePath)) {
      const cached = this.fileCache.get(filePath);
      if (cached.hash === fileHash && cached.timestamp >= fileStats.mtime) {
        this.processingStats.cacheHits++;
        console.log(chalk.gray(`💾 Cache hit: ${filePath}`));
        return { ...cached.result, cached: true };
      }
    }
    
    // Process file and cache result
    this.processingStats.cacheMisses++;
    const result = await this.processFile(filePath, options);
    
    // Cache the result
    this.fileCache.set(filePath, {
      hash: fileHash,
      result: result,
      timestamp: Date.now()
    });
    
    return { ...result, cached: false };
  }

  async calculateFileHash(filePath) {
    const content = await readFile(filePath);
    return createHash('md5').update(content).digest('hex');
  }

  async loadCache() {
    try {
      const cacheFile = join(process.cwd(), '.submitit', 'file-cache.json');
      const cacheData = await readFile(cacheFile, 'utf8');
      const cache = JSON.parse(cacheData);
      
      this.fileCache = new Map(cache.files || []);
      console.log(chalk.blue(`📦 Loaded ${this.fileCache.size} cached file results`));
    } catch (error) {
      // Cache file doesn't exist or is invalid, start fresh
      console.log(chalk.gray('📦 No cache found, starting fresh'));
    }
  }

  async saveCache() {
    try {
      const cacheFile = join(process.cwd(), '.submitit', 'file-cache.json');
      const cacheData = {
        version: '1.0.0',
        timestamp: Date.now(),
        files: Array.from(this.fileCache.entries())
      };
      
      await writeFile(cacheFile, JSON.stringify(cacheData, null, 2));
      console.log(chalk.blue(`💾 Saved ${this.fileCache.size} file results to cache`));
    } catch (error) {
      console.log(chalk.yellow('⚠️ Failed to save cache:', error.message));
    }
  }

  async processFile(filePath, options) {
    const ext = extname(filePath).toLowerCase();
    const stats = await stat(filePath);
    
    let processingResult = {
      file: filePath,
      success: true,
      size: stats.size,
      lastModified: stats.mtime,
      type: this.getFileType(ext)
    };
    
    // Smart processing based on file type
    switch (ext) {
      case '.js':
        processingResult = { ...processingResult, ...(await this.processJavaScript(filePath)) };
        break;
      case '.json':
        processingResult = { ...processingResult, ...(await this.processJSON(filePath)) };
        break;
      case '.md':
        processingResult = { ...processingResult, ...(await this.processMarkdown(filePath)) };
        break;
      case '.css':
        processingResult = { ...processingResult, ...(await this.processCSS(filePath)) };
        break;
      case '.html':
        processingResult = { ...processingResult, ...(await this.processHTML(filePath)) };
        break;
      default:
        processingResult = { ...processingResult, ...(await this.processGeneric(filePath)) };
    }
    
    return processingResult;
  }

  getFileType(ext) {
    const typeMap = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.json': 'json',
      '.md': 'markdown',
      '.css': 'css',
      '.html': 'html',
      '.jpg': 'image',
      '.jpeg': 'image',
      '.png': 'image',
      '.gif': 'image',
      '.svg': 'image',
      '.pdf': 'document',
      '.txt': 'text',
      '.zip': 'archive',
      '.tar': 'archive',
      '.rar': 'archive'
    };
    
    return typeMap[ext] || 'generic';
  }

  async processJavaScript(filePath) {
    try {
      const content = await readFile(filePath, 'utf8');
      const lines = content.split('\n').length;
      const functions = (content.match(/function\s+\w+/g) || []).length;
      const imports = (content.match(/import.*from/g) || []).length;
      const exports = (content.match(/export/g) || []).length;
      
      return {
        lines,
        functions,
        imports,
        exports,
        complexity: Math.round(functions / lines * 100) || 0
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async processJSON(filePath) {
    try {
      const content = await readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      const keys = Object.keys(data).length;
      
      return {
        keys,
        valid: true,
        size: Buffer.byteLength(content)
      };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message 
      };
    }
  }

  async processMarkdown(filePath) {
    try {
      const content = await readFile(filePath, 'utf8');
      const headers = (content.match(/^#+\s+/gm) || []).length;
      const links = (content.match(/\[.*\]\(.*\)/g) || []).length;
      const images = (content.match(/!\[.*\]\(.*\)/g) || []).length;
      const words = content.split(/\s+/).length;
      
      return {
        headers,
        links,
        images,
        words,
        readingTime: Math.ceil(words / 200) // Approximate reading time in minutes
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async processCSS(filePath) {
    try {
      const content = await readFile(filePath, 'utf8');
      const rules = (content.match(/[^{}]+\{[^}]*\}/g) || []).length;
      const selectors = (content.match(/[^{}]+(?=\{)/g) || []).length;
      
      return {
        rules,
        selectors,
        size: Buffer.byteLength(content)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async processHTML(filePath) {
    try {
      const content = await readFile(filePath, 'utf8');
      const elements = (content.match(/<\w+/g) || []).length;
      const links = (content.match(/<a\s+[^>]*href/g) || []).length;
      const images = (content.match(/<img\s+[^>]*src/g) || []).length;
      
      return {
        elements,
        links,
        images,
        size: Buffer.byteLength(content)
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async processGeneric(filePath) {
    return {
      processed: true,
      extension: extname(filePath)
    };
  }

  getPerformanceStats() {
    const cacheEfficiency = this.processingStats.cacheHits + this.processingStats.cacheMisses > 0 
      ? (this.processingStats.cacheHits / (this.processingStats.cacheHits + this.processingStats.cacheMisses)) * 100 
      : 0;
      
    return {
      totalFiles: this.processingStats.totalFiles,
      processedFiles: this.processingStats.processedFiles,
      processingTime: this.processingStats.processingTime,
      fileTypeBreakdown: Object.fromEntries(this.processingStats.fileTypes),
      successRate: this.processingStats.processedFiles / this.processingStats.totalFiles * 100,
      ninjaStyle: {
        cacheHits: this.processingStats.cacheHits,
        cacheMisses: this.processingStats.cacheMisses,
        cacheEfficiency: Math.round(cacheEfficiency),
        incrementalMode: this.incrementalMode,
        batchSize: this.batchSize,
        averageTimePerFile: this.processingStats.processingTime / this.processingStats.processedFiles
      }
    };
  }

  // Ninja-style dependency management
  addDependency(filePath, dependencyPath) {
    if (!this.dependencyGraph.has(filePath)) {
      this.dependencyGraph.set(filePath, []);
    }
    this.dependencyGraph.get(filePath).push(dependencyPath);
  }

  invalidateDependentFiles(filePath) {
    // Find all files that depend on this file and invalidate their cache
    for (const [file, dependencies] of this.dependencyGraph) {
      if (dependencies.includes(filePath)) {
        this.fileCache.delete(file);
        console.log(chalk.yellow(`🔄 Invalidated dependent file: ${file}`));
      }
    }
  }

  // Performance optimization methods
  setBatchSize(size) {
    this.batchSize = Math.max(1, Math.min(50, size)); // Limit between 1-50
    console.log(chalk.blue(`📦 Batch size set to: ${this.batchSize}`));
  }

  setIncrementalMode(enabled) {
    this.incrementalMode = enabled;
    console.log(chalk.blue(`🔄 Incremental mode: ${enabled ? 'ENABLED' : 'DISABLED'}`));
  }

  clearCache() {
    this.fileCache.clear();
    this.dependencyGraph.clear();
    console.log(chalk.yellow('🗑️ Cache cleared'));
  }
}